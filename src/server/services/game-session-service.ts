import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  cases,
  clues,
  gameSessions,
  hintRequests,
  hints,
  questionOptions,
  questions,
  sections,
  sessionClues,
  sessionQuestionStates,
  teamMembers,
  users,
} from "@/db/schema";

export class GameSessionError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
  ) {
    super(message);
    this.name = "GameSessionError";
  }
}

export type SessionWithOwnership = typeof gameSessions.$inferSelect;

/**
 * Verify that a user is authorized to interact with a specific game session.
 * A user can access a session if they are the direct solo owner, or a member of the owning team.
 */
export async function verifySessionAccess(
  sessionId: number,
  userId: string,
): Promise<{ session: SessionWithOwnership; isTeam: boolean }> {
  const [session] = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.id, sessionId))
    .limit(1);

  if (!session) {
    throw new GameSessionError("Investigation session not found.", 404);
  }

  if (session.userId) {
    if (session.userId !== userId) {
      throw new GameSessionError("Access denied. You do not own this investigation.", 403);
    }
    return { session, isTeam: false };
  }

  if (session.teamId) {
    const [membership] = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, session.teamId), eq(teamMembers.userId, userId)))
      .limit(1);

    if (!membership) {
      throw new GameSessionError(
        "Access denied. You are not a member of the squad assigned to this case.",
        403,
      );
    }
    return { session, isTeam: true };
  }

  throw new GameSessionError("Invalid session state: unassigned investigation.", 400);
}

/**
 * Start or resume an investigation session for a case.
 * Returns existing IN_PROGRESS session if found, or creates a new initialized session.
 */
