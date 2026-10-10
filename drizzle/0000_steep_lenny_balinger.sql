CREATE TYPE "public"."asset_type" AS ENUM('IMAGE', 'AUDIO', 'PDF', 'DOCUMENT');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('FILL_DASHES', 'MCQ', 'TRUE_FALSE', 'CRYPTIC', 'VOICEMAIL_TRANSCRIPT');--> statement-breakpoint
CREATE TYPE "public"."team_role" AS ENUM('owner', 'member');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('IN_PROGRESS', 'COMPLETED', 'ABANDONED');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "assets_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"case_id" bigint NOT NULL,
	"asset_key" text NOT NULL,
	"asset_type" "asset_type" NOT NULL,
	"url" text NOT NULL,
	"mime_type" text NOT NULL,
	"alt_text" text NOT NULL,
	CONSTRAINT "assets_case_key_unique" UNIQUE("case_id","asset_key")
);
--> statement-breakpoint
CREATE TABLE "cases" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cases_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"difficulty" integer DEFAULT 1 NOT NULL,
	"max_score" integer DEFAULT 1000 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cases_slug_unique" UNIQUE("slug"),
	CONSTRAINT "cases_difficulty_check" CHECK ("cases"."difficulty" >= 1 AND "cases"."difficulty" <= 5),
	CONSTRAINT "cases_max_score_check" CHECK ("cases"."max_score" >= 0)
);
--> statement-breakpoint
CREATE TABLE "clue_assets" (
	"clue_id" bigint NOT NULL,
	"asset_id" bigint NOT NULL,
	CONSTRAINT "clue_assets_clue_id_asset_id_pk" PRIMARY KEY("clue_id","asset_id")
);
--> statement-breakpoint
CREATE TABLE "clues" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "clues_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"case_id" bigint NOT NULL,
	"clue_key" text NOT NULL,
	"title" text NOT NULL,
	"clue_text" text NOT NULL,
	"chronological_order" integer NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "clues_case_key_unique" UNIQUE("case_id","clue_key"),
	CONSTRAINT "clues_case_order_unique" UNIQUE("case_id","chronological_order"),
	CONSTRAINT "clues_order_check" CHECK ("clues"."chronological_order" > 0)
);
--> statement-breakpoint
CREATE TABLE "hints" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "hints_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"question_id" bigint NOT NULL,
	"hint_text" text NOT NULL,
	"cost_points" integer DEFAULT 20 NOT NULL,
	"hint_order" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "hints_question_order_unique" UNIQUE("question_id","hint_order"),
	CONSTRAINT "hints_cost_check" CHECK ("hints"."cost_points" >= 0)
);
--> statement-breakpoint
CREATE TABLE "question_assets" (
	"question_id" bigint NOT NULL,
	"asset_id" bigint NOT NULL,
	"usage_type" text DEFAULT 'PRIMARY' NOT NULL,
	CONSTRAINT "question_assets_question_id_asset_id_pk" PRIMARY KEY("question_id","asset_id")
);
--> statement-breakpoint
CREATE TABLE "question_clues" (
	"question_id" bigint NOT NULL,
	"clue_id" bigint NOT NULL,
	CONSTRAINT "question_clues_question_id_clue_id_pk" PRIMARY KEY("question_id","clue_id")
);
--> statement-breakpoint
CREATE TABLE "question_options" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "question_options_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"question_id" bigint NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"sort_order" integer NOT NULL,
	CONSTRAINT "question_options_order_unique" UNIQUE("question_id","sort_order")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "questions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"section_id" bigint NOT NULL,
	"question_key" text NOT NULL,
	"question_type" "question_type" NOT NULL,
	"prompt" text NOT NULL,
	"placeholder_text" text,
	"correct_answer" text,
	"points" integer DEFAULT 100 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"penalty_per_wrong" integer DEFAULT 10 NOT NULL,
	"sort_order" integer DEFAULT 1 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "questions_section_key_unique" UNIQUE("section_id","question_key"),
	CONSTRAINT "questions_points_check" CHECK ("questions"."points" >= 0),
	CONSTRAINT "questions_attempts_check" CHECK ("questions"."max_attempts" > 0),
	CONSTRAINT "questions_penalty_check" CHECK ("questions"."penalty_per_wrong" >= 0)
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sections_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"case_id" bigint NOT NULL,
	"section_order" integer NOT NULL,
	"title" text NOT NULL,
	"narrative" text NOT NULL,
	"folder_page_asset_id" bigint,
	"time_limit_seconds" integer,
	CONSTRAINT "sections_case_order_unique" UNIQUE("case_id","section_order"),
	CONSTRAINT "sections_order_check" CHECK ("sections"."section_order" > 0)
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"team_id" bigint NOT NULL,
	"user_id" text NOT NULL,
	"role" "team_role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_members_team_id_user_id_pk" PRIMARY KEY("team_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "teams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"join_code" text NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teams_join_code_unique" UNIQUE("join_code")
);
--> statement-breakpoint
CREATE TABLE "game_sessions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "game_sessions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"case_id" bigint NOT NULL,
	"user_id" text,
	"team_id" bigint,
	"status" "session_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"current_section_id" bigint,
	"score" integer DEFAULT 0 NOT NULL,
	"hint_balance" integer DEFAULT 100 NOT NULL,
	"wrong_attempts" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"total_time_seconds" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "game_sessions_owner_check" CHECK (("game_sessions"."user_id" IS NOT NULL AND "game_sessions"."team_id" IS NULL) OR ("game_sessions"."user_id" IS NULL AND "game_sessions"."team_id" IS NOT NULL)),
	CONSTRAINT "game_sessions_score_check" CHECK ("game_sessions"."score" >= 0),
	CONSTRAINT "game_sessions_hint_balance_check" CHECK ("game_sessions"."hint_balance" >= 0),
	CONSTRAINT "game_sessions_wrong_attempts_check" CHECK ("game_sessions"."wrong_attempts" >= 0),
	CONSTRAINT "game_sessions_time_check" CHECK ("game_sessions"."total_time_seconds" >= 0)
);
--> statement-breakpoint
CREATE TABLE "hint_requests" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "hint_requests_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"session_id" bigint NOT NULL,
	"hint_id" bigint NOT NULL,
	"cost_points" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hint_requests_session_hint_unique" UNIQUE("session_id","hint_id"),
	CONSTRAINT "hint_requests_cost_check" CHECK ("hint_requests"."cost_points" >= 0)
);
--> statement-breakpoint
CREATE TABLE "pinboard_placements" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pinboard_placements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"submission_id" bigint NOT NULL,
	"clue_id" bigint NOT NULL,
	"placed_position" integer NOT NULL,
	"is_correct_position" boolean NOT NULL,
	CONSTRAINT "pinboard_placements_sub_clue_unique" UNIQUE("submission_id","clue_id"),
	CONSTRAINT "pinboard_placements_sub_pos_unique" UNIQUE("submission_id","placed_position"),
	CONSTRAINT "pinboard_placements_pos_check" CHECK ("pinboard_placements"."placed_position" > 0)
);
--> statement-breakpoint
CREATE TABLE "pinboard_submissions" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "pinboard_submissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"session_id" bigint NOT NULL,
	"is_correct" boolean NOT NULL,
	"score_awarded" integer DEFAULT 0 NOT NULL,
	"penalty_applied" integer DEFAULT 0 NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session_answers" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "session_answers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"session_id" bigint NOT NULL,
	"question_id" bigint NOT NULL,
	"answered_by_user_id" text,
	"submitted_answer" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"time_taken_ms" integer DEFAULT 0 NOT NULL,
	"hint_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_answers_time_check" CHECK ("session_answers"."time_taken_ms" >= 0)
);
--> statement-breakpoint
CREATE TABLE "session_clues" (
	"session_id" bigint NOT NULL,
	"clue_id" bigint NOT NULL,
	"source_question_id" bigint,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_clues_session_id_clue_id_pk" PRIMARY KEY("session_id","clue_id")
);
--> statement-breakpoint
CREATE TABLE "session_question_states" (
	"session_id" bigint NOT NULL,
	"question_id" bigint NOT NULL,
	"attempts_used" integer DEFAULT 0 NOT NULL,
	"is_solved" boolean DEFAULT false NOT NULL,
	"last_attempt_at" timestamp with time zone,
	"solved_at" timestamp with time zone,
	CONSTRAINT "session_question_states_session_id_question_id_pk" PRIMARY KEY("session_id","question_id"),
	CONSTRAINT "question_states_attempts_check" CHECK ("session_question_states"."attempts_used" >= 0)
);
--> statement-breakpoint
CREATE TABLE "legal_acceptances" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "legal_acceptances_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"document_version" text DEFAULT '1.0' NOT NULL,
	"is_over_13" boolean NOT NULL,
	"terms_accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"privacy_accepted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"marketing_opt_in" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clue_assets" ADD CONSTRAINT "clue_assets_clue_id_clues_id_fk" FOREIGN KEY ("clue_id") REFERENCES "public"."clues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clue_assets" ADD CONSTRAINT "clue_assets_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clues" ADD CONSTRAINT "clues_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hints" ADD CONSTRAINT "hints_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_assets" ADD CONSTRAINT "question_assets_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_assets" ADD CONSTRAINT "question_assets_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_clues" ADD CONSTRAINT "question_clues_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_clues" ADD CONSTRAINT "question_clues_clue_id_clues_id_fk" FOREIGN KEY ("clue_id") REFERENCES "public"."clues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_folder_page_asset_id_assets_id_fk" FOREIGN KEY ("folder_page_asset_id") REFERENCES "public"."assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_case_id_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_current_section_id_sections_id_fk" FOREIGN KEY ("current_section_id") REFERENCES "public"."sections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hint_requests" ADD CONSTRAINT "hint_requests_session_id_game_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hint_requests" ADD CONSTRAINT "hint_requests_hint_id_hints_id_fk" FOREIGN KEY ("hint_id") REFERENCES "public"."hints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pinboard_placements" ADD CONSTRAINT "pinboard_placements_submission_id_pinboard_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."pinboard_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pinboard_placements" ADD CONSTRAINT "pinboard_placements_clue_id_clues_id_fk" FOREIGN KEY ("clue_id") REFERENCES "public"."clues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pinboard_submissions" ADD CONSTRAINT "pinboard_submissions_session_id_game_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_answers" ADD CONSTRAINT "session_answers_session_id_game_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_answers" ADD CONSTRAINT "session_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_answers" ADD CONSTRAINT "session_answers_answered_by_user_id_user_id_fk" FOREIGN KEY ("answered_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_clues" ADD CONSTRAINT "session_clues_session_id_game_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_clues" ADD CONSTRAINT "session_clues_clue_id_clues_id_fk" FOREIGN KEY ("clue_id") REFERENCES "public"."clues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_clues" ADD CONSTRAINT "session_clues_source_question_id_questions_id_fk" FOREIGN KEY ("source_question_id") REFERENCES "public"."questions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_question_states" ADD CONSTRAINT "session_question_states_session_id_game_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."game_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_question_states" ADD CONSTRAINT "session_question_states_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_acceptances" ADD CONSTRAINT "legal_acceptances_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "question_options_single_correct_idx" ON "question_options" USING btree ("question_id") WHERE "question_options"."is_correct" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "game_sessions_active_user_case_idx" ON "game_sessions" USING btree ("user_id","case_id") WHERE "game_sessions"."status" = 'IN_PROGRESS' AND "game_sessions"."user_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "game_sessions_active_team_case_idx" ON "game_sessions" USING btree ("team_id","case_id") WHERE "game_sessions"."status" = 'IN_PROGRESS' AND "game_sessions"."team_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "game_sessions_user_case_idx" ON "game_sessions" USING btree ("user_id","case_id");--> statement-breakpoint
CREATE INDEX "game_sessions_team_case_idx" ON "game_sessions" USING btree ("team_id","case_id");--> statement-breakpoint
CREATE INDEX "game_sessions_leaderboard_idx" ON "game_sessions" USING btree ("case_id","status","score","total_time_seconds");--> statement-breakpoint
CREATE INDEX "session_answers_session_question_idx" ON "session_answers" USING btree ("session_id","question_id");