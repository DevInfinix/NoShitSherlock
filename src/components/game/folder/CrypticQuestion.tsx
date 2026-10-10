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

export function CrypticQuestion({
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

  const [scratchpad, setScratchpad] = useState("");
  const [answer, setAnswer] = useState("");
  const [showHints, setShowHints] = useState(false);

  // Extract cipher text or clue details from metadata if available
  const cipherText = (question.metadata as { cipherText?: string })?.cipherText ?? null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || isSubmitting || isSolved || isExhausted) return;
    await onSubmit(answer.trim());
  };

  return (
    <div className="border border-brass/40 bg-ink-raised/60 p-6 rounded-none shadow-md backdrop-blur-xs">
      <div className="flex items-center justify-between border-b border-brass/20 pb-3 mb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-brass">
          Question {question.sortOrder} — Cryptic Cipher & Anagram
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

      <p className="font-serif text-lg leading-relaxed text-paper mb-4">{question.prompt}</p>

      {cipherText && (
        <div className="mb-6 p-4 bg-ink border border-brass/30 font-mono text-sm tracking-widest text-brass/90 select-all overflow-x-auto">
          {cipherText}
        </div>
      )}

      {/* Interactive Detective Scratchpad */}
      <div className="mb-6">
        <label
          htmlFor={`scratchpad-${question.id}`}
          className="font-mono text-xs text-paper-muted uppercase tracking-wider block mb-1"
        >
          Detective Notes & Decoding Scratchpad (Local):
        </label>
        <textarea
          id={`scratchpad-${question.id}`}
          value={scratchpad}
          onChange={(e) => setScratchpad(e.target.value)}
          placeholder="Jot down character counts, shift offsets, and candidate anagrams..."
          rows={3}
          className="w-full bg-ink/70 border border-brass/30 p-2.5 font-mono text-xs text-paper placeholder-smoke focus:border-brass focus:outline-hidden transition-colors"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor={`solution-${question.id}`}
            className="font-mono text-xs text-paper-muted uppercase tracking-wider block mb-1"
          >
            Decoded Solution:
          </label>
          <input
            id={`solution-${question.id}`}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isSolved || isExhausted || isSubmitting}
            placeholder={question.placeholderText ?? "Enter decoded cipher text..."}
            className="w-full bg-ink border border-brass/50 p-2.5 font-mono text-sm uppercase text-paper placeholder-smoke focus:border-evidence-red focus:outline-hidden disabled:opacity-50 transition-colors"
          />
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
              disabled={!answer.trim() || isSolved || isExhausted || isSubmitting}
              className="bg-oxblood hover:bg-evidence-red text-paper px-4 py-1.5 font-mono text-xs uppercase tracking-wider border border-evidence-red/60 disabled:opacity-40 transition-colors cursor-pointer"
            >
              {isSubmitting ? "Verifying..." : "Break Cipher"}
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
