import { describe, expect, it } from "bun:test";
import {
  getIndividualLeaderboard,
  getTeamLeaderboard,
} from "@/server/services/leaderboard-service";

describe("Leaderboard Service & Filtering", () => {
  it("retrieves individual leaderboard without runtime exceptions", async () => {
    if (!process.env.DATABASE_URL) return;

    const rankings = await getIndividualLeaderboard();
    expect(Array.isArray(rankings)).toBe(true);

    if (rankings.length > 0) {
      const top = rankings[0];
      expect(top).toBeDefined();
      if (top) {
        expect(top.rank).toBe(1);
        expect(typeof top.score).toBe("number");
        expect(typeof top.totalTimeSeconds).toBe("number");
      }
    }
  });

  it("filters individual leaderboard by specific case slug", async () => {
    if (!process.env.DATABASE_URL) return;

    const rankings = await getIndividualLeaderboard("case-01-missing-ledger");
    expect(Array.isArray(rankings)).toBe(true);

    for (const r of rankings) {
      expect(r.caseSlug).toBe("case-01-missing-ledger");
    }
  });

  it("retrieves team leaderboard without runtime exceptions", async () => {
    if (!process.env.DATABASE_URL) return;

    const teamRankings = await getTeamLeaderboard();
    expect(Array.isArray(teamRankings)).toBe(true);

    if (teamRankings.length > 0) {
      const topTeam = teamRankings[0];
      expect(topTeam).toBeDefined();
      if (topTeam) {
        expect(topTeam.rank).toBe(1);
        expect(typeof topTeam.teamName).toBe("string");
      }
    }
  });
});
