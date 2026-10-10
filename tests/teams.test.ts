import { describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import {
  hasUserAcceptedLegal,
  LegalError,
  recordLegalConsent,
} from "@/server/services/legal-service";
import {
  createTeam,
  generateJoinCode,
  getTeamRoster,
  joinTeam,
  leaveTeam,
  TeamError,
} from "@/server/services/team-service";

describe("Team Management & Legal Services", () => {
  it("generates a valid 8-character uppercase join code without ambiguous characters", () => {
    const code = generateJoinCode();
    expect(code).toHaveLength(8);
    expect(code).toBe(code.toUpperCase());
    expect(code).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/);
  });

  it("handles team creation, member joining, roster inspection, and leaving", async () => {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not set, skipping database test.");
      return;
    }

    const testOwnerId = `test_owner_${Date.now()}`;
    const testMemberId = `test_member_${Date.now()}`;

    // Seed test users
    await db.insert(users).values([
      {
        id: testOwnerId,
        name: "Detective Miller",
        email: `${testOwnerId}@scotlandyard.test`,
        emailVerified: true,
      },
      {
        id: testMemberId,
        name: "Officer Watson",
        email: `${testMemberId}@scotlandyard.test`,
        emailVerified: true,
      },
    ]);

    try {
      // 1. Create team
      const team = await createTeam(testOwnerId, "Baker Street Irregulars");
      expect(team.id).toBeGreaterThan(0);
      expect(team.name).toBe("Baker Street Irregulars");
      expect(team.joinCode).toHaveLength(8);

      // 2. Join team
      const joinedTeam = await joinTeam(testMemberId, team.joinCode);
      expect(joinedTeam.id).toBe(team.id);

      // Re-joining should fail
      expect(joinTeam(testMemberId, team.joinCode)).rejects.toThrow(TeamError);

      // 3. Inspect roster
      const roster = await getTeamRoster(team.id);
      expect(roster.members).toHaveLength(2);
      expect(roster.members.some((m) => m.userId === testOwnerId && m.role === "owner")).toBe(true);
      expect(roster.members.some((m) => m.userId === testMemberId && m.role === "member")).toBe(
        true,
      );

      // 4. Member leaves team
      const leaveResult = await leaveTeam(testMemberId, team.id);
      expect(leaveResult.disbanded).toBe(false);

      const rosterAfterLeave = await getTeamRoster(team.id);
      expect(rosterAfterLeave.members).toHaveLength(1);

      // 5. Owner leaves solo team (should disband)
      const disbandResult = await leaveTeam(testOwnerId, team.id);
      expect(disbandResult.disbanded).toBe(true);
    } finally {
      // Clean up test users
      await db.delete(users).where(eq(users.id, testOwnerId));
      await db.delete(users).where(eq(users.id, testMemberId));
    }
  }, 15000);

  it("enforces legal consent requirements and rejects under-13 users", async () => {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not set, skipping database test.");
      return;
    }

    const testUserId = `test_legal_${Date.now()}`;
    await db.insert(users).values({
      id: testUserId,
      name: "Young Detective",
      email: `${testUserId}@detective.test`,
      emailVerified: true,
    });

    try {
      // Rejects under-13
      expect(
        recordLegalConsent({
          userId: testUserId,
          isOver13: false,
          termsAccepted: true,
          privacyAccepted: true,
        }),
      ).rejects.toThrow(LegalError);

      // Rejects without terms
      expect(
        recordLegalConsent({
          userId: testUserId,
          isOver13: true,
          termsAccepted: false,
          privacyAccepted: true,
        }),
      ).rejects.toThrow(LegalError);

      // Accepts compliant consent
      const record = await recordLegalConsent({
        userId: testUserId,
        isOver13: true,
        termsAccepted: true,
        privacyAccepted: true,
        marketingOptIn: false,
      });

      expect(record?.isOver13).toBe(true);
      const hasAccepted = await hasUserAcceptedLegal(testUserId);
      expect(hasAccepted).toBe(true);
    } finally {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });
});
