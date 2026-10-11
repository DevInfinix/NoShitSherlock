"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
  getPinboardCaseFile,
  PinboardError,
  submitPinboard,
} from "@/server/services/pinboard-service";
import { requireUser } from "@/server/session";

const getPinboardSchema = z.object({
  sessionId: z.coerce.number().int().positive(),
});

const submitPinboardSchema = z.object({
  sessionId: z.coerce.number().int().positive(),
  clueOrder: z.array(z.coerce.number().int().positive()).min(1),
});

export async function getPinboardCaseFileAction(sessionId: number) {
  try {
    const headerList = await headers();
    const user = await requireUser(headerList);

    const parsed = getPinboardSchema.safeParse({ sessionId });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid session ID." };
    }

    const caseFile = await getPinboardCaseFile(parsed.data.sessionId, user.id);
    return { success: true, caseFile, dossier: caseFile };
  } catch (error) {
    if (error instanceof PinboardError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to load pinboard evidence." };
  }
}

export const getPinboardDossierAction = getPinboardCaseFileAction;

export async function submitPinboardAction(input: { sessionId: number; clueOrder: number[] }) {
  try {
    const headerList = await headers();
    const user = await requireUser(headerList);

    const parsed = submitPinboardSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid sequence data." };
    }

    const result = await submitPinboard({
      sessionId: parsed.data.sessionId,
      userId: user.id,
      clueOrder: parsed.data.clueOrder,
    });

    return { success: true, result };
  } catch (error) {
    if (error instanceof PinboardError) {
      return { success: false, error: error.message, code: error.code };
    }
    return { success: false, error: "Failed to evaluate timeline deduction." };
  }
}
