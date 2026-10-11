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

export function TrueFalseQuestion({
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

  const [selectedVal, setSelectedVal] = useState<"true" | "false" | null>(null);
  const [showHints, setShowHints] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVal || isSubmitting || isSolved || isExhausted) return;
    await onSubmit(selectedVal);
  };

  return (
    <div className="relative border-2 border-[#1C1510]/30 bg-[#F4EDE0] p-6 shadow-md text-[#1C1510]">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#1C1510]/20 pb-3 mb-4 gap-2">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#641B1B] font-bold block">
            ITEM 0{question.sortOrder} {"//"} SWORN TESTIMONY VERIFICATION
          </span>
          <span className="font-mono text-xs text-[#554436]">AFFIDAVIT CLAUSE #{question.id}</span>
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

      {/* Testimony Statement */}
      <div className="border-l-4 border-[#A9874A] bg-[#EAE0CD]/60 p-4 mb-6">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#554436] font-bold block mb-1">
          RECORDED STATEMENT:
        </span>
        <p className="font-serif text-base sm:text-lg leading-relaxed text-[#1C1510] italic">
          "{question.prompt}"
        </p>
      </div>

      {/* Affidavit Stamp Toggles */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            disabled={isSolved || isExhausted || isSubmitting}
            onClick={() => setSelectedVal("true")}
            className={`p-4 border-2 font-mono text-sm tracking-wider uppercase flex items-center justify-center gap-3 transition-all cursor-pointer ${
              selectedVal === "true"
                ? "border-[#A92A28] bg-[#641B1B] text-[#E7DDC8] shadow-md font-bold"
                : "border-[#1C1510]/30 bg-[#FBF7EE] text-[#1C1510] hover:border-[#1C1510]/60 hover:bg-[#E8DCBF]"
            } disabled:opacity-50`}
          >
            <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">
              {selectedVal === "true" ? "✓" : ""}
            </span>
            <span>AFFIRMED / TRUE</span>
          </button>

          <button
            type="button"
            disabled={isSolved || isExhausted || isSubmitting}
            onClick={() => setSelectedVal("false")}
            className={`p-4 border-2 font-mono text-sm tracking-wider uppercase flex items-center justify-center gap-3 transition-all cursor-pointer ${
              selectedVal === "false"
                ? "border-[#A92A28] bg-[#641B1B] text-[#E7DDC8] shadow-md font-bold"
                : "border-[#1C1510]/30 bg-[#FBF7EE] text-[#1C1510] hover:border-[#1C1510]/60 hover:bg-[#E8DCBF]"
            } disabled:opacity-50`}
          >
            <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">
              {selectedVal === "false" ? "✗" : ""}
            </span>
            <span>REFUTED / FALSE</span>
          </button>
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
                disabled={!selectedVal || isSubmitting}
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
