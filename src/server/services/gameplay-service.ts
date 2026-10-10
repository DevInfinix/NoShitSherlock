import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  clues,
  gameSessions,
  questionClues,
  questionOptions,
  questions,
  sessionAnswers,
  sessionClues,
  sessionQuestionStates,
} from "@/db/schema";
import { verifySessionAccess } from "./game-session-service";

export class GameplayError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "GameplayError";
  }
}

export interface SubmitAnswerParams {
  sessionId: number;
  questionId: number;
  userId: string;
  submittedAnswer: string;
  timeTakenMs?: number;
}

export interface SubmitAnswerResult {
  isCorrect: boolean;
  attemptsUsed: number;
  maxAttempts: number;
  isSolved: boolean;
  score: number;
  wrongAttempts: number;
  unlockedClues: Array<{
    id: number;
    clueKey: string;
    title: string;
    clueText: string;
    chronologicalOrder: number;
  }>;
}

const MINIMUM_ATTEMPT_INTERVAL_MS = 1500; // Anti-spam interval

/**
 * Normalizes a string answer for comparison:
 * lowercase, trimmed, collapse internal whitespace.
 */
function normalizeAnswer(val: string): string {
  return val.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Validates a submitted answer against the authoritative question definition.
 * Runs inside the database transaction.
 */
async function checkAnswerAuthoritative(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  question: typeof questions.$inferSelect,
  submittedAnswer: string,
): Promise<boolean> {
  const normSubmitted = normalizeAnswer(submittedAnswer);

  switch (question.questionType) {
    case "MCQ": {
      // Find the correct option for this question
      const correctOpts = await tx
        .select()
        .from(questionOptions)
        .where(
          and(eq(questionOptions.questionId, question.id), eq(questionOptions.isCorrect, true)),
        );

      if (correctOpts.length === 0) {
        return false;
      }

      // Check if submittedAnswer matches option id or option text
      return correctOpts.some(
        (opt) =>
          String(opt.id) === submittedAnswer.trim() ||
          normalizeAnswer(opt.optionText) === normSubmitted,
      );
    }

    case "TRUE_FALSE": {
      if (!question.correctAnswer) return false;
      const expected = normalizeAnswer(question.correctAnswer);
      return normSubmitted === expected;
    }

    default: {
      if (!question.correctAnswer) return false;
      const expected = normalizeAnswer(question.correctAnswer);
      if (normSubmitted === expected) return true;

      // Check accepted variants from metadata
      if (
        question.metadata &&
        typeof question.metadata === "object" &&
        Array.isArray((question.metadata as { acceptedVariants?: string[] }).acceptedVariants)
      ) {
        const variants = (question.metadata as { acceptedVariants: string[] }).acceptedVariants;
        return variants.some((v) => typeof v === "string" && normalizeAnswer(v) === normSubmitted);
      }

      return false;
    }
  }
}

/**
 * Server-authoritative answer submission executing in a single atomic transaction.
 *
 * Sequence:
 * 1. Verify user's session access (solo or squad member).
 * 2. Ensure question state exists, lock with SELECT ... FOR UPDATE.
 * 3. Enforce business rules: rejection if solved, max attempts exhausted, or rapid spam.
 * 4. Record attempt into session_answers.
 * 5. Update question state: increment attemptsUsed, update lastAttemptAt.
 * 6. On first solve: mark isSolved = true, record solvedAt, award score, unlock linked clues.
 * 7. On wrong answer: increment wrongAttempts, deduct penalty (clamped >= 0).
 */
export async function submitAnswer({
  sessionId,
  questionId,
  userId,
  submittedAnswer,
  timeTakenMs = 0,
}: SubmitAnswerParams): Promise<SubmitAnswerResult> {
  const trimmedAnswer = submittedAnswer.trim();
  if (!trimmedAnswer) {
    throw new GameplayError("Submitted answer cannot be empty.");
  }

  // 1. Verify session access
  await verifySessionAccess(sessionId, userId);

  return await db.transaction(async (tx) => {
    // Lock the session row to ensure atomic score and status updates
    const [lockedSession] = await tx
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .for("update");

    if (!lockedSession) {
      throw new GameplayError("Session not found.", 404);
    }

    if (lockedSession.status !== "IN_PROGRESS") {
      throw new GameplayError("This investigation is no longer active.", 400);
    }

    // Fetch the question definition
    const [question] = await tx
      .select()
      .from(questions)
      .where(eq(questions.id, questionId))
      .limit(1);

    if (!question) {
      throw new GameplayError("Question not found.", 404);
    }

    // 2. Ensure question state exists and lock it
    let [state] = await tx
      .select()
      .from(sessionQuestionStates)
      .where(
        and(
          eq(sessionQuestionStates.sessionId, sessionId),
          eq(sessionQuestionStates.questionId, questionId),
        ),
      )
      .for("update");

    if (!state) {
      // Insert if missing and lock
      await tx
        .insert(sessionQuestionStates)
        .values({
          sessionId,
          questionId,
          attemptsUsed: 0,
          isSolved: false,
        })
        .onConflictDoNothing();

      [state] = await tx
        .select()
        .from(sessionQuestionStates)
        .where(
          and(
            eq(sessionQuestionStates.sessionId, sessionId),
            eq(sessionQuestionStates.questionId, questionId),
          ),
        )
        .for("update");
    }

    if (!state) {
      throw new GameplayError("Failed to lock question state.");
    }

    // 3. Reject if already solved
    if (state.isSolved) {
      throw new GameplayError(
        "This deduction has already been cracked by your squad.",
        400,
        "ALREADY_SOLVED",
      );
    }

    // Reject if max attempts exceeded
    if (state.attemptsUsed >= question.maxAttempts) {
      throw new GameplayError(
        "Maximum investigation attempts exceeded for this clue.",
        400,
        "MAX_ATTEMPTS_EXCEEDED",
      );
    }

    // Anti-spam interval check
    if (state.lastAttemptAt) {
      const elapsed = Date.now() - new Date(state.lastAttemptAt).getTime();
      if (elapsed < MINIMUM_ATTEMPT_INTERVAL_MS) {
        throw new GameplayError(
          "Hold your fire, Detective. Take a moment before submitting another attempt.",
          429,
          "COOLDOWN_ACTIVE",
        );
      }
    }

    // 4. Validate answer
    const isCorrect = await checkAnswerAuthoritative(tx, question, trimmedAnswer);
    const now = new Date();

    // 5. Insert attempt into session_answers
    await tx.insert(sessionAnswers).values({
      sessionId,
      questionId,
      answeredByUserId: userId,
      submittedAnswer: trimmedAnswer,
      isCorrect,
      timeTakenMs: Math.max(0, timeTakenMs),
      hintUsed: false,
    });

    const newAttemptsUsed = state.attemptsUsed + 1;
    let newScore = lockedSession.score;
    let newWrongAttempts = lockedSession.wrongAttempts;
    let unlockedCluesList: SubmitAnswerResult["unlockedClues"] = [];

    if (isCorrect) {
      // 6. On first correct solve
      await tx
        .update(sessionQuestionStates)
        .set({
          attemptsUsed: newAttemptsUsed,
          isSolved: true,
          solvedAt: now,
          lastAttemptAt: now,
        })
        .where(
          and(
            eq(sessionQuestionStates.sessionId, sessionId),
            eq(sessionQuestionStates.questionId, questionId),
          ),
        );

      newScore += question.points;

      await tx
        .update(gameSessions)
        .set({
          score: newScore,
        })
        .where(eq(gameSessions.id, sessionId));

      // Unlock linked clues
      const linkedClues = await tx
        .select({ clueId: questionClues.clueId })
        .from(questionClues)
        .where(eq(questionClues.questionId, question.id));

      if (linkedClues.length > 0) {
        for (const link of linkedClues) {
          await tx
            .insert(sessionClues)
            .values({
              sessionId,
              clueId: link.clueId,
              sourceQuestionId: question.id,
              unlockedAt: now,
            })
            .onConflictDoNothing();
        }

        // Return details of newly unlocked clues
        const clueIds = linkedClues.map((l) => l.clueId);
        unlockedCluesList = await tx
          .select({
            id: clues.id,
            clueKey: clues.clueKey,
            title: clues.title,
            clueText: clues.clueText,
            chronologicalOrder: clues.chronologicalOrder,
          })
          .from(clues)
          .where(sql`${clues.id} IN ${clueIds}`);
      }
    } else {
      // 7. On wrong answer
      await tx
        .update(sessionQuestionStates)
        .set({
          attemptsUsed: newAttemptsUsed,
          lastAttemptAt: now,
        })
        .where(
          and(
            eq(sessionQuestionStates.sessionId, sessionId),
            eq(sessionQuestionStates.questionId, questionId),
          ),
        );

      newWrongAttempts += 1;
      newScore = Math.max(0, newScore - question.penaltyPerWrong);

      await tx
        .update(gameSessions)
        .set({
          wrongAttempts: newWrongAttempts,
          score: newScore,
        })
        .where(eq(gameSessions.id, sessionId));
    }

    return {
      isCorrect,
      attemptsUsed: newAttemptsUsed,
      maxAttempts: question.maxAttempts,
      isSolved: isCorrect,
      score: newScore,
      wrongAttempts: newWrongAttempts,
      unlockedClues: unlockedCluesList,
    };
  });
}
