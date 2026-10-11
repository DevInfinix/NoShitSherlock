import { and, asc, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db/client";
import { cases, gameSessions, teams, users } from "@/db/schema";

export interface IndividualLeaderboardEntry {
  rank: number;
  sessionId: number;
  userId: string;
  detectiveName: string;
  detectiveEmail: string;
  caseId: number;
  caseTitle: string;
  caseSlug: string;
  score: number;
  totalTimeSeconds: number;
  completedAt: Date | null;
}

export interface TeamLeaderboardEntry {
  rank: number;
  sessionId: number;
  teamId: number;
  teamName: string;
  teamJoinCode: string;
  caseId: number;
  caseTitle: string;
  caseSlug: string;
  score: number;
  totalTimeSeconds: number;
  completedAt: Date | null;
}

/**
 * Retrieve the individual / solo detective leaderboard.
 * Sorted by highest score first, then fastest total time.
 */
export async function getIndividualLeaderboard(
  caseSlug?: string,
  limit = 50,
): Promise<IndividualLeaderboardEntry[]> {
  const conditions = [eq(gameSessions.status, "COMPLETED"), isNotNull(gameSessions.userId)];

  if (caseSlug) {
    conditions.push(eq(cases.slug, caseSlug));
  }

  const rows = await db
    .select({
      sessionId: gameSessions.id,
      userId: gameSessions.userId,
      detectiveName: users.name,
      detectiveEmail: users.email,
      caseId: cases.id,
      caseTitle: cases.title,
      caseSlug: cases.slug,
      score: gameSessions.score,
      totalTimeSeconds: gameSessions.totalTimeSeconds,
      completedAt: gameSessions.completedAt,
    })
    .from(gameSessions)
    .innerJoin(cases, eq(gameSessions.caseId, cases.id))
    .innerJoin(users, eq(gameSessions.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(gameSessions.score), asc(gameSessions.totalTimeSeconds))
    .limit(limit);

  return rows.map((r, idx) => ({
    rank: idx + 1,
    sessionId: r.sessionId,
    userId: r.userId ?? "unknown",
    detectiveName: r.detectiveName || "Anonymous Detective",
    detectiveEmail: r.detectiveEmail || "",
    caseId: r.caseId,
    caseTitle: r.caseTitle,
    caseSlug: r.caseSlug,
    score: r.score,
    totalTimeSeconds: r.totalTimeSeconds,
    completedAt: r.completedAt,
  }));
}

/**
 * Retrieve the squad / syndicate team leaderboard.
 * Sorted by highest score first, then fastest total time.
 */
export async function getTeamLeaderboard(
  caseSlug?: string,
  limit = 50,
): Promise<TeamLeaderboardEntry[]> {
  const conditions = [eq(gameSessions.status, "COMPLETED"), isNotNull(gameSessions.teamId)];

  if (caseSlug) {
    conditions.push(eq(cases.slug, caseSlug));
  }

  const rows = await db
    .select({
      sessionId: gameSessions.id,
      teamId: gameSessions.teamId,
      teamName: teams.name,
      teamJoinCode: teams.joinCode,
      caseId: cases.id,
      caseTitle: cases.title,
      caseSlug: cases.slug,
      score: gameSessions.score,
      totalTimeSeconds: gameSessions.totalTimeSeconds,
      completedAt: gameSessions.completedAt,
    })
    .from(gameSessions)
    .innerJoin(cases, eq(gameSessions.caseId, cases.id))
    .innerJoin(teams, eq(gameSessions.teamId, teams.id))
    .where(and(...conditions))
    .orderBy(desc(gameSessions.score), asc(gameSessions.totalTimeSeconds))
    .limit(limit);

  return rows.map((r, idx) => ({
    rank: idx + 1,
    sessionId: r.sessionId,
    teamId: r.teamId ?? 0,
    teamName: r.teamName,
    teamJoinCode: r.teamJoinCode,
    caseId: r.caseId,
    caseTitle: r.caseTitle,
    caseSlug: r.caseSlug,
    score: r.score,
    totalTimeSeconds: r.totalTimeSeconds,
    completedAt: r.completedAt,
  }));
}
