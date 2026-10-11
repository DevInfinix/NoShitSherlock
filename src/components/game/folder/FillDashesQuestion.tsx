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
    <div className="relative border-2 border-[#1C1510]/30 bg-[#F4EDE0] p-6 shadow-md text-[#1C1510] [background-image:linear-gradient(to_bottom,transparent_27px,#E4D6BE_28px)] [background-size:100%_28px]">
      {/* Top Ledger Header */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#1C1510]/20 pb-3 mb-4 gap-2">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#641B1B] font-bold block">
            ITEM 0{question.sortOrder} {"//"} FORENSIC ACCOUNTING LEDGER
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

      {/* Interactive Letter Dash Boxes */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-wrap gap-2 sm:gap-2.5 justify-center py-3" onPaste={handlePaste}>
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
                className="w-10 h-12 sm:w-11 sm:h-14 text-center font-mono text-xl sm:text-2xl font-black uppercase bg-[#FFFFFF] border-2 border-[#1C1510]/60 text-[#1C1510] shadow-inner focus:border-[#A92A28] focus:bg-[#FFFDF7] focus:outline-hidden disabled:opacity-60 disabled:bg-[#EAE1D1] transition-all"
                aria-label={`Letter ${index + 1} of deduction`}
              />
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#1C1510]/15">
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
                disabled={isSubmitting || letters.every((l) => !l)}
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
