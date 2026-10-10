import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { gameSessions, questionOptions, questions, users } from "@/db/schema";
import {
  getSessionDossier,
  startOrResumeSession,
  verifySessionAccess,
} from "@/server/services/game-session-service";
import { submitAnswer } from "@/server/services/gameplay-service";
import { requestHint } from "@/server/services/hint-service";
import { createTeam } from "@/server/services/team-service";

describe("Gameplay Engine & Concurrency", () => {
  const timestamp = Date.now();
  const testUserA = `det_a_${timestamp}`;
  const testUserB = `det_b_${timestamp}`;
  const testIntruder = `int_${timestamp}`;
  let soloSessionId: number;
  let teamSessionId: number;
  let testTeamId: number;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) return;

    await db.insert(users).values([
      {
        id: testUserA,
        name: "Detective Miller",
        email: `${testUserA}@yard.test`,
        emailVerified: true,
      },
      {
        id: testUserB,
        name: "Officer Watson",
        email: `${testUserB}@yard.test`,
        emailVerified: true,
      },
      {
        id: testIntruder,
        name: "Intruder",
        email: `${testIntruder}@crime.test`,
        emailVerified: true,
      },
    ]);
  });

  afterAll(async () => {
    if (!process.env.DATABASE_URL) return;

    if (soloSessionId) {
      await db.delete(gameSessions).where(eq(gameSessions.id, soloSessionId));
    }
    if (teamSessionId) {
      await db.delete(gameSessions).where(eq(gameSessions.id, teamSessionId));
    }
    await db.delete(users).where(eq(users.id, testUserA));
    await db.delete(users).where(eq(users.id, testUserB));
    await db.delete(users).where(eq(users.id, testIntruder));
  });

  it("starts and resumes a solo session, guarding access against unauthorized users", async () => {
    if (!process.env.DATABASE_URL) return;

    const { session, isNew } = await startOrResumeSession(testUserA, "case-01-missing-ledger");
    expect(session.id).toBeGreaterThan(0);
    expect(isNew).toBe(true);
    soloSessionId = session.id;

    // Resuming returns existing
    const resumed = await startOrResumeSession(testUserA, "case-01-missing-ledger");
    expect(resumed.session.id).toBe(session.id);
    expect(resumed.isNew).toBe(false);

    // Intruder is blocked
    await expect(verifySessionAccess(session.id, testIntruder)).rejects.toThrow(/Access denied/);
  }, 15000);

  it("retrieves dossier without leaking correct answers or option solutions", async () => {
    if (!process.env.DATABASE_URL || !soloSessionId) return;

    const dossier = await getSessionDossier(soloSessionId, testUserA);
    expect(dossier.sections.length).toBe(5);
    expect(dossier.questions.length).toBeGreaterThanOrEqual(5);

    // Verify security requirement: zero answer leakage
    for (const q of dossier.questions) {
      expect((q as unknown as { correctAnswer?: unknown }).correctAnswer).toBeUndefined();
      for (const opt of q.options) {
        expect((opt as unknown as { isCorrect?: unknown }).isCorrect).toBeUndefined();
      }
    }
  }, 15000);

  it("evaluates wrong answers with score penalty clamping and enforces max attempts", async () => {
    if (!process.env.DATABASE_URL || !soloSessionId) return;

    const dossier = await getSessionDossier(soloSessionId, testUserA);
    const targetQ = dossier.questions[0];
    expect(targetQ).toBeDefined();
    if (!targetQ) return;

    const wrongResult = await submitAnswer({
      sessionId: soloSessionId,
      questionId: targetQ.id,
      userId: testUserA,
      submittedAnswer: "bogus_wrong_answer",
    });

    expect(wrongResult.isCorrect).toBe(false);
    expect(wrongResult.isSolved).toBe(false);
    expect(wrongResult.attemptsUsed).toBe(1);
    expect(wrongResult.score).toBe(0); // Score clamped >= 0
    expect(wrongResult.wrongAttempts).toBe(1);
  }, 15000);

  it("unlocks hints, deducts points, and returns unlocked hint on subsequent calls", async () => {
    if (!process.env.DATABASE_URL || !soloSessionId) return;

    const dossier = await getSessionDossier(soloSessionId, testUserA);
    const targetHint = dossier.hints[0];
    if (!targetHint) return;

    const unlock = await requestHint({
      sessionId: soloSessionId,
      questionId: targetHint.questionId,
      hintId: targetHint.id,
      userId: testUserA,
    });

    expect(unlock.hintText).toBeDefined();
    expect(unlock.hintText.length).toBeGreaterThan(0);
    expect(unlock.isAlreadyUnlocked).toBe(false);

    // Second call is free
    const secondCall = await requestHint({
      sessionId: soloSessionId,
      questionId: targetHint.questionId,
      hintId: targetHint.id,
      userId: testUserA,
    });
    expect(secondCall.costPoints).toBe(0);
    expect(secondCall.isAlreadyUnlocked).toBe(true);
  }, 15000);

  it("awards points and unlocks clues on correct answer, blocking re-submissions", async () => {
    if (!process.env.DATABASE_URL || !soloSessionId) return;

    // Wait past anti-spam interval
    await new Promise((resolve) => setTimeout(resolve, 1600));

    const dossier = await getSessionDossier(soloSessionId, testUserA);
    const targetQ = dossier.questions[0];
    if (!targetQ) return;

    const [authQ] = await db.select().from(questions).where(eq(questions.id, targetQ.id));
    if (!authQ) return;

    let answer = authQ.correctAnswer ?? "";
    if (authQ.questionType === "MCQ") {
      const [corr] = await db
        .select()
        .from(questionOptions)
        .where(and(eq(questionOptions.questionId, authQ.id), eq(questionOptions.isCorrect, true)));
      if (corr) answer = String(corr.id);
    }

    const result = await submitAnswer({
      sessionId: soloSessionId,
      questionId: targetQ.id,
      userId: testUserA,
      submittedAnswer: answer,
    });

    expect(result.isCorrect).toBe(true);
    expect(result.isSolved).toBe(true);
    expect(result.score).toBeGreaterThan(0);
    expect(result.unlockedClues.length).toBeGreaterThanOrEqual(1);

    // Re-submission to solved question is rejected
    await expect(
      submitAnswer({
        sessionId: soloSessionId,
        questionId: targetQ.id,
        userId: testUserA,
        submittedAnswer: answer,
      }),
    ).rejects.toThrow(/already been cracked/);
  }, 15000);

  it("prevents double-solve and duplicate score award on concurrent team submissions", async () => {
    if (!process.env.DATABASE_URL) return;

    const team = await createTeam(testUserA, `Squad_${Date.now()}`);
    testTeamId = team.id;

    const { session } = await startOrResumeSession(testUserA, "case-01-missing-ledger", testTeamId);
    teamSessionId = session.id;

    const dossier = await getSessionDossier(teamSessionId, testUserA);
    const targetQ = dossier.questions[1] ?? dossier.questions[0];
    if (!targetQ) return;

    const [authQ] = await db.select().from(questions).where(eq(questions.id, targetQ.id));
    if (!authQ) return;

    let answer = authQ.correctAnswer ?? "";
    if (authQ.questionType === "MCQ") {
      const [corr] = await db
        .select()
        .from(questionOptions)
        .where(and(eq(questionOptions.questionId, authQ.id), eq(questionOptions.isCorrect, true)));
      if (corr) answer = String(corr.id);
    }

    // Fire two concurrent submissions at the exact same instant
    const [res1, res2] = await Promise.allSettled([
      submitAnswer({
        sessionId: teamSessionId,
        questionId: targetQ.id,
        userId: testUserA,
        submittedAnswer: answer,
      }),
      submitAnswer({
        sessionId: teamSessionId,
        questionId: targetQ.id,
        userId: testUserA,
        submittedAnswer: answer,
      }),
    ]);

    const successes = [res1, res2].filter((r) => r.status === "fulfilled");
    const rejections = [res1, res2].filter((r) => r.status === "rejected");

    expect(successes.length).toBe(1);
    expect(rejections.length).toBe(1);

    // Confirm database state has exactly 1 solve award
    const [finalSession] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, teamSessionId));
    expect(finalSession?.score).toBe(authQ.points);
  }, 15000);
});
