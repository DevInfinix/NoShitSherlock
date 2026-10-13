import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  cases,
  clues,
  gameSessions,
  pinboardPlacements,
  pinboardSubmissions,
  sessionClues,
} from "@/db/schema";
import { verifySessionAccess } from "./game-session-service";

export class PinboardError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "PinboardError";
  }
}

export interface SanitizedPinboardClue {
  id: number;
  clueKey: string;
  title: string;
  clueText: string;
  metadata: Record<string, unknown> | null;
}

export interface PinboardCaseFile {
  session: typeof gameSessions.$inferSelect;
  case: {
    id: number;
    slug: string;
    title: string;
    description: string;
  };
  clues: SanitizedPinboardClue[];
  isCompleted: boolean;
  lastSubmission?: {
    isCorrect: boolean;
    submittedAt: Date;
  };
}

export type PinboardDossier = PinboardCaseFile;

export interface SubmitPinboardResult {
  isCorrect: boolean;
  scoreAwarded: number;
  penaltyApplied: number;
  finalScore: number;
  isCompleted: boolean;
  totalTimeSeconds?: number;
  correctPlacementsCount: number;
  totalClues: number;
}

const PINBOARD_RETRY_COOLDOWN_MS = 3000; // 3 seconds anti-bruteforce cooldown
const PINBOARD_SOLVE_BONUS = 500;
const PINBOARD_WRONG_PENALTY = 50;

/**
 * Retrieve clues ready for pinboard arrangement.
 * NEVER leaks `chronological_order` to the client.
 */
export async function getPinboardCaseFile(
  sessionId: number,
  userId: string,
): Promise<PinboardCaseFile> {
  const { session } = await verifySessionAccess(sessionId, userId);

  const [caseRecord] = await db.select().from(cases).where(eq(cases.id, session.caseId)).limit(1);

  if (!caseRecord) {
    throw new PinboardError("Case not found.", 404);
  }

  // Fetch unlocked clues for this session
  let unlockedClueRows = await db
    .select({
      id: clues.id,
      clueKey: clues.clueKey,
      title: clues.title,
      clueText: clues.clueText,
      metadata: clues.metadata,
    })
    .from(sessionClues)
    .innerJoin(clues, eq(sessionClues.clueId, clues.id))
    .where(eq(sessionClues.sessionId, session.id))
    .orderBy(asc(clues.id)); // Order by ID, never chronological order

  // Ensure all case clues are provided so all draggable timeline options are visible
  const allCaseClues = await db
    .select({
      id: clues.id,
      clueKey: clues.clueKey,
      title: clues.title,
      clueText: clues.clueText,
      metadata: clues.metadata,
    })
    .from(clues)
    .where(eq(clues.caseId, caseRecord.id))
    .orderBy(asc(clues.id));

  if (unlockedClueRows.length < allCaseClues.length) {
    unlockedClueRows = allCaseClues;
  }

  // Fetch last submission if exists
  const [lastSub] = await db
    .select()
    .from(pinboardSubmissions)
    .where(eq(pinboardSubmissions.sessionId, session.id))
    .orderBy(pinboardSubmissions.submittedAt)
    .limit(1);

  return {
    session,
    case: {
      id: caseRecord.id,
      slug: caseRecord.slug,
      title: caseRecord.title,
      description: caseRecord.description,
    },
    clues: unlockedClueRows,
    isCompleted: session.status === "COMPLETED",
    lastSubmission: lastSub
      ? {
          isCorrect: lastSub.isCorrect,
          submittedAt: lastSub.submittedAt,
        }
      : undefined,
  };
}

export const getPinboardDossier = getPinboardCaseFile;

/**
 * Validates a submitted clue sequence against authoritative chronological order.
 * Executes atomically in a single database transaction.
 */
