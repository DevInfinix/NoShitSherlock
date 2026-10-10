import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { legalAcceptances } from "@/db/schema";

export class LegalError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
  ) {
    super(message);
    this.name = "LegalError";
  }
}

export interface RecordConsentInput {
  userId: string;
  isOver13: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingOptIn?: boolean;
  documentVersion?: string;
}

export async function recordLegalConsent(input: RecordConsentInput) {
  if (!input.isOver13) {
    throw new LegalError(
      "You must be at least 13 years old to create an account or play NoShitSherlock.",
      403,
    );
  }

  if (!input.termsAccepted) {
    throw new LegalError("You must accept the Terms of Service to proceed.");
  }

  if (!input.privacyAccepted) {
    throw new LegalError("You must acknowledge the Privacy Notice to proceed.");
  }

  const [record] = await db
    .insert(legalAcceptances)
    .values({
      userId: input.userId,
      isOver13: true,
      documentVersion: input.documentVersion ?? "1.0",
      termsAcceptedAt: new Date(),
      privacyAcceptedAt: new Date(),
      marketingOptIn: Boolean(input.marketingOptIn),
    })
    .returning();

  return record;
}

export async function hasUserAcceptedLegal(userId: string): Promise<boolean> {
  const [record] = await db
    .select()
    .from(legalAcceptances)
    .where(eq(legalAcceptances.userId, userId));

  return Boolean(record?.isOver13);
}
