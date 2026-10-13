"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";
import { soundEngine } from "@/lib/audio/sound-engine";
import { submitPinboardAction } from "@/server/actions/pinboard-actions";
import type { PinboardCaseFile, SanitizedPinboardClue } from "@/server/services/pinboard-service";
import { CaseSolvedScreen } from "./CaseSolvedScreen";
import { SortableClueCard } from "./SortableClueCard";

export interface PinboardCorkboardProps {
  initialCaseFile?: PinboardCaseFile;
  initialDossier?: PinboardCaseFile;
}

export function PinboardCorkboard({ initialCaseFile, initialDossier }: PinboardCorkboardProps) {
  const caseFile = initialCaseFile ?? initialDossier;
  if (!caseFile) {
    throw new Error("PinboardCaseFile required");
  }

  const [clues, setClues] = useState<SanitizedPinboardClue[]>(caseFile.clues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSolved, setIsSolved] = useState(caseFile.isCompleted);
  const [solvedData, setSolvedData] = useState<{
    finalScore: number;
    totalTimeSeconds: number;
  }>({
    finalScore: caseFile.session.score,
    totalTimeSeconds: caseFile.session.totalTimeSeconds,
  });
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pinCoords, setPinCoords] = useState<Array<{ x: number; y: number }>>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Recalculate pushpin positions for procedural red yarn rendering
  const updateYarnCoordinates = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pinElements = containerRef.current.querySelectorAll<HTMLElement>("[data-pushpin]");
    const coords: Array<{ x: number; y: number }> = [];

    pinElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      coords.push({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
      });
    });

    setPinCoords(coords);
  };

  useEffect(() => {
    updateYarnCoordinates();
    window.addEventListener("resize", updateYarnCoordinates);
    const timer = setTimeout(updateYarnCoordinates, 150);
    return () => {
      window.removeEventListener("resize", updateYarnCoordinates);
      clearTimeout(timer);
    };
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      soundEngine.playPaper();
      setClues((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const updated = arrayMove(items, oldIndex, newIndex);
        setTimeout(updateYarnCoordinates, 50);
        return updated;
      });
    }
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= clues.length) return;
    soundEngine.playPaper();
    setClues((items) => {
      const updated = arrayMove(items, fromIndex, toIndex);
      setTimeout(updateYarnCoordinates, 50);
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting || isSolved) return;
    setIsSubmitting(true);
    setFeedback(null);
    soundEngine.playTypewriter();

    const clueOrder = clues.map((c) => c.id);
    const res = await submitPinboardAction({
      sessionId: caseFile.session.id,
      clueOrder,
    });

    setIsSubmitting(false);

    if (!res.success || !res.result) {
      soundEngine.playPaper();
      setFeedback({
        type: "error",
        message: res.error ?? "Failed to verify chronological sequence.",
      });
      return;
    }

    const result = res.result;
    if (result.isCorrect) {
      soundEngine.playStamp();
      setFeedback({
        type: "success",
        message: `Case Solved! Timeline confirmed with ${result.correctPlacementsCount}/${result.totalClues} chronological deductions. +${result.scoreAwarded} PTS awarded!`,
      });

      setSolvedData({
        finalScore: result.finalScore,
        totalTimeSeconds: result.totalTimeSeconds ?? caseFile.session.totalTimeSeconds,
      });

      setTimeout(() => {
        setIsSolved(true);
      }, 1600);
    } else {
      soundEngine.playStamp();
      setFeedback({
        type: "error",
        message: `Sequence Flawed. Only ${result.correctPlacementsCount} of ${result.totalClues} evidence events are chronologically accurate. -${result.penaltyApplied} PTS incurred. Cooldown in effect.`,
      });
    }
  };

  if (isSolved) {
    return (
      <CaseSolvedScreen
        caseTitle={caseFile.case.title}
        caseSlug={caseFile.case.slug}
        finalScore={solvedData.finalScore}
        totalTimeSeconds={solvedData.totalTimeSeconds}
        totalClues={clues.length}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
      {/* Pinboard Bureau Header */}
      <div className="border border-[#A9874A]/40 bg-[#15110F]/90 p-5 sm:p-6 mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#A9874A] block">
            SCOTLAND YARD {"//"} INCIDENT EVIDENCE PINBOARD
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#E7DDC8] font-bold mt-1">
            Reconstruct Chronological Timeline
          </h1>
          <p className="font-serif text-[#B8AD98] text-xs sm:text-sm mt-1 max-w-xl">
            Drag evidence cards to sequence recovered events from earliest to latest. The red yarn
            threads map your causal deduction.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting || clues.length === 0}
            onClick={handleSubmit}
            className="bg-[#641B1B] hover:bg-[#A92A28] text-[#E7DDC8] px-6 py-3 border-2 border-[#A92A28] font-mono text-xs uppercase tracking-wider font-bold disabled:opacity-40 shadow-xl transition-all cursor-pointer"
          >
            {isSubmitting ? "Verifying Sequence..." : "Confirm Chronology (+500 PTS)"}
          </button>
        </div>
      </div>

      {/* Operational Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 mb-6 border font-mono text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "border-[#A92A28]/80 bg-[#641B1B]/40 text-[#E7DDC8]"
              : "border-[#A92A28] bg-[#15110F] text-[#A92A28]"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs hover:text-white cursor-pointer ml-4"
          >
            &times;
          </button>
        </div>
      )}

      {/* Realistic Portuguese Corkboard with Heavy Walnut Bevel Frame */}
      <div className="relative rounded-lg border-[12px] sm:border-[16px] border-[#251810] shadow-[0_20px_50px_rgba(0,0,0,0.9),inset_0_4px_20px_rgba(0,0,0,0.7)] p-4 sm:p-8 overflow-hidden bg-[#7D5A3C]">
        {/* Procedural Cork Texture Overlays */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#5C3F26_1.5px,transparent_1.5px)] [background-size:8px_8px] opacity-40 mix-blend-multiply" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#966E4B_1px,transparent_1px)] [background-size:12px_12px] opacity-50" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" />

        {/* Four Decorative Brass Corner Brackets */}
        <div className="pointer-events-none absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#A9874A]/80 z-20" />
        <div className="pointer-events-none absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#A9874A]/80 z-20" />
        <div className="pointer-events-none absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#A9874A]/80 z-20" />
        <div className="pointer-events-none absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#A9874A]/80 z-20" />

        {/* Interactive Sorting Surface */}
        <div ref={containerRef} className="relative z-10">
          {/* Procedurally Rendered Red Yarn SVG Layer */}
          <svg
            className="absolute inset-0 pointer-events-none z-10 w-full h-full"
            aria-hidden="true"
          >
            {pinCoords.map((coord, idx) => {
              if (idx === pinCoords.length - 1) return null;
              const next = pinCoords[idx + 1];
              if (!next) return null;

              // Calculate natural gravitational catenary sag
              const dist = Math.hypot(next.x - coord.x, next.y - coord.y);
              const sag = Math.min(48, Math.max(14, dist * 0.12));
              const cpX = (coord.x + next.x) / 2;
              const cpY = (coord.y + next.y) / 2 + sag;
              const pathD = `M ${coord.x},${coord.y} Q ${cpX},${cpY} ${next.x},${next.y}`;

              const key = `yarn-${idx}`;
              return (
                <g key={key}>
                  {/* Dark Contact Drop Shadow on Cork */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="rgba(0, 0, 0, 0.45)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    transform="translate(1.5, 3.5)"
                  />
                  {/* Oxblood Deep Core Thread */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#641B1B"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                  />
                  {/* Vibrant Crimson Wool Yarn */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#A92A28"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </svg>

          {/* DND Kit Grid Context */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={clues.map((c) => c.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {clues.map((clue, index) => (
                  <SortableClueCard
                    key={clue.id}
                    clue={clue}
                    index={index}
                    totalCount={clues.length}
                    disabled={isSubmitting}
                    onMoveUp={() => handleMove(index, index - 1)}
                    onMoveDown={() => handleMove(index, index + 1)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Empty State Banner if no clues collected */}
        {clues.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-[#A9874A]/40 bg-[#15110F]/80 p-8 my-4 relative z-10">
            <span className="font-mono text-xs uppercase tracking-widest text-[#A9874A] block mb-2 font-bold">
              NO EVIDENCE RETRIEVED
            </span>
            <p className="font-serif text-[#E7DDC8] text-sm max-w-md mx-auto">
              You have not unlocked any field clues yet. Return to the case file and solve section
              deductions to gather evidence.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
