"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { requestHintAction, submitAnswerAction } from "@/server/actions/gameplay-actions";
import type { SessionDossier } from "@/server/services/game-session-service";
import { useFolderStore } from "@/store/folder-store";
import { NotebookDrawer } from "../notebook/NotebookDrawer";
import { CrypticQuestion } from "./CrypticQuestion";
import { FillDashesQuestion } from "./FillDashesQuestion";
import { McqQuestion } from "./McqQuestion";
import { TrueFalseQuestion } from "./TrueFalseQuestion";
import { VoicemailQuestion } from "./VoicemailQuestion";

interface DossierFolderProps {
  initialDossier: SessionDossier;
}

export function DossierFolder({ initialDossier }: DossierFolderProps) {
  const [dossier, setDossier] = useState<SessionDossier>(initialDossier);
  const [submittingQId, setSubmittingQId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const { activeSectionIndex, setActiveSectionIndex } = useFolderStore();

  const currentSection = dossier.sections[activeSectionIndex] ?? dossier.sections[0];
  const sectionQuestions = currentSection
    ? dossier.questions.filter((q) => q.sectionId === currentSection.id)
    : [];

  const handleAnswerSubmit = async (questionId: number, answer: string) => {
    setSubmittingQId(questionId);
    setFeedback(null);

    const res = await submitAnswerAction({
      sessionId: dossier.session.id,
      questionId,
      submittedAnswer: answer,
    });

    setSubmittingQId(null);

    if (!res.success || !res.result) {
      setFeedback({ type: "error", message: res.error ?? "Failed to verify deduction." });
      return;
    }

    const result = res.result;
    if (result.isCorrect) {
      setFeedback({
        type: "success",
        message: `Deduction confirmed! +${result.score - dossier.session.score} points awarded. Clues unlocked into your field notebook.`,
      });

      // Update local state
      setDossier((prev) => ({
        ...prev,
        session: {
          ...prev.session,
          score: result.score,
          wrongAttempts: result.wrongAttempts,
        },
        questionStates: {
          ...prev.questionStates,
          [questionId]: {
            attemptsUsed: result.attemptsUsed,
            isSolved: true,
            lastAttemptAt: new Date(),
            solvedAt: new Date(),
          },
        },
        unlockedClues: [
          ...prev.unlockedClues,
          ...result.unlockedClues.map((c) => ({
            ...c,
            metadata: null,
            unlockedAt: new Date(),
          })),
        ],
      }));
    } else {
      setFeedback({
        type: "error",
        message: `Incorrect deduction. Attempt filed. (${result.maxAttempts - result.attemptsUsed} attempts remaining)`,
      });

      setDossier((prev) => ({
        ...prev,
        session: {
          ...prev.session,
          score: result.score,
          wrongAttempts: result.wrongAttempts,
        },
        questionStates: {
          ...prev.questionStates,
          [questionId]: {
            attemptsUsed: result.attemptsUsed,
            isSolved: false,
            lastAttemptAt: new Date(),
            solvedAt: null,
          },
        },
      }));
    }
  };

  const handleRequestHint = async (hintId: number, questionId: number) => {
    const res = await requestHintAction({
      sessionId: dossier.session.id,
      questionId,
      hintId,
    });

    if (!res.success || !res.result) {
      setFeedback({ type: "error", message: res.error ?? "Failed to unlock informant hint." });
      return;
    }

    const result = res.result;
    setDossier((prev) => ({
      ...prev,
      session: {
        ...prev.session,
        score: result.score,
        hintBalance: result.hintBalance,
      },
      hints: prev.hints.map((h) =>
        h.id === hintId ? { ...h, isUnlocked: true, hintText: result.hintText } : h,
      ),
    }));

    setFeedback({
      type: "info",
      message: `Informant tip unlocked. Cost: ${result.costPoints} PTS.`,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Dossier Header Info Banner */}
      <div className="border border-brass/50 bg-ink-raised/90 p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-brass block">
            CONFIDENTIAL POLICE DOSSIER {"//"} CASE NO.{" "}
            {dossier.case.id.toString().padStart(3, "0")}
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-paper font-bold mt-1">
            {dossier.case.title}
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="font-mono text-xs text-smoke uppercase tracking-wider block">
              Deduction Score
            </span>
            <span className="font-mono text-2xl text-paper font-semibold">
              {dossier.session.score} PTS
            </span>
          </div>

          <div className="text-right border-l border-brass/30 pl-6">
            <span className="font-mono text-xs text-smoke uppercase tracking-wider block">
              Clues Unlocked
            </span>
            <span className="font-mono text-2xl text-brass font-semibold">
              {dossier.unlockedClues.length}
            </span>
          </div>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex border-b border-brass/40 overflow-x-auto scrollbar-none mb-6">
        {dossier.sections.map((sec, index) => {
          const isActive = index === activeSectionIndex;
          const secQs = dossier.questions.filter((q) => q.sectionId === sec.id);
          const solvedCount = secQs.filter((q) => dossier.questionStates[q.id]?.isSolved).length;
          const isComplete = secQs.length > 0 && solvedCount === secQs.length;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                setActiveSectionIndex(index);
                setFeedback(null);
              }}
              className={`px-5 py-3 border-t-2 font-mono text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "border-t-evidence-red bg-ink-raised border-x border-x-brass/40 text-paper font-semibold"
                  : "border-t-transparent hover:bg-ink-raised/40 text-paper-muted"
              }`}
            >
              <span>
                PART {sec.sectionOrder}: {sec.title}
              </span>
              {isComplete && <span className="ml-2 text-evidence-red">[CLEARED]</span>}
            </button>
          );
        })}
      </div>

      {/* Operational Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 mb-6 border font-mono text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "border-evidence-red/60 bg-oxblood/30 text-paper"
              : feedback.type === "error"
                ? "border-evidence-red bg-ink-raised text-evidence-red"
                : "border-brass/40 bg-ink-raised text-brass"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-smoke hover:text-paper ml-4 cursor-pointer"
          >
            [DISMISS]
          </button>
        </div>
      )}

      {/* Manila Evidence Folder Surface */}
      <AnimatePresence mode="wait">
        {currentSection && (
          <motion.div
            key={currentSection.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-2 border-brass/50 bg-ink-raised/40 p-6 md:p-8 space-y-8 shadow-2xl relative"
          >
            {/* Section Narrative Stamp */}
            <div className="border-b border-brass/30 pb-6">
              <span className="font-mono text-xs uppercase text-brass tracking-widest block mb-1">
                INCIDENT REPORT {"//"} SECTION {currentSection.sectionOrder}
              </span>
              <h2 className="font-serif text-2xl text-paper mb-3">{currentSection.title}</h2>
              <p className="font-serif text-paper-muted text-base leading-relaxed italic">
                "{currentSection.narrative}"
              </p>
            </div>

            {/* Questions Stack */}
            <div className="space-y-8">
              {sectionQuestions.map((q) => {
                const qHints = dossier.hints.filter((h) => h.questionId === q.id);
                const qState = dossier.questionStates[q.id];
                const isSubmitting = submittingQId === q.id;

                switch (q.questionType) {
                  case "FILL_DASHES":
                    return (
                      <FillDashesQuestion
                        key={q.id}
                        question={q}
                        state={qState}
                        hints={qHints}
                        isSubmitting={isSubmitting}
                        onSubmit={(ans) => handleAnswerSubmit(q.id, ans)}
                        onRequestHint={(hintId) => handleRequestHint(hintId, q.id)}
                      />
                    );
                  case "MCQ":
                    return (
                      <McqQuestion
                        key={q.id}
                        question={q}
                        state={qState}
                        hints={qHints}
                        isSubmitting={isSubmitting}
                        onSubmit={(ans) => handleAnswerSubmit(q.id, ans)}
                        onRequestHint={(hintId) => handleRequestHint(hintId, q.id)}
                      />
                    );
                  case "TRUE_FALSE":
                    return (
                      <TrueFalseQuestion
                        key={q.id}
                        question={q}
                        state={qState}
                        hints={qHints}
                        isSubmitting={isSubmitting}
                        onSubmit={(ans) => handleAnswerSubmit(q.id, ans)}
                        onRequestHint={(hintId) => handleRequestHint(hintId, q.id)}
                      />
                    );
                  case "CRYPTIC":
                    return (
                      <CrypticQuestion
                        key={q.id}
                        question={q}
                        state={qState}
                        hints={qHints}
                        isSubmitting={isSubmitting}
                        onSubmit={(ans) => handleAnswerSubmit(q.id, ans)}
                        onRequestHint={(hintId) => handleRequestHint(hintId, q.id)}
                      />
                    );
                  case "VOICEMAIL_TRANSCRIPT":
                    return (
                      <VoicemailQuestion
                        key={q.id}
                        question={q}
                        state={qState}
                        hints={qHints}
                        isSubmitting={isSubmitting}
                        onSubmit={(ans) => handleAnswerSubmit(q.id, ans)}
                        onRequestHint={(hintId) => handleRequestHint(hintId, q.id)}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </div>

            {/* Section Page Turn Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-brass/30">
              <button
                type="button"
                disabled={activeSectionIndex === 0}
                onClick={() => {
                  setActiveSectionIndex(Math.max(0, activeSectionIndex - 1));
                  setFeedback(null);
                }}
                className="border border-brass/40 px-4 py-2 font-mono text-xs uppercase tracking-wider text-brass hover:border-brass hover:text-paper disabled:opacity-30 transition-colors cursor-pointer"
              >
                &larr; Previous Dossier Page
              </button>

              <span className="font-mono text-xs text-smoke">
                Page {activeSectionIndex + 1} of {dossier.sections.length}
              </span>

              {activeSectionIndex >= dossier.sections.length - 1 ? (
                <Link
                  href={`/pinboard/${dossier.case.slug}`}
                  className="bg-oxblood hover:bg-evidence-red border-2 border-evidence-red text-paper px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors"
                >
                  Enter Pinboard Finale &rarr;
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActiveSectionIndex(
                      Math.min(dossier.sections.length - 1, activeSectionIndex + 1),
                    );
                    setFeedback(null);
                  }}
                  className="border border-brass/40 px-4 py-2 font-mono text-xs uppercase tracking-wider text-brass hover:border-brass hover:text-paper disabled:opacity-30 transition-colors cursor-pointer"
                >
                  Next Dossier Page &rarr;
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Field Notebook Drawer */}
      <NotebookDrawer unlockedClues={dossier.unlockedClues} />
    </div>
  );
}
