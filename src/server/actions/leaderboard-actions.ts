"use server";

import { z } from "zod";
import {
  getIndividualLeaderboard,
  getTeamLeaderboard,
} from "@/server/services/leaderboard-service";

const querySchema = z.object({
  type: z.enum(["individual", "team"]).default("individual"),
  caseSlug: z.string().optional(),
});

export async function getLeaderboardAction(input?: {
  type?: "individual" | "team";
  caseSlug?: string;
}) {
  try {
    const parsed = querySchema.parse(input ?? {});
    if (parsed.type === "team") {
      const data = await getTeamLeaderboard(parsed.caseSlug);
      return { success: true, data };
    }
    const data = await getIndividualLeaderboard(parsed.caseSlug);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load leaderboard records.";
    return { success: false, error: message };
  }
}
