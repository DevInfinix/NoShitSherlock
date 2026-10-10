import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { db, pool } from "@/db/client";
import {
  assets,
  cases,
  clueAssets,
  clues,
  hints,
  questionAssets,
  questionClues,
  questionOptions,
  questions,
  sections,
} from "@/db/schema";
import { caseSchema } from "@/lib/case-schema";

export async function seedCases() {
  const casesDir = join(process.cwd(), "content", "cases");
  const entries = await readdir(casesDir, { withFileTypes: true });
  const caseDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  if (caseDirs.length === 0) {
    console.log("No case directories found in content/cases/.");
    return;
  }

  console.log(`Found ${caseDirs.length} case folder(s). Beginning seed...`);

  for (const caseDir of caseDirs) {
    const caseJsonPath = join(casesDir, caseDir, "case.json");
    let fileContent: string;
    try {
      fileContent = await readFile(caseJsonPath, "utf-8");
    } catch {
      console.warn(`Skipping ${caseDir}: missing case.json`);
      continue;
    }

    const rawData = JSON.parse(fileContent);
    const validatedCase = caseSchema.parse(rawData);

    console.log(`Seeding case: ${validatedCase.title} (${validatedCase.slug})...`);

    await db.transaction(async (tx) => {
      // 1. Upsert Case
      const [insertedCase] = await tx
        .insert(cases)
        .values({
          slug: validatedCase.slug,
          title: validatedCase.title,
          description: validatedCase.description,
          difficulty: validatedCase.difficulty,
          maxScore: validatedCase.maxScore,
          isActive: true,
        })
        .onConflictDoUpdate({
          target: cases.slug,
          set: {
            title: validatedCase.title,
            description: validatedCase.description,
            difficulty: validatedCase.difficulty,
            maxScore: validatedCase.maxScore,
            isActive: true,
          },
        })
        .returning();

      if (!insertedCase) {
        throw new Error(`Failed to upsert case ${validatedCase.slug}`);
      }

      const caseId = insertedCase.id;

      // 2. Upsert Assets
      const assetMap = new Map<string, number>();
      for (const assetData of validatedCase.assets) {
        const [assetRow] = await tx
          .insert(assets)
          .values({
            caseId,
            assetKey: assetData.assetKey,
            assetType: assetData.assetType,
            url: assetData.url,
            mimeType: assetData.mimeType,
            altText: assetData.altText,
          })
          .onConflictDoUpdate({
            target: [assets.caseId, assets.assetKey],
            set: {
              assetType: assetData.assetType,
              url: assetData.url,
              mimeType: assetData.mimeType,
              altText: assetData.altText,
            },
          })
          .returning();

        if (assetRow) {
          assetMap.set(assetData.assetKey, assetRow.id);
        }
      }

      // 3. Upsert Clues
      const clueMap = new Map<string, number>();
      for (const clueData of validatedCase.clues) {
        const [clueRow] = await tx
          .insert(clues)
          .values({
            caseId,
            clueKey: clueData.clueKey,
            title: clueData.title,
            clueText: clueData.clueText,
            chronologicalOrder: clueData.chronologicalOrder,
            metadata: clueData.metadata,
          })
          .onConflictDoUpdate({
            target: [clues.caseId, clues.clueKey],
            set: {
              title: clueData.title,
              clueText: clueData.clueText,
              chronologicalOrder: clueData.chronologicalOrder,
              metadata: clueData.metadata,
            },
          })
          .returning();

        if (clueRow) {
          clueMap.set(clueData.clueKey, clueRow.id);

          // Clue Assets
          for (const assetKey of clueData.assetKeys) {
            const assetId = assetMap.get(assetKey);
            if (assetId) {
              await tx
                .insert(clueAssets)
                .values({ clueId: clueRow.id, assetId })
                .onConflictDoNothing();
            }
          }
        }
      }

      // 4. Upsert Sections & Questions
      for (const sectionData of validatedCase.sections) {
        const folderPageAssetId = sectionData.folderPageAssetKey
          ? assetMap.get(sectionData.folderPageAssetKey)
          : undefined;

        const [sectionRow] = await tx
          .insert(sections)
          .values({
            caseId,
            sectionOrder: sectionData.sectionOrder,
            title: sectionData.title,
            narrative: sectionData.narrative,
            folderPageAssetId: folderPageAssetId ?? null,
            timeLimitSeconds: sectionData.timeLimitSeconds ?? null,
          })
          .onConflictDoUpdate({
            target: [sections.caseId, sections.sectionOrder],
            set: {
              title: sectionData.title,
              narrative: sectionData.narrative,
              folderPageAssetId: folderPageAssetId ?? null,
              timeLimitSeconds: sectionData.timeLimitSeconds ?? null,
            },
          })
          .returning();

        if (!sectionRow) continue;

        for (const questionData of sectionData.questions) {
          const [questionRow] = await tx
            .insert(questions)
            .values({
              sectionId: sectionRow.id,
              questionKey: questionData.questionKey,
              questionType: questionData.questionType,
              prompt: questionData.prompt,
              placeholderText: questionData.placeholderText ?? null,
              correctAnswer: questionData.correctAnswer ?? null,
              points: questionData.points,
              maxAttempts: questionData.maxAttempts,
              penaltyPerWrong: questionData.penaltyPerWrong,
              sortOrder: questionData.sortOrder,
              metadata: questionData.metadata,
            })
            .onConflictDoUpdate({
              target: [questions.sectionId, questions.questionKey],
              set: {
                questionType: questionData.questionType,
                prompt: questionData.prompt,
                placeholderText: questionData.placeholderText ?? null,
                correctAnswer: questionData.correctAnswer ?? null,
                points: questionData.points,
                maxAttempts: questionData.maxAttempts,
                penaltyPerWrong: questionData.penaltyPerWrong,
                sortOrder: questionData.sortOrder,
                metadata: questionData.metadata,
              },
            })
            .returning();

          if (!questionRow) continue;

          // Options
          if (questionData.options) {
            for (const option of questionData.options) {
              await tx
                .insert(questionOptions)
                .values({
                  questionId: questionRow.id,
                  optionText: option.optionText,
                  isCorrect: option.isCorrect,
                  sortOrder: option.sortOrder,
                })
                .onConflictDoUpdate({
                  target: [questionOptions.questionId, questionOptions.sortOrder],
                  set: {
                    optionText: option.optionText,
                    isCorrect: option.isCorrect,
                  },
                });
            }
          }

          // Question Assets
          for (const assetKey of questionData.assetKeys) {
            const assetId = assetMap.get(assetKey);
            if (assetId) {
              await tx
                .insert(questionAssets)
                .values({ questionId: questionRow.id, assetId })
                .onConflictDoNothing();
            }
          }

          // Question Clues
          for (const clueKey of questionData.unlockedClueKeys) {
            const clueId = clueMap.get(clueKey);
            if (clueId) {
              await tx
                .insert(questionClues)
                .values({ questionId: questionRow.id, clueId })
                .onConflictDoNothing();
            }
          }

          // Hints
          for (const hint of questionData.hints) {
            await tx
              .insert(hints)
              .values({
                questionId: questionRow.id,
                hintText: hint.hintText,
                costPoints: hint.costPoints,
                hintOrder: hint.hintOrder,
              })
              .onConflictDoUpdate({
                target: [hints.questionId, hints.hintOrder],
                set: {
                  hintText: hint.hintText,
                  costPoints: hint.costPoints,
                },
              });
          }
        }
      }
    });

    console.log(`Successfully seeded case: ${validatedCase.slug}`);
  }
}

// Execute directly if run as script
if (import.meta.main) {
  seedCases()
    .then(async () => {
      console.log("Seeding process completed.");
      await pool.end();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error("Seeding failed with error:", error);
      await pool.end();
      process.exit(1);
    });
}
