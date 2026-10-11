import { getRegisteredAudience } from "../server/services/user-service";
import { pool } from "./client";

/**
 * Utility script to inspect and export all registered operatives,
 * their contact emails, verification status, and marketing opt-ins.
 */
async function exportAudience() {
  console.log("================================================================");
  console.log("NoShitSherlock — Registered Operatives & Mailing Audience List");
  console.log("================================================================");

  try {
    const audience = await getRegisteredAudience();
    console.log(`Total Registered Operatives: ${audience.length}`);
    console.log(
      `Subscribed to Mailing/Updates: ${audience.filter((a) => a.marketingOptIn).length}`,
    );
    console.log(`Verified Emails: ${audience.filter((a) => a.emailVerified).length}`);
    console.log("----------------------------------------------------------------");

    if (audience.length === 0) {
      console.log("No operatives registered in the database.");
    } else {
      console.table(
        audience.map((a) => ({
          Name: a.name,
          Email: a.email,
          Verified: a.emailVerified ? "YES" : "NO",
          Tag: a.agentTag ?? "N/A",
          Callsign: a.username ?? "N/A",
          "Onboard Complete": a.trainingCompleted ? "YES" : "NO",
          "Marketing Subscribed": a.marketingOptIn ? "YES" : "NO",
          "Registered At": a.registeredAt.toISOString().slice(0, 10),
        })),
      );
    }
    console.log("================================================================");
  } catch (error) {
    console.error("Failed to export audience:", error);
  } finally {
    await pool.end();
  }
}

exportAudience();
