import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { legalAcceptances, users } from "@/db/schema";

export interface OperativeAudienceRecord {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  agentTag: string | null;
  username: string | null;
  trainingCompleted: boolean;
  marketingOptIn: boolean;
  registeredAt: Date;
  termsAcceptedAt: Date | null;
}

/**
 * Retrieve all registered users along with their legal marketing consent
 * and onboarding status for automated email dispatches and community alerts.
 */
export async function getRegisteredAudience(options?: {
  onlyMarketingOptIn?: boolean;
  onlyVerifiedEmail?: boolean;
}): Promise<OperativeAudienceRecord[]> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      agentTag: users.agentTag,
      username: users.username,
      trainingCompleted: users.trainingCompleted,
      registeredAt: users.createdAt,
      marketingOptIn: legalAcceptances.marketingOptIn,
      termsAcceptedAt: legalAcceptances.termsAcceptedAt,
    })
    .from(users)
    .leftJoin(legalAcceptances, eq(users.id, legalAcceptances.userId))
    .orderBy(desc(users.createdAt));

  let filtered = rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    emailVerified: r.emailVerified,
    agentTag: r.agentTag,
    username: r.username,
    trainingCompleted: r.trainingCompleted,
    marketingOptIn: r.marketingOptIn ?? false,
    registeredAt: r.registeredAt,
    termsAcceptedAt: r.termsAcceptedAt ?? null,
  }));

  if (options?.onlyMarketingOptIn) {
    filtered = filtered.filter((u) => u.marketingOptIn);
  }

  if (options?.onlyVerifiedEmail) {
    filtered = filtered.filter((u) => u.emailVerified);
  }

  return filtered;
}
