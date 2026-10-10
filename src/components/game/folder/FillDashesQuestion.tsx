"use client";

import { useId, useRef, useState } from "react";
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

export function FillDashesQuestion({
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

  // Derive dash length from placeholderText or default to 8
  const defaultLen = question.placeholderText
    ? question.placeholderText.replace(/\s+/g, "").length
    : 8;
  const dashCount = Math.max(3, Math.min(24, defaultLen));

  const [letters, setLetters] = useState<string[]>(Array(dashCount).fill(""));
  const [showHints, setShowHints] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const formId = useId();

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!letters[index] && index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < dashCount - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleChange = (index: number, value: string) => {
    const char = value.slice(-1).toUpperCase();
    const updated = [...letters];
    updated[index] = char;
    setLetters(updated);

    if (char && index < dashCount - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().toUpperCase();
    const chars = pasted.split("").slice(0, dashCount);
    const updated = [...letters];
    chars.forEach((c, i) => {
      updated[i] = c;
    });
    setLetters(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSolved || isExhausted) return;
    const answer = letters.join("").trim();
    if (!answer) return;
    await onSubmit(answer);
  };

  return (
    <div className="border border-brass/40 bg-ink-raised/60 p-6 rounded-none shadow-md backdrop-blur-xs">
      <div className="flex items-center justify-between border-b border-brass/20 pb-3 mb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-brass">
          Question {question.sortOrder} — Fill in the Blanks
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-wrap gap-2 justify-center py-2" onPaste={handlePaste}>
          {letters.map((char, index) => {
            const inputKey = `${formId}-dash-${index}`;
            return (
              <input
                key={inputKey}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={char}
                disabled={isSolved || isExhausted || isSubmitting}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-12 text-center font-mono text-xl uppercase bg-ink border-b-2 border-brass/60 text-paper focus:border-evidence-red focus:outline-hidden disabled:opacity-50 transition-colors"
                aria-label={`Letter ${index + 1} of deduction`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
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
              disabled={isSolved || isExhausted || isSubmitting}
              className="bg-oxblood hover:bg-evidence-red text-paper px-4 py-1.5 font-mono text-xs uppercase tracking-wider border border-evidence-red/60 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {isSubmitting ? "Verifying..." : "File Deduction"}
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
