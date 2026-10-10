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
import { submitPinboardAction } from "@/server/actions/pinboard-actions";
import type { PinboardDossier, SanitizedPinboardClue } from "@/server/services/pinboard-service";
import { CaseSolvedScreen } from "./CaseSolvedScreen";
import { SortableClueCard } from "./SortableClueCard";

interface PinboardCorkboardProps {
  initialDossier: PinboardDossier;
}

export function PinboardCorkboard({ initialDossier }: PinboardCorkboardProps) {
  const [clues, setClues] = useState<SanitizedPinboardClue[]>(initialDossier.clues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSolved, setIsSolved] = useState(initialDossier.isCompleted);
  const [solvedData, setSolvedData] = useState<{
    finalScore: number;
    totalTimeSeconds: number;
  }>({
    finalScore: initialDossier.session.score,
    totalTimeSeconds: initialDossier.session.totalTimeSeconds,
  });
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [lineCoords, setLineCoords] = useState<Array<{ x: number; y: number }>>([]);

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

  // Recalculate card center positions for the red yarn lines
  const updateYarnCoordinates = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const cardElements = containerRef.current.querySelectorAll<HTMLElement>("[data-clue-card]");
    const coords: Array<{ x: number; y: number }> = [];

    cardElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      coords.push({
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + 10, // top pushpin anchor
      });
    });

    setLineCoords(coords);
  };

  useEffect(() => {
    updateYarnCoordinates();
    window.addEventListener("resize", updateYarnCoordinates);
    return () => window.removeEventListener("resize", updateYarnCoordinates);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
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

    const clueOrder = clues.map((c) => c.id);
    const res = await submitPinboardAction({
      sessionId: initialDossier.session.id,
      clueOrder,
    });

    setIsSubmitting(false);

    if (!res.success || !res.result) {
      setFeedback({
        type: "error",
        message: res.error ?? "Failed to evaluate timeline sequence.",
      });
      return;
    }

    const { result } = res;
    if (result.isCorrect) {
      setIsSolved(true);
      setSolvedData({
        finalScore: result.finalScore,
        totalTimeSeconds: result.totalTimeSeconds ?? 0,
      });
    } else {
      setFeedback({
        type: "error",
        message: `Incorrect chronology (${result.correctPlacementsCount} of ${result.totalClues} clues in position). Deducted ${result.penaltyApplied} penalty points.`,
      });
    }
  };

  if (isSolved) {
    return (
      <CaseSolvedScreen
        caseTitle={initialDossier.case.title}
        finalScore={solvedData.finalScore}
        totalTimeSeconds={solvedData.totalTimeSeconds}
        caseSlug={initialDossier.case.slug}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Pinboard Header */}
      <div className="border border-brass/50 bg-ink-raised/90 p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-brass block">
            SCOTLAND YARD {"//"} INCIDENT EVIDENCE PINBOARD
          </span>
          <h1 className="font-serif text-3xl text-paper font-bold mt-1">
            Reconstruct Chronological Timeline
          </h1>
          <p className="font-serif text-paper-muted text-sm mt-1 max-w-xl">
            Drag evidence cards to sequence recovered events from earliest to latest. The red yarn
            maps your causal theory.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting || clues.length === 0}
            onClick={handleSubmit}
            className="bg-oxblood hover:bg-evidence-red text-paper px-6 py-3 border-2 border-evidence-red font-mono text-xs uppercase tracking-wider disabled:opacity-40 shadow-xl transition-all cursor-pointer"
          >
            {isSubmitting ? "Checking Sequence..." : "Confirm Chronology (+500 PTS)"}
          </button>
        </div>
      </div>

      {/* Operational Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 mb-6 border font-mono text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "border-evidence-red/60 bg-oxblood/30 text-paper"
              : "border-evidence-red bg-ink-raised text-evidence-red"
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

      {/* Corkboard Surface Container */}
      <div
        ref={containerRef}
        className="relative border-4 border-brass/60 bg-ink p-8 md:p-12 shadow-2xl min-h-[500px]"
      >
        {/* SVG Dynamic Red Yarn Layer */}
        {lineCoords.length > 1 && (
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            style={{ filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.7))" }}
          >
            <title>Chronological timeline red yarn connection lines</title>
            {lineCoords.map((coord, idx) => {
              if (idx === 0) return null;
              const prev = lineCoords[idx - 1];
              if (!prev) return null;
              return (
                <line
                  key={`yarn-${idx}`}
                  x1={prev.x}
                  y1={prev.y}
                  x2={coord.x}
                  y2={coord.y}
                  stroke="var(--color-evidence-red)"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
              );
            })}
          </svg>
        )}

        {/* Dnd Sortable Grid */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={clues.map((c) => c.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
              {clues.map((clue, index) => (
                <div key={clue.id} data-clue-card="true">
                  <SortableClueCard
                    clue={clue}
                    index={index}
                    totalCount={clues.length}
                    onMoveUp={() => handleMove(index, index - 1)}
                    onMoveDown={() => handleMove(index, index + 1)}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
