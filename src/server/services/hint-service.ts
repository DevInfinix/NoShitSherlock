import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { gameSessions, hintRequests, hints } from "@/db/schema";
import { verifySessionAccess } from "./game-session-service";

export class HintError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
  ) {
    super(message);
    this.name = "HintError";
  }
}

export interface RequestHintParams {
  sessionId: number;
  questionId: number;
  hintId: number;
  userId: string;
}

export interface RequestHintResult {
  hintId: number;
  hintText: string;
  costPoints: number;
  isAlreadyUnlocked: boolean;
  score: number;
  hintBalance: number;
}

/**
 * Server-authoritative hint unlock engine.
 * Unlocks a hint for the squad/player, deducts points (clamped >= 0),
 * and records the request in `hint_requests`.
 */
export async function requestHint({
  sessionId,
  questionId,
  hintId,
  userId,
}: RequestHintParams): Promise<RequestHintResult> {
  // 1. Verify access
  await verifySessionAccess(sessionId, userId);

  return await db.transaction(async (tx) => {
    // Check if hint was already unlocked
    const [existingRequest] = await tx
      .select()
      .from(hintRequests)
      .where(and(eq(hintRequests.sessionId, sessionId), eq(hintRequests.hintId, hintId)))
      .limit(1);

    const [hintRecord] = await tx
      .select()
      .from(hints)
      .where(and(eq(hints.id, hintId), eq(hints.questionId, questionId)))
      .limit(1);

    if (!hintRecord) {
      throw new HintError("Hint not found for this deduction.", 404);
    }

    const [session] = await tx
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .for("update");

    if (!session) {
      throw new HintError("Session not found.", 404);
    }

    if (session.status !== "IN_PROGRESS") {
      throw new HintError("Investigation is no longer active.", 400);
    }

    if (existingRequest) {
      return {
        hintId: hintRecord.id,
        hintText: hintRecord.hintText,
        costPoints: 0,
        isAlreadyUnlocked: true,
        score: session.score,
        hintBalance: session.hintBalance,
      };
    }

    // Deduct cost (clamped to 0)
    const newScore = Math.max(0, session.score - hintRecord.costPoints);
    const newHintBalance = Math.max(0, session.hintBalance - hintRecord.costPoints);

    // Record request
    await tx.insert(hintRequests).values({
      sessionId,
      hintId,
      costPoints: hintRecord.costPoints,
    });

    // Update session score & balance
    await tx
      .update(gameSessions)
      .set({
        score: newScore,
        hintBalance: newHintBalance,
      })
      .where(eq(gameSessions.id, sessionId));

    return {
      hintId: hintRecord.id,
      hintText: hintRecord.hintText,
      costPoints: hintRecord.costPoints,
      isAlreadyUnlocked: false,
      score: newScore,
      hintBalance: newHintBalance,
    };
  });
}
