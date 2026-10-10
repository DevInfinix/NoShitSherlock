import { describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { cases, clues, questions, sections } from "@/db/schema";

describe("Database Content Queries", () => {
  it("fetches seeded Case 01 with 5 sections and associated questions", async () => {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not set, skipping live database test.");
      return;
    }

    const [case01] = await db.select().from(cases).where(eq(cases.slug, "case-01-missing-ledger"));

    expect(case01).toBeDefined();
    if (!case01) return;
    expect(case01.title).toBe("The Missing Ledger");

    const caseSections = await db
      .select()
      .from(sections)
      .where(eq(sections.caseId, case01.id))
      .orderBy(sections.sectionOrder);

    expect(caseSections.length).toBe(5);

    const caseClues = await db
      .select()
      .from(clues)
      .where(eq(clues.caseId, case01.id))
      .orderBy(clues.chronologicalOrder);

    expect(caseClues.length).toBeGreaterThanOrEqual(4);

    const caseQuestions = await db.select().from(questions);
    expect(caseQuestions.length).toBeGreaterThanOrEqual(5);
  });
});
