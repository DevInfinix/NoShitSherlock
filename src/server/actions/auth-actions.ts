"use server";

import { headers } from "next/headers";
import { z } from "zod";
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
