import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./auth";
import { cases, clues, hints, questions, sections } from "./content";
import { teams } from "./teams";

export const sessionStatusEnum = pgEnum("session_status", [
  "IN_PROGRESS",
  "COMPLETED",
  "ABANDONED",
]);

export const gameSessions = pgTable(
  "game_sessions",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    caseId: bigint("case_id", { mode: "number" })
      .notNull()
      .references(() => cases.id, { onDelete: "restrict" }),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    teamId: bigint("team_id", { mode: "number" }).references(() => teams.id, {
      onDelete: "cascade",
    }),
    status: sessionStatusEnum("status").notNull().default("IN_PROGRESS"),
    currentSectionId: bigint("current_section_id", { mode: "number" }).references(
      () => sections.id,
      { onDelete: "set null" },
    ),
    score: integer("score").notNull().default(0),
    hintBalance: integer("hint_balance").notNull().default(100),
    wrongAttempts: integer("wrong_attempts").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    totalTimeSeconds: integer("total_time_seconds").notNull().default(0),
  },
  (table) => [
    check(
      "game_sessions_owner_check",
      sql`(${table.userId} IS NOT NULL AND ${table.teamId} IS NULL) OR (${table.userId} IS NULL AND ${table.teamId} IS NOT NULL)`,
    ),
    check("game_sessions_score_check", sql`${table.score} >= 0`),
    check("game_sessions_hint_balance_check", sql`${table.hintBalance} >= 0`),
    check("game_sessions_wrong_attempts_check", sql`${table.wrongAttempts} >= 0`),
    check("game_sessions_time_check", sql`${table.totalTimeSeconds} >= 0`),
    uniqueIndex("game_sessions_active_user_case_idx")
      .on(table.userId, table.caseId)
      .where(sql`${table.status} = 'IN_PROGRESS' AND ${table.userId} IS NOT NULL`),
    uniqueIndex("game_sessions_active_team_case_idx")
      .on(table.teamId, table.caseId)
      .where(sql`${table.status} = 'IN_PROGRESS' AND ${table.teamId} IS NOT NULL`),
    index("game_sessions_user_case_idx").on(table.userId, table.caseId),
    index("game_sessions_team_case_idx").on(table.teamId, table.caseId),
    index("game_sessions_leaderboard_idx").on(
      table.caseId,
      table.status,
      table.score,
      table.totalTimeSeconds,
    ),
  ],
);

export const sessionQuestionStates = pgTable(
  "session_question_states",
  {
    sessionId: bigint("session_id", { mode: "number" })
      .notNull()
      .references(() => gameSessions.id, { onDelete: "cascade" }),
    questionId: bigint("question_id", { mode: "number" })
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    attemptsUsed: integer("attempts_used").notNull().default(0),
    isSolved: boolean("is_solved").notNull().default(false),
    lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
    solvedAt: timestamp("solved_at", { withTimezone: true }),
  },
  (table) => [
    primaryKey({ columns: [table.sessionId, table.questionId] }),
    check("question_states_attempts_check", sql`${table.attemptsUsed} >= 0`),
  ],
);

export const sessionAnswers = pgTable(
  "session_answers",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    sessionId: bigint("session_id", { mode: "number" })
      .notNull()
      .references(() => gameSessions.id, { onDelete: "cascade" }),
    questionId: bigint("question_id", { mode: "number" })
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    answeredByUserId: text("answered_by_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    submittedAnswer: text("submitted_answer").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    timeTakenMs: integer("time_taken_ms").notNull().default(0),
    hintUsed: boolean("hint_used").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("session_answers_session_question_idx").on(table.sessionId, table.questionId),
    check("session_answers_time_check", sql`${table.timeTakenMs} >= 0`),
  ],
);

export const sessionClues = pgTable(
  "session_clues",
  {
    sessionId: bigint("session_id", { mode: "number" })
      .notNull()
      .references(() => gameSessions.id, { onDelete: "cascade" }),
    clueId: bigint("clue_id", { mode: "number" })
      .notNull()
      .references(() => clues.id, { onDelete: "cascade" }),
    sourceQuestionId: bigint("source_question_id", { mode: "number" }).references(
      () => questions.id,
      { onDelete: "set null" },
    ),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.sessionId, table.clueId] })],
);

export const hintRequests = pgTable(
  "hint_requests",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    sessionId: bigint("session_id", { mode: "number" })
      .notNull()
      .references(() => gameSessions.id, { onDelete: "cascade" }),
    hintId: bigint("hint_id", { mode: "number" })
      .notNull()
      .references(() => hints.id, { onDelete: "cascade" }),
    costPoints: integer("cost_points").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("hint_requests_session_hint_unique").on(table.sessionId, table.hintId),
    check("hint_requests_cost_check", sql`${table.costPoints} >= 0`),
  ],
);

export const pinboardSubmissions = pgTable("pinboard_submissions", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  sessionId: bigint("session_id", { mode: "number" })
    .notNull()
    .references(() => gameSessions.id, { onDelete: "cascade" }),
  isCorrect: boolean("is_correct").notNull(),
  scoreAwarded: integer("score_awarded").notNull().default(0),
  penaltyApplied: integer("penalty_applied").notNull().default(0),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pinboardPlacements = pgTable(
  "pinboard_placements",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    submissionId: bigint("submission_id", { mode: "number" })
      .notNull()
      .references(() => pinboardSubmissions.id, { onDelete: "cascade" }),
    clueId: bigint("clue_id", { mode: "number" })
      .notNull()
      .references(() => clues.id, { onDelete: "cascade" }),
    placedPosition: integer("placed_position").notNull(),
    isCorrectPosition: boolean("is_correct_position").notNull(),
  },
  (table) => [
    unique("pinboard_placements_sub_clue_unique").on(table.submissionId, table.clueId),
    unique("pinboard_placements_sub_pos_unique").on(table.submissionId, table.placedPosition),
    check("pinboard_placements_pos_check", sql`${table.placedPosition} > 0`),
  ],
);
