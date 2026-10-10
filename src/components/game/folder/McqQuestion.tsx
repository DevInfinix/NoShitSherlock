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
    <div className="border border-brass/40 bg-ink-raised/60 p-6 rounded-none shadow-md backdrop-blur-xs">
      <div className="flex items-center justify-between border-b border-brass/20 pb-3 mb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-brass">
          Question {question.sortOrder} — Multiple Choice Deduction
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-paper-muted">{question.points} PTS</span>
          {isSolved && (
            <span className="border border-evidence-red bg-evidence-red/20 px-2 py-0.5 font-mono text-xs text-evidence-red uppercase tracking-wider">
              [SOLVED]
            </span>
          )}
          {isExhausted && (
            <span className="border border-smoke bg-smoke/20 px-2 py-0.5 font-mono text-xs text-smoke uppercase tracking-wider">
              [EXHAUSTED]
            </span>
          )}
        </div>
      </div>

      <p className="font-serif text-lg leading-relaxed text-paper mb-6">{question.prompt}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          {question.options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selectedOptionId === option.id;
            return (
              <label
                key={option.id}
                className={`flex items-center gap-4 p-3 border cursor-pointer transition-colors ${
                  isSelected
                    ? "border-evidence-red bg-oxblood/30 text-paper"
                    : "border-brass/20 bg-ink/40 text-paper-muted hover:border-brass/40 hover:text-paper"
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
                <span className="w-7 h-7 flex items-center justify-center font-mono text-xs border border-brass/60 bg-ink text-brass">
                  {letter}
                </span>
                <span className="font-sans text-sm flex-1">{option.optionText}</span>
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-brass/20">
          <span className="font-mono text-xs text-smoke">
            Attempts: {attemptsUsed} / {question.maxAttempts} ({attemptsRemaining} left)
          </span>

          <div className="flex gap-3">
            {hints.length > 0 && (
              <button
                type="button"
                onClick={() => setShowHints(!showHints)}
                className="border border-brass/40 px-3 py-1.5 font-mono text-xs text-brass hover:border-brass hover:text-paper transition-colors cursor-pointer"
              >
                {showHints ? "Hide Hints" : `Hints (${hints.length})`}
              </button>
            )}

            <button
              type="submit"
              disabled={!selectedOptionId || isSolved || isExhausted || isSubmitting}
              className="bg-oxblood hover:bg-evidence-red text-paper px-4 py-1.5 font-mono text-xs uppercase tracking-wider border border-evidence-red/60 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {isSubmitting ? "Verifying..." : "Confirm Deduction"}
            </button>
          </div>
        </div>
      </form>

      {showHints && hints.length > 0 && (
        <div className="mt-4 pt-4 border-t border-brass/20 space-y-3">
          <span className="font-mono text-xs text-brass uppercase tracking-widest block">
            Investigation Wiretaps & Informant Hints
          </span>
          {hints.map((hint) => (
            <div
              key={hint.id}
              className="p-3 bg-ink/80 border border-brass/20 flex items-center justify-between gap-4"
            >
              <div className="text-sm font-mono text-paper-muted">
                {hint.isUnlocked ? (
                  <span className="text-paper">{hint.hintText}</span>
                ) : (
                  <span className="italic text-smoke">
                    Locked Lead — Cost: {hint.costPoints} PTS
                  </span>
                )}
              </div>
              {!hint.isUnlocked && !isSolved && (
                <button
                  type="button"
                  onClick={() => onRequestHint(hint.id)}
                  disabled={isSubmitting}
                  className="shrink-0 border border-brass/40 px-2 py-1 font-mono text-xs text-brass hover:bg-brass/20 transition-colors cursor-pointer"
                >
                  Unlock Hint
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
