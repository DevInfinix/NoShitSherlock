"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
  createTeam,
  getTeamRoster,
  getUserTeams,
  joinTeam,
  leaveTeam,
  TeamError,
} from "@/server/services/team-service";
import { requireUser } from "@/server/session";

const createTeamSchema = z.object({
  name: z.string().trim().min(3).max(50),
});

const joinTeamSchema = z.object({
  joinCode: z.string().trim().length(8),
});

export async function createTeamAction(formData: FormData) {
  try {
    const headerList = await headers();
    const user = await requireUser(headerList);

    const parsed = createTeamSchema.safeParse({
      name: formData.get("name"),
    });

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid team name." };
    }

    const team = await createTeam(user.id, parsed.data.name);
    return { success: true, team };
  } catch (error) {
    if (error instanceof TeamError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred while creating the team." };
  }
}

export async function joinTeamAction(formData: FormData) {
  try {
    const headerList = await headers();
    const user = await requireUser(headerList);

    const parsed = joinTeamSchema.safeParse({
      joinCode: formData.get("joinCode"),
    });

    if (!parsed.success) {
      return { success: false, error: "Join code must be exactly 8 characters." };
    }

    const team = await joinTeam(user.id, parsed.data.joinCode);
    return { success: true, team };
  } catch (error) {
    if (error instanceof TeamError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred while joining the team." };
  }
}

export async function leaveTeamAction(teamId: number) {
  try {
    const headerList = await headers();
    const user = await requireUser(headerList);

    const result = await leaveTeam(user.id, teamId);
    return { success: true, result };
  } catch (error) {
    if (error instanceof TeamError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred while leaving the team." };
  }
}

export async function getMyTeamsAction() {
  try {
    const headerList = await headers();
    const user = await requireUser(headerList);

    const teams = await getUserTeams(user.id);
    return { success: true, teams };
  } catch (error) {
    if (error instanceof TeamError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to retrieve teams." };
  }
}

export async function getTeamRosterAction(teamId: number) {
  try {
    const headerList = await headers();
    await requireUser(headerList);

    const roster = await getTeamRoster(teamId);
    return { success: true, roster };
  } catch (error) {
    if (error instanceof TeamError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to retrieve team roster." };
  }
}
