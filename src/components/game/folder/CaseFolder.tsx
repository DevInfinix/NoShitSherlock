"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { soundEngine } from "@/lib/audio/sound-engine";
import { requestHintAction, submitAnswerAction } from "@/server/actions/gameplay-actions";
import type { SessionCaseFile } from "@/server/services/game-session-service";
import { useFolderStore } from "@/store/folder-store";
import { DetectiveDesk3D } from "../desk/DetectiveDesk3D";
import { NotebookDrawer } from "../notebook/NotebookDrawer";
import { CrypticQuestion } from "./CrypticQuestion";
import { FillDashesQuestion } from "./FillDashesQuestion";
import { McqQuestion } from "./McqQuestion";
import { TrueFalseQuestion } from "./TrueFalseQuestion";
import { VoicemailQuestion } from "./VoicemailQuestion";

export interface CaseFolderProps {
  initialCaseFile: SessionCaseFile;
}

export function CaseFolder({ initialCaseFile }: CaseFolderProps) {
  const [caseFile, setCaseFile] = useState<SessionCaseFile>(initialCaseFile);
  const [submittingQId, setSubmittingQId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"inspection" | "reading">("reading");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const { activeSectionIndex, setActiveSectionIndex } = useFolderStore();

  const currentSection = caseFile.sections[activeSectionIndex] ?? caseFile.sections[0];
  const sectionQuestions = currentSection
    ? caseFile.questions.filter((q) => q.sectionId === currentSection.id)
    : [];

  const allSectionsSolved = caseFile.sections.every((sec) => {
    const secQs = caseFile.questions.filter((q) => q.sectionId === sec.id);
    return secQs.length > 0 && secQs.every((q) => caseFile.questionStates[q.id]?.isSolved);
  });

  const handleAnswerSubmit = async (questionId: number, answer: string) => {
    setSubmittingQId(questionId);
    setFeedback(null);
    soundEngine.playTypewriter();

    const res = await submitAnswerAction({
      sessionId: caseFile.session.id,
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
      soundEngine.playStamp();
      setFeedback({
        type: "success",
        message: `Deduction confirmed! +${result.score - caseFile.session.score} points awarded. Clues unlocked into your field notebook.`,
      });

      // Update local state
      setCaseFile((prev) => ({
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
        unlockedClues: result.unlockedClues
          ? [
              ...prev.unlockedClues,
              ...result.unlockedClues
                .filter((uc) => !prev.unlockedClues.some((existing) => existing.id === uc.id))
                .map((uc) => ({
                  ...uc,
                  metadata: null,
                  unlockedAt: new Date(),
                })),
            ]
          : prev.unlockedClues,
      }));
    } else {
      setFeedback({
        type: "error",
        message: `Incorrect deduction. Penalty applied. Attempts used: ${result.attemptsUsed}`,
      });

      setCaseFile((prev) => ({
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
            solvedAt: prev.questionStates[questionId]?.solvedAt ?? null,
          },
        },
      }));
    }
  };

  const handleRequestHint = async (hintId: number, questionId: number) => {
    soundEngine.playPaper();
    const res = await requestHintAction({
      sessionId: caseFile.session.id,
      questionId,
      hintId,
    });

    if (!res.success || !res.result) {
      setFeedback({ type: "error", message: res.error ?? "Failed to consult archives." });
      return;
    }

    const result = res.result;
    setCaseFile((prev) => ({
      ...prev,
      session: {
        ...prev.session,
        score: result.score,
      },
      hints: prev.hints.map((h) =>
        h.id === hintId ? { ...h, isUnlocked: true, hintText: result.hintText } : h,
      ),
    }));

    setFeedback({
      type: "info",
      message: result.isAlreadyUnlocked
        ? "Archived lead re-examined."
        : `Archived hint consulted. -${result.costPoints} deduction points incurred.`,
    });
  };

  const switchSection = (newIndex: number) => {
    soundEngine.playPaper();
    setActiveSectionIndex(newIndex);
    setFeedback(null);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0C0907] text-[#1D1612]">
      {/* 3D Detective Desk Environment (Banker Lamp + Props + Parallax) */}
      <div className="fixed inset-0 z-0 opacity-90 pointer-events-none">
        <DetectiveDesk3D
          viewMode={viewMode}
          onToggleViewMode={() =>
            setViewMode((prev) => (prev === "reading" ? "inspection" : "reading"))
          }
        />
      </div>

      {/* Atmospheric Vignette & Warm Spotlight Wash */}
      <div className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(circle_at_50%_40%,rgba(255,241,204,0.06)_0%,rgba(9,8,7,0.75)_80%)]" />

      {/* Foreground Interactive Content Layer */}
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-start px-3 py-6 sm:px-6 lg:py-10">
        {/* Top Bureau Investigation HUD */}
        <header className="mb-6 flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 border border-[#A9874A]/40 bg-[#15110F]/90 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link
              href="/cases"
              className="flex items-center gap-1.5 border border-[#A9874A]/40 px-3 py-1 font-mono text-[11px] tracking-wider uppercase text-[#E7DDC8] transition-colors hover:border-[#A9874A] hover:bg-[#A9874A]/10"
            >
              <span>&larr;</span> Case Archives
            </Link>
            <div>
              <span className="block font-mono text-[10px] tracking-widest uppercase text-[#A9874A]">
                CONFIDENTIAL CASE FILE {"//"} NO. {caseFile.case.id.toString().padStart(3, "0")}
              </span>
              <h1 className="font-serif text-xl font-bold tracking-tight text-[#E7DDC8] md:text-2xl">
                {caseFile.case.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right">
              <span className="block font-mono text-[10px] tracking-wider uppercase text-[#78716A]">
                Score
              </span>
              <span className="font-mono text-xl font-bold text-[#E7DDC8] sm:text-2xl">
                {caseFile.session.score} PTS
              </span>
            </div>

            <div className="border-l border-[#A9874A]/30 pl-4 text-right sm:pl-6">
              <span className="block font-mono text-[10px] tracking-wider uppercase text-[#78716A]">
                Clues Found
              </span>
              <span className="font-mono text-xl font-bold text-[#A9874A] sm:text-2xl">
                {caseFile.unlockedClues.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setViewMode((prev) => (prev === "reading" ? "inspection" : "reading"))}
              className="hidden sm:inline-flex items-center gap-1.5 border border-[#A9874A]/50 bg-[#211812] px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase text-[#E7DDC8] hover:border-[#A9874A] hover:bg-[#A9874A]/20 transition-all cursor-pointer"
            >
              {viewMode === "reading" ? "3D Desk View" : "Forensic Focus"}
            </button>
          </div>
        </header>

        {/* Global Feedback Banner */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 w-full max-w-5xl border p-3.5 font-mono text-xs ${
                feedback.type === "success"
                  ? "border-emerald-600/70 bg-emerald-950/80 text-emerald-200"
                  : feedback.type === "error"
                    ? "border-[#A92A28]/80 bg-[#641B1B]/80 text-[#E7DDC8]"
                    : "border-[#A9874A]/60 bg-[#15110F]/90 text-[#E7DDC8]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{feedback.message}</span>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="ml-4 text-xs hover:text-white cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Physical Vintage Manila Case Folder Container */}
        <motion.div
          animate={{
            rotateX: viewMode === "inspection" ? 10 : 0,
            scale: viewMode === "inspection" ? 0.95 : 1,
            y: viewMode === "inspection" ? 20 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformPerspective: 1200 }}
          className="relative w-full max-w-5xl"
        >
          {/* Manila Folder Tab Strip (Staggered Die-Cut File Tabs) */}
          <div className="flex flex-wrap items-end gap-1.5 pl-4 sm:pl-8 overflow-x-auto scrollbar-none">
            {caseFile.sections.map((sec, index) => {
              const isActive = index === activeSectionIndex;
              const secQs = caseFile.questions.filter((q) => q.sectionId === sec.id);
              const solvedCount = secQs.filter(
                (q) => caseFile.questionStates[q.id]?.isSolved,
              ).length;
              const isSectionComplete = secQs.length > 0 && solvedCount === secQs.length;

              return (
                <button
                  type="button"
                  key={sec.id}
                  onClick={() => switchSection(index)}
                  className={`relative flex items-center gap-2 rounded-t-md px-4 py-2.5 font-mono text-xs tracking-wider uppercase transition-all cursor-pointer ${
                    isActive
                      ? "z-10 bg-[#E7DDC8] text-[#1C1510] shadow-[0_-2px_8px_rgba(0,0,0,0.3)] font-bold border-t-2 border-x-2 border-[#D4C3A3]"
                      : "bg-[#D8CCAE] text-[#554436] hover:bg-[#DFD4B8] border-t border-x border-[#C2B291]"
                  }`}
                >
                  {/* Brass eyelet icon */}
                  <span
                    className={`h-1.5 w-1.5 rounded-full border ${
                      isActive ? "border-[#A9874A] bg-[#A9874A]" : "border-[#78716A]"
                    }`}
                  />
                  <span>SEC 0{sec.sectionOrder}</span>
                  {isSectionComplete ? (
                    <span className="text-[10px] font-black text-[#A92A28]">[CLEARED]</span>
                  ) : (
                    <span className="text-[10px] text-[#78716A]">
                      ({solvedCount}/{secQs.length})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Folder Manila Paper Body */}
          <div className="relative rounded-b-lg rounded-tr-lg border-2 border-[#D4C3A3] bg-[#E7DDC8] p-6 shadow-2xl shadow-black/85 sm:p-10 text-[#1C1510]">
            {/* Subtle vintage paper texture overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-b-lg rounded-tr-lg bg-[radial-gradient(#C4B290_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

            {/* Brass Paperclip Decorative Accent */}
            <div className="pointer-events-none absolute -top-3 right-8 z-30">
              <div className="h-10 w-4 rounded-full border-2 border-[#A9874A] bg-[#A9874A]/20 shadow-md" />
            </div>

            {/* Left Edge Spine Tape & Grommets */}
            <div className="pointer-events-none absolute top-0 bottom-0 left-0 w-3 rounded-l-md bg-gradient-to-r from-[#CBB998] to-transparent border-r border-[#C2B190]/60 flex flex-col justify-around py-12 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1C1510]/30" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#1C1510]/30" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#1C1510]/30" />
            </div>

            {/* Active Section Content Container */}
            <AnimatePresence mode="wait">
              {currentSection && (
                <motion.div
                  key={currentSection.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-8 pl-2 sm:pl-4"
                >
                  {/* Section File Heading */}
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-[#1C1510]/20 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="border border-[#A92A28] px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase text-[#A92A28]">
                          EVIDENCE SECTION 0{currentSection.sectionOrder}
                        </span>
                        {currentSection.timeLimitSeconds && (
                          <span className="font-mono text-[11px] text-[#641B1B]">
                            TIME LIMIT: {currentSection.timeLimitSeconds}s
                          </span>
                        )}
                      </div>
                      <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-[#1C1510] md:text-3xl">
                        {currentSection.title}
                      </h2>
                    </div>

                    {/* Rubber Stamp Watermark */}
                    <div className="rotate-[-6deg] select-none border-2 border-[#A92A28] px-3 py-1 text-center font-mono text-[11px] font-bold tracking-widest uppercase text-[#A92A28]">
                      CONFIDENTIAL ARCHIVE
                    </div>
                  </div>

                  {/* Section Narrative Blotter */}
                  <div className="rounded border-l-4 border-[#641B1B] bg-[#DFD3B9]/60 p-4 sm:p-5 shadow-inner">
                    <span className="block font-mono text-[10px] tracking-widest uppercase text-[#641B1B]">
                      OFFICER DISPATCH & WITNESS NOTES
                    </span>
                    <p className="mt-2 font-serif text-base leading-relaxed text-[#2A2018] md:text-lg">
                      {currentSection.narrative}
                    </p>
                  </div>

                  {/* Section Questions Stack */}
                  <div className="space-y-8">
                    {sectionQuestions.map((q) => {
                      const qState = caseFile.questionStates[q.id];
                      const qHints = caseFile.hints.filter((h) => h.questionId === q.id);
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

                  {/* Section Turn Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-[#1C1510]/15 pt-6">
                    <button
                      type="button"
                      disabled={activeSectionIndex === 0}
                      onClick={() => switchSection(Math.max(0, activeSectionIndex - 1))}
                      className="border border-[#1C1510]/50 bg-[#DFD3B9]/40 px-4 py-2 font-mono text-xs tracking-wider uppercase text-[#1C1510] transition-colors hover:border-[#1C1510] hover:bg-[#DFD3B9] disabled:opacity-30 cursor-pointer"
                    >
                      &larr; Previous Page
                    </button>

                    <span className="font-mono text-xs text-[#554436]">
                      Sheet {activeSectionIndex + 1} of {caseFile.sections.length}
                    </span>

                    {activeSectionIndex < caseFile.sections.length - 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          switchSection(
                            Math.min(caseFile.sections.length - 1, activeSectionIndex + 1),
                          )
                        }
                        className="border border-[#1C1510]/50 bg-[#DFD3B9]/40 px-4 py-2 font-mono text-xs tracking-wider uppercase text-[#1C1510] transition-colors hover:border-[#1C1510] hover:bg-[#DFD3B9] cursor-pointer"
                      >
                        Next Page &rarr;
                      </button>
                    ) : (
                      <Link
                        href={`/pinboard/${caseFile.case.slug}`}
                        className="border-2 border-[#A92A28] bg-[#641B1B] px-5 py-2.5 font-mono text-xs font-bold tracking-wider uppercase text-[#E7DDC8] shadow-lg transition-all hover:bg-[#A92A28]"
                      >
                        Proceed to Evidence Pinboard &rarr;
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Completed Clearance Banner when all sections are solved */}
            {allSectionsSolved && (
              <div className="mt-8 rounded border-2 border-dashed border-[#A92A28] bg-[#A92A28]/10 p-6 text-center">
                <span className="font-mono text-xs font-bold tracking-widest text-[#A92A28]">
                  ALL 5 SECTIONS CLEARED {"//"} TIMELINE VERIFICATION REQUIRED
                </span>
                <p className="mt-1 font-serif text-sm text-[#2A2018]">
                  All investigative clues have been collected into your field notebook. Assemble the
                  chronological sequence on the cork pinboard to solve the case.
                </p>
                <div className="mt-4">
                  <Link
                    href={`/pinboard/${caseFile.case.slug}`}
                    className="inline-block border-2 border-[#A92A28] bg-[#641B1B] px-6 py-3 font-mono text-xs font-bold tracking-widest uppercase text-[#E7DDC8] transition-all hover:bg-[#A92A28]"
                  >
                    Open Evidence Pinboard &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Floating Detective Field Notebook Drawer */}
        <NotebookDrawer unlockedClues={caseFile.unlockedClues} />
      </div>
    </div>
  );
}
