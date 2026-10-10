"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SanitizedPinboardClue } from "@/server/services/pinboard-service";

interface SortableClueCardProps {
  clue: SanitizedPinboardClue;
  index: number;
  totalCount: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  disabled?: boolean;
}

export function SortableClueCard({
  clue,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
  disabled = false,
}: SortableClueCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: clue.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const meta = clue.metadata as {
    tag?: string;
    location?: string;
    timestamp?: string;
  } | null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border-2 border-brass/50 bg-ink-raised p-5 shadow-xl transition-shadow select-none ${
        isDragging
          ? "opacity-60 ring-2 ring-evidence-red shadow-2xl"
          : "hover:border-brass hover:shadow-2xl"
      }`}
    >
      {/* Decorative Brass Pushpin at top center */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-evidence-red border-2 border-paper flex items-center justify-center shadow-md z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-paper" />
      </div>

      {/* Card Header & Sequence Indicator */}
      <div className="flex items-center justify-between border-b border-brass/20 pb-3 mb-3 pt-1">
        <span className="font-mono text-xs font-bold text-evidence-red tracking-wider">
          TIMELINE #{index + 1}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase text-brass bg-ink px-2 py-0.5 border border-brass/30">
            {clue.clueKey}
          </span>
          {meta?.tag && (
            <span className="font-mono text-[10px] uppercase text-smoke">[{meta.tag}]</span>
          )}
        </div>
      </div>

      {/* Card Body / Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing focus:outline-hidden"
      >
        <h3 className="font-serif text-lg text-paper font-semibold leading-snug mb-2">
          {clue.title}
        </h3>
        <p className="font-serif text-paper-muted text-xs leading-relaxed line-clamp-3">
          {clue.clueText}
        </p>
      </div>

      {/* Keyboard Accessibility Controls */}
      <div className="mt-4 pt-3 border-t border-brass/20 flex items-center justify-between">
        <span className="font-mono text-[10px] text-smoke">
          {meta?.timestamp ?? "Time Recorded"}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={disabled || index === 0}
            onClick={onMoveUp}
            aria-label={`Move clue ${clue.title} earlier in timeline`}
            className="border border-brass/40 px-2 py-0.5 font-mono text-[10px] text-brass hover:border-brass disabled:opacity-20 transition-colors cursor-pointer"
          >
            &uarr; EARLIER
          </button>
          <button
            type="button"
            disabled={disabled || index >= totalCount - 1}
            onClick={onMoveDown}
            aria-label={`Move clue ${clue.title} later in timeline`}
            className="border border-brass/40 px-2 py-0.5 font-mono text-[10px] text-brass hover:border-brass disabled:opacity-20 transition-colors cursor-pointer"
          >
            &darr; LATER
          </button>
        </div>
      </div>
    </div>
  );
}
