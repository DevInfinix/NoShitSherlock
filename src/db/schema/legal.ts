import { bigint, boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const legalAcceptances = pgTable("legal_acceptances", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  documentVersion: text("document_version").notNull().default("1.0"),
  isOver13: boolean("is_over_13").notNull(),
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }).notNull().defaultNow(),
  privacyAcceptedAt: timestamp("privacy_accepted_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  marketingOptIn: boolean("marketing_opt_in").notNull().default(false),
});
