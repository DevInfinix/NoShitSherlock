"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
  GameSessionError,
  getActiveCases,
  getSessionCaseFile,
  startOrResumeSession,
} from "@/server/services/game-session-service";
import { GameplayError, submitAnswer } from "@/server/services/gameplay-service";
import { HintError, requestHint } from "@/server/services/hint-service";
import { getCurrentUser, requireUser } from "@/server/session";

const startSessionSchema = z.object({
  caseSlug: z.string().trim().min(1),
  teamId: z.coerce.number().int().positive().optional(),
});

const submitAnswerSchema = z.object({
  sessionId: z.coerce.number().int().positive(),
  questionId: z.coerce.number().int().positive(),
  submittedAnswer: z.string().trim().min(1, "Answer cannot be blank."),
  timeTakenMs: z.coerce.number().int().min(0).optional(),
});

const requestHintSchema = z.object({
  sessionId: z.coerce.number().int().positive(),
  questionId: z.coerce.number().int().positive(),
  hintId: z.coerce.number().int().positive(),
});

export async function startOrResumeSessionAction(caseSlug: string, teamId?: number) {
  try {
    const headerList = await headers();
    const user = await requireUser(headerList);

    const parsed = startSessionSchema.safeParse({ caseSlug, teamId });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid input parameters.",
      };
    }

    const result = await startOrResumeSession(user.id, parsed.data.caseSlug, parsed.data.teamId);
    return { success: true, session: result.session, isNew: result.isNew };
  } catch (error) {
    if (error instanceof GameSessionError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to initialize or resume investigation." };
  }
}

export async function getSessionCaseFileAction(sessionId: number) {
  try {
    const headerList = await headers();
    const user = await requireUser(headerList);

    const caseFile = await getSessionCaseFile(sessionId, user.id);
    return { success: true, caseFile, dossier: caseFile };
  } catch (error) {
    if (error instanceof GameSessionError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to load case file." };
  }
}

export const getSessionDossierAction = getSessionCaseFileAction;

export async function submitAnswerAction(input: {
  sessionId: number;
  questionId: number;
  submittedAnswer: string;
  timeTakenMs?: number;
}) {
  try {
    const headerList = await headers();
    const user = await requireUser(headerList);

    const parsed = submitAnswerSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid submission data.",
      };
    }

    const result = await submitAnswer({
      sessionId: parsed.data.sessionId,
      questionId: parsed.data.questionId,
      userId: user.id,
      submittedAnswer: parsed.data.submittedAnswer,
      timeTakenMs: parsed.data.timeTakenMs,
    });

    return { success: true, result };
  } catch (error) {
    if (error instanceof GameplayError) {
      return { success: false, error: error.message, code: error.code };
    }
    if (error instanceof GameSessionError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred processing your deduction." };
  }
}

export async function requestHintAction(input: {
  sessionId: number;
  questionId: number;
  hintId: number;
}) {
  try {
    const headerList = await headers();
    const user = await requireUser(headerList);

    const parsed = requestHintSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid hint request." };
    }

    const result = await requestHint({
      sessionId: parsed.data.sessionId,
      questionId: parsed.data.questionId,
      hintId: parsed.data.hintId,
      userId: user.id,
    });

    return { success: true, result };
  } catch (error) {
    if (error instanceof HintError) {
      return { success: false, error: error.message };
    }
    if (error instanceof GameSessionError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to unlock hint." };
  }
}

export async function getActiveCasesAction() {
  try {
    const headerList = await headers();
    const user = await getCurrentUser(headerList);

    const cases = await getActiveCases(user?.id);
    return { success: true, cases };
  } catch {
    return { success: false, error: "Failed to load case listings." };
  }
}
