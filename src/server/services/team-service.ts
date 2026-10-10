import { randomBytes } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { teamMembers, teams, users } from "@/db/schema";

export class TeamError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
  ) {
    super(message);
    this.name = "TeamError";
  }
}

/**
 * Generate a random 8-character uppercase alphanumeric join code,
 * avoiding visually ambiguous characters (0, O, 1, I, L).
 */
export function generateJoinCode(): string {
  const chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[(bytes[i] ?? 0) % chars.length];
  }
  return code;
}

export async function createTeam(userId: string, name: string) {
  const trimmedName = name.trim();
  if (trimmedName.length < 3 || trimmedName.length > 50) {
    throw new TeamError("Team name must be between 3 and 50 characters.");
  }

  return await db.transaction(async (tx) => {
    let joinCode = generateJoinCode();
    let attempts = 0;

    // Retry in rare case of random join code collision
    while (attempts < 5) {
      const existing = await tx.select().from(teams).where(eq(teams.joinCode, joinCode));
      if (existing.length === 0) break;
      joinCode = generateJoinCode();
      attempts++;
    }

    const [team] = await tx
      .insert(teams)
      .values({
        name: trimmedName,
        joinCode,
        ownerId: userId,
      })
      .returning();

    if (!team) {
      throw new TeamError("Failed to create team.");
    }

    await tx.insert(teamMembers).values({
      teamId: team.id,
      userId,
      role: "owner",
    });

    return team;
  });
}

export async function joinTeam(userId: string, joinCode: string) {
  const cleanCode = joinCode.trim().toUpperCase();
  if (cleanCode.length !== 8) {
    throw new TeamError("Join code must be exactly 8 characters.");
  }

  const [team] = await db.select().from(teams).where(eq(teams.joinCode, cleanCode));

  if (!team) {
    throw new TeamError("No team found with that join code.");
  }

  const existingMember = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, team.id), eq(teamMembers.userId, userId)));

  if (existingMember.length > 0) {
    throw new TeamError("You are already a member of this team.");
  }

  // Cap team size to max 8 detectives per squad
  const currentMembers = await db.select().from(teamMembers).where(eq(teamMembers.teamId, team.id));

  if (currentMembers.length >= 8) {
    throw new TeamError("This team has reached the maximum capacity of 8 detectives.");
  }

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId,
    role: "member",
  });

  return team;
}

export async function leaveTeam(userId: string, teamId: number) {
  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

  if (!membership) {
    throw new TeamError("You are not a member of this team.");
  }

  if (membership.role === "owner") {
    // If owner leaves, either disband or assign next oldest member
    const otherMembers = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), sql`${teamMembers.userId} != ${userId}`))
      .orderBy(teamMembers.joinedAt);

    if (otherMembers.length === 0) {
      // Disband team
      await db.delete(teams).where(eq(teams.id, teamId));
      return { disbanded: true };
    }

    // Transfer ownership to next oldest member
    const newOwner = otherMembers[0];
    if (!newOwner) {
      throw new TeamError("Failed to resolve successor owner.");
    }
    await db.transaction(async (tx) => {
      await tx.update(teams).set({ ownerId: newOwner.userId }).where(eq(teams.id, teamId));

      await tx
        .update(teamMembers)
        .set({ role: "owner" })
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, newOwner.userId)));

      await tx
        .delete(teamMembers)
        .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
    });

    return { disbanded: false, newOwnerId: newOwner.userId };
  }

  await db
    .delete(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

  return { disbanded: false };
}

export async function getTeamRoster(teamId: number) {
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId));

  if (!team) {
    throw new TeamError("Team not found.", 404);
  }

  const members = await db
    .select({
      userId: teamMembers.userId,
      role: teamMembers.role,
      joinedAt: teamMembers.joinedAt,
      name: users.name,
      email: users.email,
      image: users.image,
    })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, teamId))
    .orderBy(teamMembers.joinedAt);

  return {
    team,
    members,
  };
}

export async function getUserTeams(userId: string) {
  return await db
    .select({
      id: teams.id,
      name: teams.name,
      joinCode: teams.joinCode,
      ownerId: teams.ownerId,
      createdAt: teams.createdAt,
      role: teamMembers.role,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, userId))
    .orderBy(teams.createdAt);
}

export async function isUserInTeam(userId: string, teamId: number): Promise<boolean> {
  const [member] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));

  return Boolean(member);
}
