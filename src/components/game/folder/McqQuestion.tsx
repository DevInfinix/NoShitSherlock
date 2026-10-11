"use client";

import { useState } from "react";
import type { SanitizedHint, SanitizedQuestion } from "@/server/services/game-session-service";

interface QuestionProps {
  question: SanitizedQuestion;
  state?: {
    attemptsUsed: number;
    isSolved: boolean;
    lastAttemptAt: Date | null;
    solvedAt: Date | null;
  };
  hints: SanitizedHint[];
  isSubmitting: boolean;
  onSubmit: (answer: string) => Promise<void>;
  onRequestHint: (hintId: number) => Promise<void>;
}

export function McqQuestion({
  question,
  state,
  hints,
  isSubmitting,
  onSubmit,
  onRequestHint,
}: QuestionProps) {
  const isSolved = state?.isSolved ?? false;
  const attemptsUsed = state?.attemptsUsed ?? 0;
  const attemptsRemaining = Math.max(0, question.maxAttempts - attemptsUsed);
  const isExhausted = attemptsRemaining === 0 && !isSolved;

  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [showHints, setShowHints] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId || isSubmitting || isSolved || isExhausted) return;
    await onSubmit(String(selectedOptionId));
  };

  return (
    <div className="relative border-2 border-[#1C1510]/30 bg-[#F4EDE0] p-6 shadow-md text-[#1C1510]">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#1C1510]/20 pb-3 mb-4 gap-2">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#641B1B] font-bold block">
            ITEM 0{question.sortOrder} {"//"} EVIDENCE CLASSIFICATION REPORT
          </span>
          <span className="font-mono text-xs text-[#554436]">EXHIBIT ENTRY #{question.id}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="border border-[#1C1510]/30 bg-[#E8DCBF] px-2 py-0.5 font-mono text-[11px] font-bold text-[#1C1510]">
            {question.points} PTS
          </span>
          {isSolved && (
            <span className="border-2 border-[#A92A28] bg-[#A92A28]/15 px-2.5 py-0.5 font-mono text-xs font-black text-[#A92A28] uppercase tracking-wider rotate-[-2deg]">
              [VERIFIED ENTRY]
            </span>
          )}
          {isExhausted && (
            <span className="border-2 border-[#78716A] bg-[#78716A]/20 px-2.5 py-0.5 font-mono text-xs font-bold text-[#78716A] uppercase tracking-wider">
              [ATTEMPTS EXHAUSTED]
            </span>
          )}
        </div>
      </div>

      {/* Forensic Prompt */}
      <p className="font-serif text-base sm:text-lg leading-relaxed text-[#1C1510] mb-6 font-medium">
        {question.prompt}
      </p>

      {/* Radio Options Grid */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2.5">
          {question.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selectedOptionId === option.id;
            return (
              <label
                key={option.id}
                className={`flex items-center gap-3.5 p-3.5 border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#A92A28] bg-[#E8DCBF] shadow-sm text-[#1C1510]"
                    : "border-[#1C1510]/20 bg-[#FBF7EE] text-[#2A2018] hover:border-[#1C1510]/40 hover:bg-[#F2EBD9]"
                } ${isSolved || isExhausted ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name={`mcq-${question.id}`}
                  value={option.id}
                  checked={isSelected}
                  disabled={isSolved || isExhausted || isSubmitting}
                  onChange={() => setSelectedOptionId(option.id)}
                  className="sr-only"
                />
                <span
                  className={`w-7 h-7 flex items-center justify-center font-mono text-xs font-bold border-2 transition-colors ${
                    isSelected
                      ? "border-[#A92A28] bg-[#641B1B] text-[#E7DDC8]"
                      : "border-[#1C1510]/40 bg-[#FFFFFF] text-[#1C1510]"
                  }`}
                >
                  {letter}
                </span>
                <span className="font-serif text-sm sm:text-base leading-snug flex-1 font-medium">
                  {option.optionText}
                </span>
              </label>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#1C1510]/15">
          <span className="font-mono text-xs text-[#554436]">
            ATTEMPTS: {attemptsUsed} / {question.maxAttempts} ({attemptsRemaining} remaining)
          </span>

          <div className="flex gap-3">
            {hints.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="border border-[#1C1510]/40 bg-[#E8DCBF]/60 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#1C1510] hover:bg-[#E8DCBF] transition-colors cursor-pointer"
              >
                {showHints ? "Fold Leads" : `Consult Leads (${hints.length})`}
              </button>
            )}

            {!isSolved && !isExhausted && (
              <button
                type="submit"
                disabled={!selectedOptionId || isSubmitting}
                className="border-2 border-[#A92A28] bg-[#641B1B] text-[#E7DDC8] px-5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#A92A28] disabled:opacity-40 transition-colors shadow-sm cursor-pointer"
              >
                {isSubmitting ? "Verifying..." : "Verify Deduction"}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Consulted Hints Drawer */}
      {showHints && (
        <div className="mt-5 border-t-2 border-dashed border-[#1C1510]/20 pt-4 space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#641B1B] font-bold block">
            ARCHIVAL HINTS & WITNESS DISCLOSURES:
          </span>
          {hints.map((hint) => (
            <div
              key={hint.id}
              className="border border-[#1C1510]/20 bg-[#DFD3BA]/50 p-3 font-serif text-sm text-[#1C1510]"
            >
              {hint.isUnlocked ? (
                <div className="flex items-start gap-2">
                  <span className="font-mono text-xs text-[#641B1B] font-bold">
                    [LEAD #{hint.hintOrder}]:
                  </span>
                  <p className="italic leading-relaxed">{hint.hintText}</p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#554436]">
                    Sealed lead #{hint.hintOrder} ({hint.costPoints} PTS penalty)
                  </span>
                  <button
                    type="button"
                    disabled={isSubmitting || isSolved}
                    onClick={() => onRequestHint(hint.id)}
                    className="border border-[#641B1B] bg-[#641B1B]/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#641B1B] hover:bg-[#641B1B] hover:text-[#E7DDC8] transition-colors cursor-pointer"
                  >
                    Unseal Lead (-{hint.costPoints} PTS)
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
