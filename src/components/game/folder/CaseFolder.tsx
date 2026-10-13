"use client";

import { AnimatePresence, motion, type PanInfo } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SpotlightCursor } from "@/components/ui/spotlight-cursor";
import { soundEngine } from "@/lib/audio/sound-engine";
import {
  requestHintAction,
  restartCaseAction,
  submitAnswerAction,
} from "@/server/actions/gameplay-actions";
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

const pageVariants = {
  initial: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 30 : -30,
    rotateY: dir > 0 ? 8 : -8,
  }),
  animate: {
    opacity: 1,
    x: 0,
    rotateY: 0,
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -30 : 30,
    rotateY: dir > 0 ? -8 : 8,
  }),
};

export function CaseFolder({ initialCaseFile }: CaseFolderProps) {
  const [caseFile, setCaseFile] = useState<SessionCaseFile>(initialCaseFile);
  const [submittingQId, setSubmittingQId] = useState<number | null>(null);
  const [isCoverOpen, setIsCoverOpen] = useState(false);
  const [isLampLit, setIsLampLit] = useState(true);
  const [isRestarting, setIsRestarting] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [pageDirection, setPageDirection] = useState<1 | -1>(1);

  // Real-time synced stopwatch timer
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (!initialCaseFile.session.startedAt) return 0;
    const startMs = new Date(initialCaseFile.session.startedAt).getTime();
    return Math.max(0, Math.floor((Date.now() - startMs) / 1000));
  });

  const sectionStartTimeRef = useRef<number>(Date.now());

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

  // Keep timer updated every second
  useEffect(() => {
    const timer = setInterval(() => {
      if (!caseFile.session.startedAt) return;
      const startMs = new Date(caseFile.session.startedAt).getTime();
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [caseFile.session.startedAt]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOpenFolder = () => {
    soundEngine.playPaper();
    setIsCoverOpen(true);
    sectionStartTimeRef.current = Date.now();
  };

  const handleToggleLamp = () => {
    soundEngine.playStamp();
    setIsLampLit((prev) => !prev);
  };

  const handleRestartCase = async () => {
    setIsRestarting(true);
    soundEngine.playPaper();
    const res = await restartCaseAction(caseFile.case.slug);
    setIsRestarting(false);
    setShowRestartConfirm(false);

    if (res.success && res.session) {
      soundEngine.playStamp();
      const newSession = res.session;
      setCaseFile((prev) => ({
        ...prev,
        session: newSession,
        questionStates: Object.keys(prev.questionStates).reduce(
          (acc, qId) => {
            acc[Number(qId)] = {
              attemptsUsed: 0,
              isSolved: false,
              lastAttemptAt: null,
              solvedAt: null,
            };
            return acc;
          },
          {} as typeof prev.questionStates,
        ),
        hints: prev.hints.map((h) => ({ ...h, isUnlocked: false })),
        unlockedClues: [],
      }));
      setActiveSectionIndex(0);
      setElapsedSeconds(0);
      sectionStartTimeRef.current = Date.now();
      setFeedback({
        type: "info",
        message: "Investigation Dossier restarted. Timer and deductions reset to zero.",
      });
    } else {
      setFeedback({
        type: "error",
        message: res.error ?? "Failed to restart case.",
      });
    }
  };

  const switchSection = (newIndex: number) => {
    if (newIndex === activeSectionIndex) return;
    soundEngine.playPaper();
    setPageDirection(newIndex > activeSectionIndex ? 1 : -1);
    setActiveSectionIndex(newIndex);
    setFeedback(null);
    sectionStartTimeRef.current = Date.now();
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Horizontal swipe threshold: drag right-to-left flips forward, left-to-right flips backward
    if (info.offset.x < -70 && activeSectionIndex < caseFile.sections.length - 1) {
      switchSection(activeSectionIndex + 1);
    } else if (info.offset.x > 70 && activeSectionIndex > 0) {
      switchSection(activeSectionIndex - 1);
    }
  };

  const handleAnswerSubmit = async (questionId: number, answerText: string) => {
    setSubmittingQId(questionId);
    setFeedback(null);

    const timeTakenMs = Math.max(0, Date.now() - sectionStartTimeRef.current);

    const res = await submitAnswerAction({
      sessionId: caseFile.session.id,
      questionId,
      submittedAnswer: answerText,
      timeTakenMs,
    });

    setSubmittingQId(null);

    if (!res.success || !res.result) {
      soundEngine.playPaper();
      setFeedback({
        type: "error",
        message: res.error ?? "Deduction verification failed. Check attempt rules.",
      });
      return;
    }

    const { isCorrect, score, wrongAttempts, attemptsUsed, unlockedClues } = res.result;

    if (isCorrect) {
      soundEngine.playStamp();
      setFeedback({
        type: "success",
        message: `Deduction Verified. +${score - caseFile.session.score} PTS awarded. Evidence unlocked into Field Notebook!`,
      });
    } else {
      soundEngine.playStamp();
      const remaining = Math.max(
        0,
        (sectionQuestions.find((q) => q.id === questionId)?.maxAttempts ?? 5) - attemptsUsed,
      );
      setFeedback({
        type: "error",
        message: `Incorrect deduction. Attempt logged (${remaining} remaining). Penalty applied.`,
      });
    }

    setCaseFile((prev) => ({
      ...prev,
      session: {
        ...prev.session,
        score,
        wrongAttempts,
      },
      questionStates: {
        ...prev.questionStates,
        [questionId]: {
          attemptsUsed,
          isSolved: isCorrect || (prev.questionStates[questionId]?.isSolved ?? false),
          lastAttemptAt: new Date(),
          solvedAt: isCorrect ? new Date() : (prev.questionStates[questionId]?.solvedAt ?? null),
        },
      },
      unlockedClues: [
        ...prev.unlockedClues,
        ...unlockedClues
          .filter((uc) => !prev.unlockedClues.some((c) => c.id === uc.id))
          .map((uc) => ({
            ...uc,
            metadata: null,
            unlockedAt: new Date(),
          })),
      ],
    }));
  };

  const handleRequestHint = async (hintId: number, questionId: number) => {
    const res = await requestHintAction({
      sessionId: caseFile.session.id,
      questionId,
      hintId,
    });

    if (!res.success || !res.result) {
      setFeedback({
        type: "error",
        message: res.error ?? "Failed to consult archived lead.",
      });
      return;
    }

    soundEngine.playPaper();
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

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0C0907] text-[#1D1612] select-none">
      {/* Detective Flashlight Spotlight Cursor */}
      <SpotlightCursor />

      {/* 3D Detective Desk Environment (Banker Lamp + Props + Parallax) */}
      <div className="fixed inset-0 z-0 pointer-events-auto">
        <DetectiveDesk3D isLampLit={isLampLit} onToggleLamp={handleToggleLamp} />
      </div>

      {/* Atmospheric Vignette & Warm Spotlight Wash */}
      <div
        className={`pointer-events-none fixed inset-0 z-10 transition-opacity duration-700 ${
          isLampLit
            ? "bg-[radial-gradient(circle_at_50%_35%,rgba(255,236,190,0.08)_0%,rgba(9,8,7,0.72)_75%,rgba(4,3,2,0.92)_100%)] opacity-100"
            : "bg-[radial-gradient(circle_at_50%_35%,rgba(120,150,180,0.04)_0%,rgba(6,5,4,0.85)_75%,rgba(3,2,1,0.96)_100%)] opacity-100"
        }`}
      />

      {/* Foreground Interactive Content Layer */}
      <div className="relative z-20 flex min-h-screen flex-col items-center justify-start px-3 py-4 sm:px-6 lg:py-6">
        {/* Top Bureau Investigation HUD */}
        <header className="mb-4 flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 border border-[#A9874A]/40 bg-[#15110F]/95 p-3.5 shadow-2xl backdrop-blur-md text-[#E7DDC8]">
          <div className="flex items-center gap-3">
            <Link
              href="/cases"
              className="flex items-center gap-1.5 border border-[#A9874A]/40 bg-[#1D1611]/80 px-3 py-1 font-mono text-[11px] tracking-wider uppercase text-[#E7DDC8] transition-colors hover:border-[#A9874A] hover:bg-[#A9874A]/10"
            >
              <span>&larr;</span> Archives
            </Link>
            <div>
              <span className="block font-mono text-[10px] tracking-widest uppercase text-[#A9874A]">
                FILE #{caseFile.case.id.toString().padStart(3, "0")} {"//"} CONFIDENTIAL
              </span>
              <h1 className="font-serif text-lg font-bold tracking-tight text-[#E7DDC8] md:text-xl">
                {caseFile.case.title}
              </h1>
            </div>
          </div>

          {/* Central Real-Time Stopwatch Timer */}
          <div className="flex items-center gap-2 border border-[#A9874A]/40 bg-[#0E0B09] px-3.5 py-1.5 shadow-inner">
            <span className="h-2 w-2 rounded-full bg-[#A7192D] animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#A9874A] font-bold">
              TIMER:
            </span>
            <span className="font-mono text-sm font-bold tracking-widest text-[#FAF5EB]">
              {formatTimer(elapsedSeconds)}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="text-right">
              <span className="block font-mono text-[9px] tracking-wider uppercase text-[#78716A]">
                Score
              </span>
              <span className="font-mono text-lg font-bold text-[#E7DDC8] sm:text-xl">
                {caseFile.session.score} PTS
              </span>
            </div>

            {/* Banker Lamp Toggle Button (Easter Egg) */}
            <button
              type="button"
              onClick={handleToggleLamp}
              title="Toggle Banker's Desk Lamp"
              className={`border px-2.5 py-1.5 font-mono text-[10px] tracking-wider uppercase transition-colors cursor-pointer ${
                isLampLit
                  ? "border-[#2E7D46] bg-[#1B4D2E]/40 text-[#A8E6BA]"
                  : "border-[#78716A] bg-[#15110F] text-[#78716A]"
              }`}
            >
              💡 {isLampLit ? "LAMP: ON" : "LAMP: OFF"}
            </button>

            {/* Restart Investigation Button */}
            <button
              type="button"
              onClick={() => setShowRestartConfirm(true)}
              disabled={isRestarting}
              className="border border-[#A7192D]/70 bg-[#A7192D]/20 px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase text-[#E7DDC8] hover:bg-[#A7192D] hover:text-[#FAF5EB] transition-colors cursor-pointer"
            >
              Restart Case
            </button>
          </div>
        </header>

        {/* Restart Confirmation Modal */}
        <AnimatePresence>
          {showRestartConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.92, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 15 }}
                className="w-full max-w-md border-2 border-[#A7192D] bg-[#15110F] p-6 shadow-2xl text-[#E7DDC8]"
              >
                <div className="flex items-center gap-2 mb-3 border-b border-[#A7192D]/40 pb-2">
                  <span className="h-2 w-2 rounded-full bg-[#A7192D] animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#A7192D] font-bold">
                    RESTART INVESTIGATION PROTOCOL
                  </span>
                </div>
                <p className="font-serif text-sm text-[#D8CEBA] mb-6 leading-relaxed">
                  Restarting will abandon the current active dossier, reset your elapsed time, and
                  re-lock all deduction worksheets to zero. Are you sure you wish to restart?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRestartConfirm(false)}
                    className="border border-[#78716A] px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-[#A9874A] hover:border-[#A9874A] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleRestartCase}
                    disabled={isRestarting}
                    className="border-2 border-[#A7192D] bg-[#A7192D] px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-[#FAF5EB] hover:bg-[#8A111E] transition-colors cursor-pointer"
                  >
                    {isRestarting ? "Restarting..." : "Confirm Restart"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Feedback Banner */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mb-4 w-full max-w-5xl border px-4 py-2 font-mono text-xs tracking-wider uppercase shadow-lg ${
                feedback.type === "success"
                  ? "border-[#2E7D46] bg-[#14331E]/95 text-[#A8E6BA]"
                  : feedback.type === "error"
                    ? "border-[#A7192D] bg-[#3B1116]/95 text-[#F5B8BE]"
                    : "border-[#A9874A] bg-[#2A2016]/95 text-[#E7DDC8]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{feedback.message}</span>
                <button
                  type="button"
                  onClick={() => setFeedback(null)}
                  className="ml-4 font-bold opacity-75 hover:opacity-100 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Closed Manila Case Folder Arrival State */}
        {!isCoverOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative my-auto w-full max-w-3xl cursor-pointer"
            onClick={handleOpenFolder}
          >
            {/* 3D Drop Shadow on desk */}
            <div className="absolute inset-x-4 -bottom-4 h-8 bg-black/80 blur-xl rounded-full" />

            {/* Manila Folder Cover */}
            <div className="relative rounded-lg border-2 border-[#C9B38B] bg-[#DBC69D] p-8 sm:p-12 shadow-2xl shadow-black/90 text-[#1C1510] overflow-hidden">
              {/* Paper pulp noise texture */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#AA9368_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

              {/* Spine grommets and twine tie */}
              <div className="absolute left-0 top-0 bottom-0 w-6 border-r-2 border-[#BFA77D] bg-[#CBB58B] flex flex-col justify-around items-center py-8">
                <span className="h-2 w-2 rounded-full border border-[#7A643E] bg-[#C59E58]" />
                <span className="h-2 w-2 rounded-full border border-[#7A643E] bg-[#C59E58]" />
                <span className="h-2 w-2 rounded-full border border-[#7A643E] bg-[#C59E58]" />
              </div>

              {/* Classified Diagonal Red Rubber Stamp */}
              <div className="absolute top-8 right-8 rotate-[-12deg] border-4 border-[#A7192D] px-6 py-2">
                <span className="font-mono text-sm sm:text-base font-black tracking-widest text-[#A7192D] uppercase block">
                  RESTRICTED EVIDENCE {"//"} TOP SECRET
                </span>
              </div>

              <div className="pl-6 space-y-6">
                <div>
                  <span className="font-mono text-xs tracking-widest text-[#785938] uppercase block mb-1">
                    SCOTLAND YARD CRIMINAL INVESTIGATION ARCHIVE
                  </span>
                  <h2 className="font-serif text-2xl sm:text-4xl font-black text-[#140E0A] tracking-tight">
                    {caseFile.case.title}
                  </h2>
                </div>

                <p className="font-serif text-sm sm:text-base text-[#382A1E] leading-relaxed italic max-w-xl">
                  &ldquo;{caseFile.case.description}&rdquo;
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-[#A89169]/40 font-mono text-xs text-[#554030]">
                  <span>FILE NO: #{caseFile.case.id.toString().padStart(3, "0")}</span>
                  <span>
                    DIFFICULTY: {"★".repeat(caseFile.case.difficulty)}
                    {"☆".repeat(Math.max(0, 5 - caseFile.case.difficulty))}
                  </span>
                  <span>MAX REWARD: {caseFile.case.maxScore} PTS</span>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#785938] animate-pulse">
                    [CLICK OR DRAG TO UNSEAL CASE DOSSIER]
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenFolder();
                    }}
                    className="border-2 border-[#A7192D] bg-[#A7192D] hover:bg-[#8A1424] text-[#FAF5EB] px-6 py-2.5 font-mono text-xs uppercase tracking-widest font-bold shadow-xl transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    Unseal Dossier &rarr;
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Open Manila Investigation Dossier with Tactile Paper Physics */
          <div className="relative w-full max-w-5xl">
            {/* Manila Folder Tab Strip (Staggered File Tabs) */}
            <div className="flex flex-wrap items-end gap-1 pl-4 sm:pl-8 overflow-x-auto scrollbar-none">
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
                    className={`relative flex items-center gap-2 rounded-t-md px-3.5 py-2 font-mono text-xs tracking-wider uppercase transition-all cursor-pointer ${
                      isActive
                        ? "z-10 bg-[#E8DDC8] text-[#1C1510] font-bold border-t-2 border-x-2 border-[#D4C3A3] shadow-md"
                        : "bg-[#D6C6A2] text-[#554436] hover:bg-[#DECFA9] border-t border-x border-[#C2B291]"
                    }`}
                  >
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

              {allSectionsSolved && (
                <Link
                  href={`/pinboard/${caseFile.case.slug}`}
                  onClick={() => soundEngine.playStamp()}
                  className="relative z-10 flex items-center gap-2 rounded-t-md bg-[#A7192D] text-[#FAF5EB] font-mono text-xs tracking-wider uppercase font-bold px-4 py-2 shadow-lg animate-pulse hover:bg-[#8A1424] transition-colors"
                >
                  📌 TIMELINE PINBOARD &rarr;
                </Link>
              )}
            </div>

            {/* Folder Manila Paper Body with Interactive Drag-to-Flip Physics */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.22}
              onDragEnd={handleDragEnd}
              className="relative rounded-b-lg rounded-tr-lg border-2 border-[#D4C3A3] bg-[#E8DDC8] p-5 sm:p-9 shadow-2xl shadow-black/90 text-[#1C1510] cursor-grab active:cursor-grabbing"
            >
              {/* Subtle paper tooth grain overlay */}
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

              {/* Active Section Content Container with 3D Page Turn Animation */}
              <AnimatePresence mode="wait" custom={pageDirection}>
                {currentSection && (
                  <motion.div
                    key={currentSection.id}
                    custom={pageDirection}
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-6"
                  >
                    {/* Section Header */}
                    <div className="border-b-2 border-[#1C1510]/20 pb-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#78716A]">
                        <span>
                          EVIDENCE SECTION 0{currentSection.sectionOrder} OF{" "}
                          {caseFile.sections.length}
                        </span>
                        <span>DEDUCTION REQUISITION PROTOCOL</span>
                      </div>
                      <h2 className="mt-1 font-serif text-xl sm:text-2xl font-bold text-[#1C1510]">
                        {currentSection.title}
                      </h2>
                    </div>

                    {/* Section Narrative Dispatch */}
                    <div className="rounded-xs border-l-4 border-[#A9874A] bg-[#DFCFAA]/40 p-4 font-serif text-sm sm:text-base leading-relaxed text-[#2C241D]">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#A9874A] mb-1 font-bold">
                        <span>OFFICER DISPATCH &amp; WITNESS NOTES:</span>
                      </div>
                      <p>{currentSection.narrative}</p>
                    </div>

                    {/* Questions in Section */}
                    <div className="space-y-6">
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

                    {/* Dog-Eared Page Navigation Controls */}
                    <div className="pt-6 border-t border-[#1C1510]/20 flex items-center justify-between gap-4 font-mono text-xs">
                      {activeSectionIndex > 0 ? (
                        <button
                          type="button"
                          onClick={() => switchSection(activeSectionIndex - 1)}
                          className="flex items-center gap-1.5 border border-[#1C1510]/30 bg-[#DFCFAA]/50 px-3.5 py-1.5 text-[#1C1510] hover:bg-[#DFCFAA] transition-colors cursor-pointer"
                        >
                          &larr; Flip to SEC 0{activeSectionIndex}
                        </button>
                      ) : (
                        <div />
                      )}

                      <span className="text-[10px] text-[#785938] uppercase tracking-wider hidden sm:block">
                        [DRAG PAGE HORIZONTALLY TO FLIP &bull; SWIPE TO ADVANCE]
                      </span>

                      {activeSectionIndex < caseFile.sections.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => switchSection(activeSectionIndex + 1)}
                          className="flex items-center gap-1.5 border border-[#1C1510]/30 bg-[#DFCFAA]/50 px-3.5 py-1.5 text-[#1C1510] hover:bg-[#DFCFAA] transition-colors cursor-pointer"
                        >
                          Flip to SEC 0{activeSectionIndex + 2} &rarr;
                        </button>
                      ) : allSectionsSolved ? (
                        <Link
                          href={`/pinboard/${caseFile.case.slug}`}
                          onClick={() => soundEngine.playStamp()}
                          className="border-2 border-[#A7192D] bg-[#A7192D] text-[#FAF5EB] px-4 py-1.5 font-bold uppercase tracking-wider hover:bg-[#8A1424] transition-colors"
                        >
                          Deploy to Pinboard &rarr;
                        </Link>
                      ) : (
                        <div />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* Notebook Drawer Component */}
        <NotebookDrawer unlockedClues={caseFile.unlockedClues} />
      </div>
    </div>
  );
}
