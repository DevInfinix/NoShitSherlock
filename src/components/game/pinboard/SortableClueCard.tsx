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

  // Natural subtle tilt angle based on clue ID (between -2.5deg and +2.5deg)
  const baseTilt = (((clue.id * 13) % 9) - 4) * 0.55;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 2,
    rotate: isDragging ? "0deg" : `${baseTilt}deg`,
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
      data-clue-card
      className={`relative border-2 border-[#D4C3A3] bg-[#F4EDE0] p-5 shadow-xl transition-all select-none text-[#1C1510] ${
        isDragging
          ? "opacity-85 ring-4 ring-[#A92A28] shadow-2xl scale-105"
          : "hover:border-[#A9874A] hover:shadow-2xl"
      }`}
    >
      {/* Authentic Brass / Lacquered Pushpin at top center */}
      <div
        data-pushpin
        className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-[#E6BE75] via-[#C59E58] to-[#8C6B2D] border border-[#FFE8B3] flex items-center justify-center shadow-[0_3px_6px_rgba(0,0,0,0.6)] z-20"
      >
        <span className="w-2 h-2 rounded-full bg-[#A92A28] shadow-inner" />
      </div>

      {/* Card Header & Sequence Indicator */}
      <div className="flex items-center justify-between border-b border-[#1C1510]/15 pb-2.5 mb-3 pt-1">
        <span className="font-mono text-xs font-black text-[#A92A28] tracking-widest uppercase">
          TIMELINE POS #{index + 1}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] uppercase text-[#1C1510] bg-[#DFD3BA] px-2 py-0.5 border border-[#CBB895] font-bold">
            {clue.clueKey}
          </span>
          {meta?.tag && (
            <span className="font-mono text-[10px] uppercase text-[#641B1B] font-bold">
              [{meta.tag}]
            </span>
          )}
        </div>
      </div>

      {/* Card Drag Handle Body */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing focus:outline-hidden"
      >
        <h3 className="font-serif text-lg font-bold leading-snug mb-2 text-[#1C1510]">
          {clue.title}
        </h3>
        <p className="font-serif text-xs leading-relaxed text-[#382D24] line-clamp-4">
          {clue.clueText}
        </p>
      </div>

      {/* Footer Details & Accessible Reorder Controls */}
      <div className="mt-4 pt-2.5 border-t border-[#1C1510]/15 flex items-center justify-between text-[#554436]">
        <span className="font-mono text-[10px] font-bold">{meta?.timestamp ?? "INCIDENT LOG"}</span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={disabled || index === 0}
            onClick={onMoveUp}
            aria-label={`Move clue ${clue.title} earlier in timeline`}
            className="border border-[#1C1510]/30 bg-[#E8DCBF]/50 px-2 py-0.5 font-mono text-[10px] text-[#1C1510] hover:bg-[#E8DCBF] disabled:opacity-25 transition-colors cursor-pointer"
          >
            &uarr; EARLIER
          </button>
          <button
            type="button"
            disabled={disabled || index >= totalCount - 1}
            onClick={onMoveDown}
            aria-label={`Move clue ${clue.title} later in timeline`}
            className="border border-[#1C1510]/30 bg-[#E8DCBF]/50 px-2 py-0.5 font-mono text-[10px] text-[#1C1510] hover:bg-[#E8DCBF] disabled:opacity-25 transition-colors cursor-pointer"
          >
            &darr; LATER
          </button>
        </div>
      </div>
    </div>
  );
}