export async function startOrResumeSession(
  userId: string,
  caseSlug: string,
  teamId?: number,
): Promise<{ session: SessionWithOwnership; isNew: boolean }> {
  const [activeCase] = await db
    .select()
    .from(cases)
    .where(and(eq(cases.slug, caseSlug), eq(cases.isActive, true)))
    .limit(1);

  if (!activeCase) {
    throw new GameSessionError("Case file not found or currently archived.", 404);
  }

  // Verify operative clearance: email must be verified and training must be completed
  const [dbUser] = await db
    .select({
      id: users.id,
      emailVerified: users.emailVerified,
      trainingCompleted: users.trainingCompleted,
      username: users.username,
      agentTag: users.agentTag,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!dbUser) {
    throw new GameSessionError("Operative record not found.", 401);
  }

  if (!dbUser.emailVerified) {
    throw new GameSessionError(
      "Department protocol requires email verification prior to launching an investigation. Please verify your email.",
      403,
    );
  }

  if (!dbUser.trainingCompleted || !dbUser.username || !dbUser.agentTag) {
    throw new GameSessionError(
      "Operative onboarding incomplete. Please confirm your callsign, agent tag, and statutory clearance.",
      403,
    );
  }

  // If team session requested, verify membership
  if (teamId) {
    const [membership] = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
      .limit(1);

    if (!membership) {
      throw new GameSessionError(
        "You must belong to this team to start a squad investigation.",
        403,
      );
    }
  }

  return await db.transaction(async (tx) => {
    // Check for existing IN_PROGRESS session
    const existingSessions = teamId
      ? await tx
          .select()
          .from(gameSessions)
          .where(
            and(
              eq(gameSessions.teamId, teamId),
              eq(gameSessions.caseId, activeCase.id),
              eq(gameSessions.status, "IN_PROGRESS"),
            ),
          )
          .limit(1)
      : await tx
          .select()
          .from(gameSessions)
          .where(
            and(
              eq(gameSessions.userId, userId),
              eq(gameSessions.caseId, activeCase.id),
              eq(gameSessions.status, "IN_PROGRESS"),
            ),
          )
          .limit(1);

    if (existingSessions[0]) {
      return { session: existingSessions[0], isNew: false };
    }

    // Locate section 1
    const [firstSection] = await tx
      .select()
      .from(sections)
      .where(and(eq(sections.caseId, activeCase.id), eq(sections.sectionOrder, 1)))
      .limit(1);

    const [newSession] = await tx
      .insert(gameSessions)
      .values({
        caseId: activeCase.id,
        userId: teamId ? null : userId,
        teamId: teamId ?? null,
        status: "IN_PROGRESS",
        currentSectionId: firstSection?.id ?? null,
        score: 0,
        hintBalance: 100,
        wrongAttempts: 0,
      })
      .returning();

    if (!newSession) {
      throw new GameSessionError("Failed to initialize investigation session.");
    }

    // Initialize session_question_states for all questions in this case
    const caseSections = await tx
      .select({ id: sections.id })
      .from(sections)
      .where(eq(sections.caseId, activeCase.id));

    if (caseSections.length > 0) {
      const sectionIds = caseSections.map((s) => s.id);
      const caseQuestions = await tx
        .select({ id: questions.id })
        .from(questions)
        .where(inArray(questions.sectionId, sectionIds));

      if (caseQuestions.length > 0) {
        await tx.insert(sessionQuestionStates).values(
          caseQuestions.map((q) => ({
            sessionId: newSession.id,
            questionId: q.id,
            attemptsUsed: 0,
            isSolved: false,
          })),
        );
      }
    }

    return { session: newSession, isNew: true };
  });
}

export interface SanitizedQuestionOption {
  id: number;
  optionText: string;
  sortOrder: number;
}

export interface SanitizedQuestion {
  id: number;
  sectionId: number;
  questionKey: string;
  questionType: typeof questions.$inferSelect.questionType;
  prompt: string;
  placeholderText: string | null;
  points: number;
  maxAttempts: number;
  penaltyPerWrong: number;
  sortOrder: number;
  metadata: Record<string, unknown> | null;
  options: SanitizedQuestionOption[];
}

export interface SanitizedHint {
  id: number;
  questionId: number;
  hintOrder: number;
  costPoints: number;
  isUnlocked: boolean;
  hintText: string | null; // Null if not yet unlocked
}

export interface UnlockedClue {
  id: number;
  clueKey: string;
  title: string;
  clueText: string;
  chronologicalOrder: number;
  metadata: Record<string, unknown> | null;
  unlockedAt: Date;
}

export interface SessionCaseFile {
  session: SessionWithOwnership;
  case: {
    id: number;
    slug: string;
    title: string;
    description: string;
    difficulty: number;
    maxScore: number;
  };
  sections: Array<{
    id: number;
    sectionOrder: number;
    title: string;
    narrative: string;
    timeLimitSeconds: number | null;
  }>;
  questions: SanitizedQuestion[];
  questionStates: Record<
    number,
    {
      attemptsUsed: number;
      isSolved: boolean;
      lastAttemptAt: Date | null;
      solvedAt: Date | null;
    }
  >;
  unlockedClues: UnlockedClue[];
  hints: SanitizedHint[];
}

export type SessionDossier = SessionCaseFile;

/**
 * Retrieve the full sanitized case file for an investigation session.
 * NEVER leaks correct_answer or is_correct to the client.
 */
export async function getSessionCaseFile(
  sessionId: number,
  userId: string,
): Promise<SessionCaseFile> {
  const { session } = await verifySessionAccess(sessionId, userId);

  const [caseRecord] = await db.select().from(cases).where(eq(cases.id, session.caseId)).limit(1);

  if (!caseRecord) {
    throw new GameSessionError("Case file not found.", 404);
  }

  // Fetch sections
  const caseSections = await db
    .select({
      id: sections.id,
      sectionOrder: sections.sectionOrder,
      title: sections.title,
      narrative: sections.narrative,
      timeLimitSeconds: sections.timeLimitSeconds,
    })
    .from(sections)
    .where(eq(sections.caseId, caseRecord.id))
    .orderBy(asc(sections.sectionOrder));

  const sectionIds = caseSections.map((s) => s.id);

  // Fetch questions (OMITTING correctAnswer)
  const rawQuestions =
    sectionIds.length > 0
      ? await db
          .select({
            id: questions.id,
            sectionId: questions.sectionId,
            questionKey: questions.questionKey,
            questionType: questions.questionType,
            prompt: questions.prompt,
            placeholderText: questions.placeholderText,
            points: questions.points,
            maxAttempts: questions.maxAttempts,
            penaltyPerWrong: questions.penaltyPerWrong,
            sortOrder: questions.sortOrder,
            metadata: questions.metadata,
          })
          .from(questions)
          .where(inArray(questions.sectionId, sectionIds))
          .orderBy(asc(questions.sortOrder))
      : [];

  const questionIds = rawQuestions.map((q) => q.id);

  // Fetch options (OMITTING isCorrect)
  const rawOptions =
    questionIds.length > 0
      ? await db
          .select({
            id: questionOptions.id,
            questionId: questionOptions.questionId,
            optionText: questionOptions.optionText,
            sortOrder: questionOptions.sortOrder,
          })
          .from(questionOptions)
          .where(inArray(questionOptions.questionId, questionIds))
          .orderBy(asc(questionOptions.sortOrder))
      : [];

  const optionsByQuestion = new Map<number, SanitizedQuestionOption[]>();
  for (const opt of rawOptions) {
    const list = optionsByQuestion.get(opt.questionId) ?? [];
    list.push({
      id: opt.id,
      optionText: opt.optionText,
      sortOrder: opt.sortOrder,
    });
    optionsByQuestion.set(opt.questionId, list);
  }

  const sanitizedQuestions: SanitizedQuestion[] = rawQuestions.map((q) => ({
    ...q,
    options: optionsByQuestion.get(q.id) ?? [],
  }));

  // Fetch question states
  const rawStates = await db
    .select()
    .from(sessionQuestionStates)
    .where(eq(sessionQuestionStates.sessionId, session.id));

  const questionStates: SessionDossier["questionStates"] = {};
  for (const state of rawStates) {
    questionStates[state.questionId] = {
      attemptsUsed: state.attemptsUsed,
      isSolved: state.isSolved,
      lastAttemptAt: state.lastAttemptAt,
      solvedAt: state.solvedAt,
    };
  }

  // Fetch unlocked clues
  const rawSessionClues = await db
    .select({
      id: clues.id,
      clueKey: clues.clueKey,
      title: clues.title,
      clueText: clues.clueText,
      chronologicalOrder: clues.chronologicalOrder,
      metadata: clues.metadata,
      unlockedAt: sessionClues.unlockedAt,
    })
    .from(sessionClues)
    .innerJoin(clues, eq(sessionClues.clueId, clues.id))
    .where(eq(sessionClues.sessionId, session.id))
    .orderBy(asc(clues.chronologicalOrder));

  // Fetch hint requests and all hints
  const unlockedHintRequests = await db
    .select({ hintId: hintRequests.hintId })
    .from(hintRequests)
    .where(eq(hintRequests.sessionId, session.id));

  const unlockedHintIdSet = new Set(unlockedHintRequests.map((hr) => hr.hintId));

  const rawHints =
    questionIds.length > 0
      ? await db
          .select({
            id: hints.id,
            questionId: hints.questionId,
            hintText: hints.hintText,
            costPoints: hints.costPoints,
            hintOrder: hints.hintOrder,
          })
          .from(hints)
          .where(inArray(hints.questionId, questionIds))
          .orderBy(asc(hints.hintOrder))
      : [];

  const sanitizedHints: SanitizedHint[] = rawHints.map((h) => {
    const isUnlocked = unlockedHintIdSet.has(h.id);
    return {
      id: h.id,
      questionId: h.questionId,
      hintOrder: h.hintOrder,
      costPoints: h.costPoints,
      isUnlocked,
      hintText: isUnlocked ? h.hintText : null, // Redact hint text until unlocked
    };
  });

  return {
    session,
    case: {
      id: caseRecord.id,
      slug: caseRecord.slug,
      title: caseRecord.title,
      description: caseRecord.description,
      difficulty: caseRecord.difficulty,
      maxScore: caseRecord.maxScore,
    },
    sections: caseSections,
    questions: sanitizedQuestions,
    questionStates,
    unlockedClues: rawSessionClues,
    hints: sanitizedHints,
  };
}

export const getSessionDossier = getSessionCaseFile;

export interface ActiveCaseListing {
  id: number;
  slug: string;
  title: string;
  description: string;
  difficulty: number;
  maxScore: number;
  activeSessionId: number | null;
  activeSessionStatus: string | null;
  activeSessionScore: number | null;
}

/**
 * List all active cases with active session status for a given user.
 */
export async function getActiveCases(userId?: string): Promise<ActiveCaseListing[]> {
  const activeCases = await db
    .select({
      id: cases.id,
      slug: cases.slug,
      title: cases.title,
      description: cases.description,
      difficulty: cases.difficulty,
      maxScore: cases.maxScore,
    })
    .from(cases)
    .where(eq(cases.isActive, true))
    .orderBy(asc(cases.id));

  if (!userId || activeCases.length === 0) {
    return activeCases.map((c) => ({
      ...c,
      activeSessionId: null,
      activeSessionStatus: null,
      activeSessionScore: null,
    }));
  }

  // Retrieve user's teams to check team sessions too
  const userTeamRows = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId));
  const teamIds = userTeamRows.map((r) => r.teamId);

  // Retrieve any IN_PROGRESS sessions
  const activeSessions = await db
    .select({
      id: gameSessions.id,
      caseId: gameSessions.caseId,
      status: gameSessions.status,
      score: gameSessions.score,
      userId: gameSessions.userId,
      teamId: gameSessions.teamId,
    })
    .from(gameSessions)
    .where(
      and(
        eq(gameSessions.status, "IN_PROGRESS"),
        teamIds.length > 0
          ? sql`(${gameSessions.userId} = ${userId} OR ${gameSessions.teamId} IN ${teamIds})`
          : eq(gameSessions.userId, userId),
      ),
    );

  const sessionByCase = new Map<number, (typeof activeSessions)[0]>();
  for (const s of activeSessions) {
    sessionByCase.set(s.caseId, s);
  }

  return activeCases.map((c) => {
    const s = sessionByCase.get(c.id);
    return {
      ...c,
      activeSessionId: s?.id ?? null,
      activeSessionStatus: s?.status ?? null,
      activeSessionScore: s?.score ?? null,
    };
  });
}
