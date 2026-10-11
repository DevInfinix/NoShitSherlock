import { db, pool } from "./client";
import { gameSessions, teams, users, verifications } from "./schema";

/**
 * Utility script for development and pre-launch testing.
 * Clears all registered users, active sessions, accounts, teams,
 * and game session progress while keeping authored case content completely intact.
 */
async function clearAllUsers() {
  console.log("----------------------------------------------------------------");
  console.log("NoShitSherlock — Purging all registered users and runtime data...");
  console.log("----------------------------------------------------------------");

  try {
    const result = await db.transaction(async (tx) => {
      // 1. Delete all game sessions (cascades to answers, clues, placements, hints)
      const deletedSessions = await tx.delete(gameSessions).returning({ id: gameSessions.id });

      // 2. Delete all teams (cascades to team_members)
      const deletedTeams = await tx.delete(teams).returning({ id: teams.id });

      // 3. Delete all users (cascades to better-auth sessions and accounts)
      const deletedUsers = await tx.delete(users).returning({ id: users.id, email: users.email });

      // 4. Delete any pending email verification records
      const deletedVerifications = await tx
        .delete(verifications)
        .returning({ id: verifications.id });

      return {
        sessionsCount: deletedSessions.length,
        teamsCount: deletedTeams.length,
        usersCount: deletedUsers.length,
        verificationsCount: deletedVerifications.length,
      };
    });

    console.log(`[SUCCESS] Purged ${result.usersCount} registered user(s).`);
    console.log(`[SUCCESS] Purged ${result.teamsCount} team(s).`);
    console.log(`[SUCCESS] Purged ${result.sessionsCount} gameplay session(s).`);
    console.log(`[SUCCESS] Purged ${result.verificationsCount} verification token(s).`);
    console.log("[STATUS] Authored case files, questions, clues, and assets remain untouched.");
    console.log("----------------------------------------------------------------");
  } catch (error) {
    console.error("[ERROR] Failed to purge users:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

clearAllUsers();
