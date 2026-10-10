"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { LegalError, recordLegalConsent } from "@/server/services/legal-service";
import { requireUser } from "@/server/session";

const consentSchema = z.object({
  isOver13: z.boolean(),
  termsAccepted: z.boolean(),
  privacyAccepted: z.boolean(),
  marketingOptIn: z.boolean().optional(),
});

export async function recordLegalConsentAction(input: z.infer<typeof consentSchema>) {
  try {
    const headerList = await headers();
    const user = await requireUser(headerList);

    const parsed = consentSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid consent confirmation.",
      };
    }

    const record = await recordLegalConsent({
      userId: user.id,
      isOver13: parsed.data.isOver13,
      termsAccepted: parsed.data.termsAccepted,
      privacyAccepted: parsed.data.privacyAccepted,
      marketingOptIn: parsed.data.marketingOptIn,
    });

    return { success: true, record };
  } catch (error) {
    if (error instanceof LegalError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to record legal consent confirmation." };
  }
}

export async function getAgentDetailsAction(email?: string) {
  try {
    const headerList = await headers();
    let targetUserId: string | null = null;
    let targetEmail = email;

    try {
      const user = await requireUser(headerList);
      targetUserId = user.id;
      if (!targetEmail) targetEmail = user.email;
    } catch {
      // Unauthenticated, check if email was supplied
    }

    if (targetUserId) {
      const [found] = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
      if (found) {
        return {
          success: true,
          agentTag: found.agentTag ?? null,
          username: found.username ?? null,
          trainingCompleted: found.trainingCompleted,
        };
      }
    }

    if (targetEmail) {
      const [found] = await db.select().from(users).where(eq(users.email, targetEmail)).limit(1);
      if (found) {
        return {
          success: true,
          agentTag: found.agentTag ?? null,
          username: found.username ?? null,
          trainingCompleted: found.trainingCompleted,
        };
      }
    }

    return {
      success: true,
      agentTag: null,
      username: null,
      trainingCompleted: false,
    };
  } catch {
    return { success: false, error: "Failed to retrieve agent records." };
  }
}

export async function checkAgentTagAvailableAction(tag: string) {
  try {
    const trimmed = tag.trim();
    if (!/^\d{3}$/.test(trimmed)) {
      return {
        success: false,
        available: false,
        error: "Agent tag must consist of exactly three numeric digits (e.g. 004).",
      };
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.agentTag, trimmed))
      .limit(1);

    return {
      success: true,
      available: !existing,
    };
  } catch {
    return { success: false, error: "Failed to verify tag availability." };
  }
}

export async function checkUsernameAvailableAction(username: string) {
  try {
    const trimmed = username.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      return {
        success: false,
        available: false,
        error: "Callsign must be between 2 and 30 characters.",
      };
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, trimmed))
      .limit(1);

    return {
      success: true,
      available: !existing,
    };
  } catch {
    return { success: false, error: "Failed to verify username availability." };
  }
}

const registerDetailsSchema = z.object({
  agentTag: z.string().regex(/^\d{3}$/, "Agent tag must be 3 digits"),
  username: z.string().min(2).max(30),
});

export async function registerAgentDetailsAction(input: z.infer<typeof registerDetailsSchema>) {
  try {
    const headerList = await headers();
    const user = await requireUser(headerList);

    const parsed = registerDetailsSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid operative credentials.",
      };
    }

    // Check unique tag
    const [tagConflict] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.agentTag, parsed.data.agentTag))
      .limit(1);

    if (tagConflict && tagConflict.id !== user.id) {
      return {
        success: false,
        error: `Agent Tag ${parsed.data.agentTag} is already claimed by another operative.`,
      };
    }

    // Check unique username
    const [nameConflict] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, parsed.data.username))
      .limit(1);

    if (nameConflict && nameConflict.id !== user.id) {
      return { success: false, error: `Callsign '${parsed.data.username}' is already registered.` };
    }

    await db
      .update(users)
      .set({
        agentTag: parsed.data.agentTag,
        username: parsed.data.username,
        name: parsed.data.username,
      })
      .where(eq(users.id, user.id));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to record agent details.",
    };
  }
}

export async function completeTrainingAction() {
  try {
    const headerList = await headers();
    const user = await requireUser(headerList);

    await db
      .update(users)
      .set({
        trainingCompleted: true,
      })
      .where(eq(users.id, user.id));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to finalize training completion.",
    };
  }
}
