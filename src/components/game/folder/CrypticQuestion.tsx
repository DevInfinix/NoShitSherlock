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
    <div className="relative border-2 border-[#1C1510]/30 bg-[#F4EDE0] p-6 shadow-md text-[#1C1510]">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#1C1510]/20 pb-3 mb-4 gap-2">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#641B1B] font-bold block">
            ITEM 0{question.sortOrder} {"//"} INTERCEPTED ENCRYPTED CABLE
          </span>
          <span className="font-mono text-xs text-[#554436]">CIPHER TELEGRAM #{question.id}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="border border-[#1C1510]/30 bg-[#E8DCBF] px-2 py-0.5 font-mono text-[11px] font-bold text-[#1C1510]">
            {question.points} PTS
          </span>
          {isSolved && (
            <span className="border-2 border-[#A92A28] bg-[#A92A28]/15 px-2.5 py-0.5 font-mono text-xs font-black text-[#A92A28] uppercase tracking-wider rotate-[-2deg]">
              [CIPHER DECODED]
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
      <p className="font-serif text-base sm:text-lg leading-relaxed text-[#1C1510] mb-5 font-medium">
        {question.prompt}
      </p>

      {/* Cipher Tape Banner */}
      {cipherText && (
        <div className="mb-6 border-2 border-dashed border-[#641B1B]/40 bg-[#DFD3B9]/70 p-4 font-mono text-sm tracking-widest text-[#641B1B] select-all shadow-inner">
          <span className="text-[10px] uppercase tracking-widest block text-[#1C1510]/60 mb-1 font-bold">
            RAW CIPHERTEXT TRANSMISSION:
          </span>
          <div className="text-base sm:text-lg font-black tracking-widest break-all font-mono">
            {cipherText}
          </div>
        </div>
      )}

      {/* Interactive Cryptanalyst Scratchpad */}
      <div className="mb-5 space-y-2">
        <label
          htmlFor={`scratchpad-${question.id}`}
          className="font-mono text-[10px] uppercase tracking-widest text-[#554436] font-bold block"
        >
          FORENSIC DECRYPTION SCRATCHPAD (TRANSLATION MEMO):
        </label>
        <textarea
          id={`scratchpad-${question.id}`}
          rows={3}
          value={scratchpad}
          onChange={(e) => setScratchpad(e.target.value)}
          placeholder="Use this memo space to test cipher substitutions, shift keys, or frequency tallies..."
          className="w-full border border-[#1C1510]/30 bg-[#FFFFFF] p-3 font-mono text-xs text-[#1C1510] focus:border-[#A92A28] focus:outline-hidden resize-y shadow-inner"
        />
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor={`solution-${question.id}`}
            className="font-mono text-[10px] uppercase tracking-widest text-[#554436] font-bold block mb-1"
          >
            FINAL DECODED PLAINTEXT:
          </label>
          <input
            id={`solution-${question.id}`}
            type="text"
            value={answer}
            disabled={isSolved || isExhausted || isSubmitting}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your plaintext deduction here..."
            className="w-full border-2 border-[#1C1510]/50 bg-[#FFFFFF] p-3 font-mono text-base uppercase font-bold text-[#1C1510] focus:border-[#A92A28] focus:outline-hidden disabled:opacity-60 shadow-inner"
          />
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
                disabled={!answer.trim() || isSubmitting}
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
