import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { clues, gameSessions, users } from "@/db/schema";
import { startOrResumeSession } from "@/server/services/game-session-service";
import { getPinboardDossier, submitPinboard } from "@/server/services/pinboard-service";

describe("Pinboard Validation Engine", () => {
  const timestamp = Date.now();
  const testDetective = `det_pin_${timestamp}`;
  let sessionId: number;

  beforeAll(async () => {
    if (!process.env.DATABASE_URL) return;

    await db.insert(users).values({
      id: testDetective,
      name: "Chief Inspector Lestrade",
      email: `${testDetective}@yard.test`,
      emailVerified: true,
    });

    const { session } = await startOrResumeSession(testDetective, "case-01-missing-ledger");
    sessionId = session.id;
  });

  afterAll(async () => {
    if (!process.env.DATABASE_URL) return;

    if (sessionId) {
      await db.delete(gameSessions).where(eq(gameSessions.id, sessionId));
    }
    await db.delete(users).where(eq(users.id, testDetective));
  });

  it("retrieves pinboard dossier without leaking chronological order", async () => {
    if (!process.env.DATABASE_URL || !sessionId) return;

    const dossier = await getPinboardDossier(sessionId, testDetective);
    expect(dossier.case.title).toBe("The Missing Ledger");
    expect(dossier.isCompleted).toBe(false);

    // Security check: zero leakage of chronological_order
    for (const c of dossier.clues) {
      expect((c as unknown as { chronologicalOrder?: unknown }).chronologicalOrder).toBeUndefined();
    }
  }, 15000);

  it("evaluates wrong chronological sequence, applies penalty, and enforces cooldown", async () => {
    if (!process.env.DATABASE_URL || !sessionId) return;

    const caseClues = await db
      .select({ id: clues.id, chronologicalOrder: clues.chronologicalOrder })
      .from(clues)
      .where(eq(clues.caseId, 1))
      .orderBy(asc(clues.chronologicalOrder));

    expect(caseClues.length).toBeGreaterThanOrEqual(4);

    // Create deliberately inverted order
    const reversedOrder = [...caseClues].reverse().map((c) => c.id);

    const wrongResult = await submitPinboard({
      sessionId,
      userId: testDetective,
      clueOrder: reversedOrder,
    });

    expect(wrongResult.isCorrect).toBe(false);
    expect(wrongResult.isCompleted).toBe(false);
    expect(wrongResult.penaltyApplied).toBe(50);
    expect(wrongResult.scoreAwarded).toBe(0);

    // Rapid re-submission is rejected by anti-bruteforce cooldown
    await expect(
      submitPinboard({
        sessionId,
        userId: testDetective,
        clueOrder: reversedOrder,
      }),
    ).rejects.toThrow(/Patience, Detective/);
  }, 15000);

  it("completes case investigation on correct chronological sequence", async () => {
    if (!process.env.DATABASE_URL || !sessionId) return;

    // Wait past pinboard cooldown (3100ms)
    await new Promise((resolve) => setTimeout(resolve, 3100));

    const caseClues = await db
      .select({ id: clues.id, chronologicalOrder: clues.chronologicalOrder })
      .from(clues)
      .where(eq(clues.caseId, 1))
      .orderBy(asc(clues.chronologicalOrder));

    const correctOrder = caseClues.map((c) => c.id);

    const result = await submitPinboard({
      sessionId,
      userId: testDetective,
      clueOrder: correctOrder,
    });

    expect(result.isCorrect).toBe(true);
    expect(result.isCompleted).toBe(true);
    expect(result.scoreAwarded).toBe(500);
    expect(result.totalTimeSeconds).toBeGreaterThanOrEqual(1);

    // Verify database session status transitioned to COMPLETED
    const [completedSession] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId));

    expect(completedSession?.status).toBe("COMPLETED");
    expect(completedSession?.completedAt).toBeDefined();

    // Re-submission to completed case is rejected
    await expect(
      submitPinboard({
        sessionId,
        userId: testDetective,
        clueOrder: correctOrder,
      }),
    ).rejects.toThrow(/already been successfully solved/);
  }, 15000);
});
