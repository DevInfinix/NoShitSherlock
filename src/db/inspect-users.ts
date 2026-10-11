import { desc, eq } from "drizzle-orm";
import { db, pool } from "./client";
import { accounts, legalAcceptances, users } from "./schema";

/**
 * Inspection utility to view all registered operatives,
 * their linked auth credentials (email/password or oauth),
 * email verification status, and profile information.
 */
async function inspectUsers() {
  console.log("================================================================================");
  console.log("NoShitSherlock — Central Detective Registry & Credential Ledger");
  console.log("================================================================================");

  try {
    const records = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        emailVerified: users.emailVerified,
        agentTag: users.agentTag,
        username: users.username,
        trainingCompleted: users.trainingCompleted,
        createdAt: users.createdAt,
        providerId: accounts.providerId,
        hasPassword: accounts.password,
        marketingOptIn: legalAcceptances.marketingOptIn,
      })
      .from(users)
      .leftJoin(accounts, eq(users.id, accounts.userId))
      .leftJoin(legalAcceptances, eq(users.id, legalAcceptances.userId))
      .orderBy(desc(users.createdAt));

    console.log(`Total Registered Operatives: ${records.length}\n`);

    if (records.length === 0) {
      console.log("No operative records found in the database.");
    } else {
      console.table(
        records.map((r) => ({
          Email: r.email,
          Callsign: r.username ?? r.name,
          Tag: r.agentTag ?? "PENDING",
          Verified: r.emailVerified ? "YES" : "NO",
          "Auth Provider":
            r.providerId === "credential"
              ? "Email & Password"
              : r.providerId === "google"
                ? "Google OAuth"
                : r.providerId === "github"
                  ? "GitHub OAuth"
                  : (r.providerId ?? "None"),
          "Credential Security": r.hasPassword ? "Protected (Scrypt Hash)" : "OAuth Token Managed",
          Onboarded: r.trainingCompleted ? "YES" : "NO",
          Updates: r.marketingOptIn ? "Subscribed" : "Opted-Out",
          "Created Date": r.createdAt.toISOString().slice(0, 10),
        })),
      );
    }
    console.log("================================================================================");
  } catch (error) {
    console.error("Failed to inspect users:", error);
  } finally {
    await pool.end();
  }
}

inspectUsers();
