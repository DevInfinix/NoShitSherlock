import { describe, expect, it } from "bun:test";
import { caseSchema } from "@/lib/case-schema";

describe("Case Schema Validation", () => {
  const validCase = {
    slug: "case-01-missing-ledger",
    title: "The Missing Ledger",
    description: "A high-stakes embezzlement and cold-blooded homicide.",
    difficulty: 3,
    maxScore: 1200,
    assets: [
      {
        assetKey: "crime-scene-ledger",
        assetType: "IMAGE" as const,
        url: "/cases/case-01-missing-ledger/images/ledger.webp",
        mimeType: "image/webp",
        altText: "Torn ledger page found on victim desk",
      },
    ],
    sections: [
      {
        sectionOrder: 1,
        title: "Act I: The Discovery",
        narrative: "The body was found at 02:00 AM.",
        questions: [
          {
            questionKey: "q1_1",
            questionType: "FILL_DASHES" as const,
            prompt: "What word was written across the ledger margin?",
            placeholderText: "______",
            correctAnswer: "BETRAYAL",
            points: 100,
            maxAttempts: 5,
            penaltyPerWrong: 10,
            sortOrder: 1,
            metadata: { acceptedVariants: ["BETRAYED"] },
            assetKeys: ["crime-scene-ledger"],
            hints: [{ hintText: "Look at the ink color", costPoints: 20, hintOrder: 1 }],
            unlockedClueKeys: ["clue_torn_ledger"],
          },
        ],
      },
      {
        sectionOrder: 2,
        title: "Act II: The Suspects",
        narrative: "Three associates had access to the safe.",
        questions: [
          {
            questionKey: "q2_1",
            questionType: "MCQ" as const,
            prompt: "Which suspect lacked an alibi between 01:00 and 02:00?",
            correctAnswer: null,
            points: 150,
            maxAttempts: 3,
            penaltyPerWrong: 25,
            sortOrder: 1,
            metadata: {},
            assetKeys: [],
            options: [
              { optionText: "Arthur Vance", isCorrect: true, sortOrder: 1 },
              { optionText: "Elena Rostova", isCorrect: false, sortOrder: 2 },
            ],
            hints: [],
            unlockedClueKeys: [],
          },
        ],
      },
      {
        sectionOrder: 3,
        title: "Act III: The Safe",
        narrative: "The combination was altered earlier that evening.",
        questions: [
          {
            questionKey: "q3_1",
            questionType: "TRUE_FALSE" as const,
            prompt: "The vault door was forced open with explosives.",
            correctAnswer: "false",
            points: 100,
            maxAttempts: 2,
            penaltyPerWrong: 20,
            sortOrder: 1,
            metadata: {},
            assetKeys: [],
            hints: [],
            unlockedClueKeys: [],
          },
        ],
      },
      {
        sectionOrder: 4,
        title: "Act IV: The Wiretap",
        narrative: "An intercepted call hints at an offshore account.",
        questions: [
          {
            questionKey: "q4_1",
            questionType: "VOICEMAIL_TRANSCRIPT" as const,
            prompt: "What city was mentioned in the audio recording?",
            correctAnswer: "Geneva",
            points: 120,
            maxAttempts: 5,
            penaltyPerWrong: 15,
            sortOrder: 1,
            metadata: {},
            assetKeys: [],
            hints: [],
            unlockedClueKeys: [],
          },
        ],
      },
      {
        sectionOrder: 5,
        title: "Act V: The Final Deduction",
        narrative: "Reconstruct the exact sequence of events.",
        questions: [
          {
            questionKey: "q5_1",
            questionType: "CRYPTIC" as const,
            prompt: "Decode the cipher left in the pocket watch.",
            correctAnswer: "MIDNIGHT",
            points: 200,
            maxAttempts: 4,
            penaltyPerWrong: 30,
            sortOrder: 1,
            metadata: {},
            assetKeys: [],
            hints: [],
            unlockedClueKeys: [],
          },
        ],
      },
    ],
    clues: [
      {
        clueKey: "clue_torn_ledger",
        title: "Torn Ledger Fragment",
        clueText: "Shows a transfer of 50,000 francs to an unlisted account.",
        chronologicalOrder: 1,
        metadata: {},
        assetKeys: ["crime-scene-ledger"],
      },
    ],
  };

  it("validates a compliant case specification", () => {
    const parsed = caseSchema.safeParse(validCase);
    expect(parsed.success).toBe(true);
  });

  it("rejects an MCQ with non-null correctAnswer", () => {
    const invalidCase = JSON.parse(JSON.stringify(validCase));
    invalidCase.sections[1].questions[0].correctAnswer = "Arthur Vance";
    const parsed = caseSchema.safeParse(invalidCase);
    expect(parsed.success).toBe(false);
  });

  it("rejects duplicate clue chronological order", () => {
    const invalidCase = JSON.parse(JSON.stringify(validCase));
    invalidCase.clues.push({
      clueKey: "clue_second",
      title: "Second Clue",
      clueText: "Another clue",
      chronologicalOrder: 1, // Duplicate order
      metadata: {},
      assetKeys: [],
    });
    const parsed = caseSchema.safeParse(invalidCase);
    expect(parsed.success).toBe(false);
  });

  it("rejects a question referencing an unknown clue", () => {
    const invalidCase = JSON.parse(JSON.stringify(validCase));
    invalidCase.sections[0].questions[0].unlockedClueKeys = ["non_existent_clue"];
    const parsed = caseSchema.safeParse(invalidCase);
    expect(parsed.success).toBe(false);
  });
});
