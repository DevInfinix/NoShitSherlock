import { z } from "zod";

export const assetTypeSchema = z.enum(["IMAGE", "AUDIO", "PDF", "DOCUMENT"]);
export const questionTypeSchema = z.enum([
  "FILL_DASHES",
  "MCQ",
  "TRUE_FALSE",
  "CRYPTIC",
  "VOICEMAIL_TRANSCRIPT",
]);

export const caseAssetSchema = z.object({
  assetKey: z.string().min(1),
  assetType: assetTypeSchema,
  url: z.string().min(1),
  mimeType: z.string().min(1),
  altText: z.string().min(1),
});

export const questionOptionSchema = z.object({
  optionText: z.string().min(1),
  isCorrect: z.boolean(),
  sortOrder: z.number().int().min(1),
});

export const questionHintSchema = z.object({
  hintText: z.string().min(1),
  costPoints: z.number().int().min(0).default(20),
  hintOrder: z.number().int().min(1),
});

export const caseQuestionSchema = z
  .object({
    questionKey: z.string().min(1),
    questionType: questionTypeSchema,
    prompt: z.string().min(1),
    placeholderText: z.string().optional(),
    correctAnswer: z.string().nullable(),
    points: z.number().int().min(0).default(100),
    maxAttempts: z.number().int().min(1).default(5),
    penaltyPerWrong: z.number().int().min(0).default(10),
    sortOrder: z.number().int().min(1),
    metadata: z.record(z.string(), z.unknown()).default({}),
    assetKeys: z.array(z.string()).default([]),
    options: z.array(questionOptionSchema).optional(),
    hints: z.array(questionHintSchema).default([]),
    unlockedClueKeys: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.questionType === "MCQ") {
      if (data.correctAnswer !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "MCQ question must have correctAnswer set to null",
          path: ["correctAnswer"],
        });
      }
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "MCQ question must have at least 2 options",
          path: ["options"],
        });
      } else {
        const correctCount = data.options.filter((o) => o.isCorrect).length;
        if (correctCount !== 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `MCQ question must have exactly one correct option, found ${correctCount}`,
            path: ["options"],
          });
        }
      }
    } else {
      if (data.correctAnswer === null || data.correctAnswer.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${data.questionType} question requires non-empty correctAnswer`,
          path: ["correctAnswer"],
        });
      }
      if (data.questionType === "TRUE_FALSE") {
        const lower = data.correctAnswer?.toLowerCase();
        if (lower !== "true" && lower !== "false") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "TRUE_FALSE question correctAnswer must be 'true' or 'false'",
            path: ["correctAnswer"],
          });
        }
      }
    }
  });

export const caseSectionSchema = z.object({
  sectionOrder: z.number().int().min(1),
  title: z.string().min(1),
  narrative: z.string().min(1),
  folderPageAssetKey: z.string().optional(),
  timeLimitSeconds: z.number().int().positive().optional(),
  questions: z.array(caseQuestionSchema).min(1),
});

export const caseClueSchema = z.object({
  clueKey: z.string().min(1),
  title: z.string().min(1),
  clueText: z.string().min(1),
  chronologicalOrder: z.number().int().min(1),
  metadata: z.record(z.string(), z.unknown()).default({}),
  assetKeys: z.array(z.string()).default([]),
});

export const caseSchema = z
  .object({
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
    title: z.string().min(1),
    description: z.string().min(1),
    difficulty: z.number().int().min(1).max(5).default(1),
    maxScore: z.number().int().min(0).default(1000),
    assets: z.array(caseAssetSchema).default([]),
    sections: z.array(caseSectionSchema).length(5, "Each case must have exactly 5 sections"),
    clues: z.array(caseClueSchema).min(1),
  })
  .superRefine((data, ctx) => {
    // Validate uniqueness of chronologicalOrder across clues
    const clueOrders = new Set<number>();
    for (const clue of data.clues) {
      if (clueOrders.has(clue.chronologicalOrder)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate clue chronological order: ${clue.chronologicalOrder}`,
          path: ["clues"],
        });
      }
      clueOrders.add(clue.chronologicalOrder);
    }

    // Validate uniqueness of clueKey
    const clueKeys = new Set<string>();
    for (const clue of data.clues) {
      if (clueKeys.has(clue.clueKey)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate clueKey: ${clue.clueKey}`,
          path: ["clues"],
        });
      }
      clueKeys.add(clue.clueKey);
    }

    // Validate uniqueness of assetKey
    const assetKeys = new Set(data.assets.map((a) => a.assetKey));

    // Validate question keys uniqueness and unlocked clue references
    const questionKeys = new Set<string>();
    for (const section of data.sections) {
      for (const question of section.questions) {
        if (questionKeys.has(question.questionKey)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate questionKey: ${question.questionKey}`,
            path: ["sections"],
          });
        }
        questionKeys.add(question.questionKey);

        for (const clueKey of question.unlockedClueKeys) {
          if (!clueKeys.has(clueKey)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Question '${question.questionKey}' references unknown clueKey: ${clueKey}`,
              path: ["sections"],
            });
          }
        }

        for (const assetKey of question.assetKeys) {
          if (!assetKeys.has(assetKey)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Question '${question.questionKey}' references unknown assetKey: ${assetKey}`,
              path: ["sections"],
            });
          }
        }
      }
    }
  });

export type CaseSchema = z.infer<typeof caseSchema>;
export type CaseSectionSchema = z.infer<typeof caseSectionSchema>;
export type CaseQuestionSchema = z.infer<typeof caseQuestionSchema>;
export type CaseClueSchema = z.infer<typeof caseClueSchema>;
export type CaseAssetSchema = z.infer<typeof caseAssetSchema>;
