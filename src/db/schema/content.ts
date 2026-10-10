import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const assetTypeEnum = pgEnum("asset_type", ["IMAGE", "AUDIO", "PDF", "DOCUMENT"]);
export const questionTypeEnum = pgEnum("question_type", [
  "FILL_DASHES",
  "MCQ",
  "TRUE_FALSE",
  "CRYPTIC",
  "VOICEMAIL_TRANSCRIPT",
]);

export const cases = pgTable(
  "cases",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    difficulty: integer("difficulty").notNull().default(1),
    maxScore: integer("max_score").notNull().default(1000),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("cases_difficulty_check", sql`${table.difficulty} >= 1 AND ${table.difficulty} <= 5`),
    check("cases_max_score_check", sql`${table.maxScore} >= 0`),
  ],
);

export const assets = pgTable(
  "assets",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    caseId: bigint("case_id", { mode: "number" })
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    assetKey: text("asset_key").notNull(),
    assetType: assetTypeEnum("asset_type").notNull(),
    url: text("url").notNull(),
    mimeType: text("mime_type").notNull(),
    altText: text("alt_text").notNull(),
  },
  (table) => [unique("assets_case_key_unique").on(table.caseId, table.assetKey)],
);

export const sections = pgTable(
  "sections",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    caseId: bigint("case_id", { mode: "number" })
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    sectionOrder: integer("section_order").notNull(),
    title: text("title").notNull(),
    narrative: text("narrative").notNull(),
    folderPageAssetId: bigint("folder_page_asset_id", { mode: "number" }).references(
      () => assets.id,
      { onDelete: "set null" },
    ),
    timeLimitSeconds: integer("time_limit_seconds"),
  },
  (table) => [
    unique("sections_case_order_unique").on(table.caseId, table.sectionOrder),
    check("sections_order_check", sql`${table.sectionOrder} > 0`),
  ],
);

export const questions = pgTable(
  "questions",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    sectionId: bigint("section_id", { mode: "number" })
      .notNull()
      .references(() => sections.id, { onDelete: "cascade" }),
    questionKey: text("question_key").notNull(),
    questionType: questionTypeEnum("question_type").notNull(),
    prompt: text("prompt").notNull(),
    placeholderText: text("placeholder_text"),
    correctAnswer: text("correct_answer"),
    points: integer("points").notNull().default(100),
    maxAttempts: integer("max_attempts").notNull().default(5),
    penaltyPerWrong: integer("penalty_per_wrong").notNull().default(10),
    sortOrder: integer("sort_order").notNull().default(1),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  },
  (table) => [
    unique("questions_section_key_unique").on(table.sectionId, table.questionKey),
    check("questions_points_check", sql`${table.points} >= 0`),
    check("questions_attempts_check", sql`${table.maxAttempts} > 0`),
    check("questions_penalty_check", sql`${table.penaltyPerWrong} >= 0`),
  ],
);

export const questionOptions = pgTable(
  "question_options",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    questionId: bigint("question_id", { mode: "number" })
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    optionText: text("option_text").notNull(),
    isCorrect: boolean("is_correct").notNull().default(false),
    sortOrder: integer("sort_order").notNull(),
  },
  (table) => [
    unique("question_options_order_unique").on(table.questionId, table.sortOrder),
    uniqueIndex("question_options_single_correct_idx")
      .on(table.questionId)
      .where(sql`${table.isCorrect} = true`),
  ],
);

export const questionAssets = pgTable(
  "question_assets",
  {
    questionId: bigint("question_id", { mode: "number" })
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    assetId: bigint("asset_id", { mode: "number" })
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
    usageType: text("usage_type").notNull().default("PRIMARY"),
  },
  (table) => [primaryKey({ columns: [table.questionId, table.assetId] })],
);

export const clues = pgTable(
  "clues",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    caseId: bigint("case_id", { mode: "number" })
      .notNull()
      .references(() => cases.id, { onDelete: "cascade" }),
    clueKey: text("clue_key").notNull(),
    title: text("title").notNull(),
    clueText: text("clue_text").notNull(),
    chronologicalOrder: integer("chronological_order").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  },
  (table) => [
    unique("clues_case_key_unique").on(table.caseId, table.clueKey),
    unique("clues_case_order_unique").on(table.caseId, table.chronologicalOrder),
    check("clues_order_check", sql`${table.chronologicalOrder} > 0`),
  ],
);

export const clueAssets = pgTable(
  "clue_assets",
  {
    clueId: bigint("clue_id", { mode: "number" })
      .notNull()
      .references(() => clues.id, { onDelete: "cascade" }),
    assetId: bigint("asset_id", { mode: "number" })
      .notNull()
      .references(() => assets.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.clueId, table.assetId] })],
);

export const questionClues = pgTable(
  "question_clues",
  {
    questionId: bigint("question_id", { mode: "number" })
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    clueId: bigint("clue_id", { mode: "number" })
      .notNull()
      .references(() => clues.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.questionId, table.clueId] })],
);

export const hints = pgTable(
  "hints",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    questionId: bigint("question_id", { mode: "number" })
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    hintText: text("hint_text").notNull(),
    costPoints: integer("cost_points").notNull().default(20),
    hintOrder: integer("hint_order").notNull().default(1),
  },
  (table) => [
    unique("hints_question_order_unique").on(table.questionId, table.hintOrder),
    check("hints_cost_check", sql`${table.costPoints} >= 0`),
  ],
);