export async function submitPinboard({
  sessionId,
  userId,
  clueOrder,
}: {
  sessionId: number;
  userId: string;
  clueOrder: number[]; // Array of clue IDs in placed order (index 0 is position 1)
}): Promise<SubmitPinboardResult> {
  if (!clueOrder || clueOrder.length === 0) {
    throw new PinboardError("Timeline sequence cannot be empty.");
  }

  // Verify access
  await verifySessionAccess(sessionId, userId);

  return await db.transaction(async (tx) => {
    // Lock session row
    const [lockedSession] = await tx
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, sessionId))
      .for("update");

    if (!lockedSession) {
      throw new PinboardError("Investigation session not found.", 404);
    }

    if (lockedSession.status === "COMPLETED") {
      throw new PinboardError(
        "This case has already been successfully solved.",
        400,
        "ALREADY_COMPLETED",
      );
    }

    // Cooldown check on last pinboard attempt
    const recentSubs = await tx
      .select()
      .from(pinboardSubmissions)
      .where(eq(pinboardSubmissions.sessionId, sessionId))
      .orderBy(pinboardSubmissions.submittedAt)
      .limit(1);

    if (recentSubs[0]) {
      const elapsed = Date.now() - new Date(recentSubs[0].submittedAt).getTime();
      if (elapsed < PINBOARD_RETRY_COOLDOWN_MS) {
        throw new PinboardError(
          "Patience, Detective. Review the evidence carefully before re-submitting the sequence.",
          429,
          "COOLDOWN_ACTIVE",
        );
      }
    }

    // Fetch authoritative clues for this case
    const caseClues = await tx
      .select({
        id: clues.id,
        chronologicalOrder: clues.chronologicalOrder,
      })
      .from(clues)
      .where(eq(clues.caseId, lockedSession.caseId))
      .orderBy(asc(clues.chronologicalOrder));

    if (clueOrder.length !== caseClues.length) {
      throw new PinboardError(
        `All ${caseClues.length} case clues must be placed on the pinboard timeline.`,
        400,
      );
    }

    // Verify unique clue IDs
    const uniqueIds = new Set(clueOrder);
    if (uniqueIds.size !== clueOrder.length) {
      throw new PinboardError("Duplicate clues detected on the pinboard timeline.", 400);
    }

    // Map clue ID to authoritative chronological order
    const orderMap = new Map<number, number>();
    for (const c of caseClues) {
      orderMap.set(c.id, c.chronologicalOrder);
    }

    // Validate placements
    let correctPlacementsCount = 0;
    const placementsToInsert: Array<{
      clueId: number;
      placedPosition: number;
      isCorrectPosition: boolean;
    }> = [];

    for (let i = 0; i < clueOrder.length; i++) {
      const clueId = clueOrder[i];
      if (!clueId) continue;
      const expectedOrder = orderMap.get(clueId);

      if (expectedOrder === undefined) {
        throw new PinboardError(`Clue ID ${clueId} does not belong to this case file.`, 400);
      }

      const placedPosition = i + 1;
      const isCorrectPosition = expectedOrder === placedPosition;
      if (isCorrectPosition) correctPlacementsCount++;

      placementsToInsert.push({
        clueId,
        placedPosition,
        isCorrectPosition,
      });
    }

    const isAllCorrect = correctPlacementsCount === caseClues.length;
    const now = new Date();

    // Insert submission record
    const [subRecord] = await tx
      .insert(pinboardSubmissions)
      .values({
        sessionId,
        isCorrect: isAllCorrect,
        scoreAwarded: isAllCorrect ? PINBOARD_SOLVE_BONUS : 0,
        penaltyApplied: isAllCorrect ? 0 : PINBOARD_WRONG_PENALTY,
        submittedAt: now,
      })
      .returning();

    if (!subRecord) {
      throw new PinboardError("Failed to file pinboard submission.");
    }

    // Insert placements
    for (const p of placementsToInsert) {
      await tx.insert(pinboardPlacements).values({
        submissionId: subRecord.id,
        clueId: p.clueId,
        placedPosition: p.placedPosition,
        isCorrectPosition: p.isCorrectPosition,
      });
    }

    let finalScore = lockedSession.score;
    let totalTimeSeconds = lockedSession.totalTimeSeconds;

    if (isAllCorrect) {
      finalScore += PINBOARD_SOLVE_BONUS;
      totalTimeSeconds = Math.max(
        1,
        Math.round((now.getTime() - new Date(lockedSession.startedAt).getTime()) / 1000),
      );

      await tx
        .update(gameSessions)
        .set({
          status: "COMPLETED",
          score: finalScore,
          completedAt: now,
          totalTimeSeconds,
        })
        .where(eq(gameSessions.id, sessionId));
    } else {
      finalScore = Math.max(0, finalScore - PINBOARD_WRONG_PENALTY);
      await tx
        .update(gameSessions)
        .set({
          score: finalScore,
          wrongAttempts: lockedSession.wrongAttempts + 1,
        })
        .where(eq(gameSessions.id, sessionId));
    }

    return {
      isCorrect: isAllCorrect,
      scoreAwarded: isAllCorrect ? PINBOARD_SOLVE_BONUS : 0,
      penaltyApplied: isAllCorrect ? 0 : PINBOARD_WRONG_PENALTY,
      finalScore,
      isCompleted: isAllCorrect,
      totalTimeSeconds: isAllCorrect ? totalTimeSeconds : undefined,
      correctPlacementsCount,
      totalClues: caseClues.length,
    };
  });
}
