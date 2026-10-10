"use client";

import { useEffect } from "react";
import type { UnlockedClue } from "@/server/services/game-session-service";

interface ClueInspectionModalProps {
  clue: UnlockedClue | null;
  onClose: () => void;
}

export function ClueInspectionModal({ clue, onClose }: ClueInspectionModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (clue) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clue, onClose]);

  if (!clue) return null;

  const metadata = clue.metadata as {
    tag?: string;
    location?: string;
    timestamp?: string;
    imageUrl?: string;
    sourceQuote?: string;
  } | null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="clue-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-xs"
    >
      <div className="w-full max-w-xl border-2 border-brass/60 bg-ink-raised p-6 md:p-8 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brass/30 pb-4 mb-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-brass block">
              EVIDENCE DOSSIER {"//"} {clue.clueKey.toUpperCase()}
            </span>
            <h2 id="clue-modal-title" className="font-serif text-2xl text-paper font-bold mt-1">
              {clue.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-brass/40 px-3 py-1 font-mono text-xs text-brass hover:bg-brass/20 transition-colors cursor-pointer"
            aria-label="Close evidence modal"
          >
            [CLOSE]
          </button>
        </div>

        {/* Clue Details */}
        <div className="space-y-4">
          {metadata?.imageUrl && (
            <div className="border border-brass/30 bg-ink overflow-hidden max-h-64 flex items-center justify-center">
              <img
                src={metadata.imageUrl}
                alt={clue.title}
                className="w-full h-auto object-cover opacity-90"
              />
            </div>
          )}

          <div className="p-4 bg-ink/60 border-l-2 border-evidence-red font-mono text-xs text-paper-muted space-y-1">
            {metadata?.location && (
              <div>
                <span className="text-smoke">LOCATION RECOVERED: </span>
                <span className="text-paper">{metadata.location}</span>
              </div>
            )}
            {metadata?.timestamp && (
              <div>
                <span className="text-smoke">RECORDED TIME: </span>
                <span className="text-paper">{metadata.timestamp}</span>
              </div>
            )}
            {metadata?.tag && (
              <div>
                <span className="text-smoke">CATEGORY: </span>
                <span className="text-brass uppercase">{metadata.tag}</span>
              </div>
            )}
          </div>

          <p className="font-serif text-paper text-base leading-relaxed">{clue.clueText}</p>

          {metadata?.sourceQuote && (
            <blockquote className="p-3 bg-oxblood/20 border border-evidence-red/40 italic font-serif text-sm text-paper-muted">
              "{metadata.sourceQuote}"
            </blockquote>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-brass/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="border border-brass/40 px-4 py-1.5 font-mono text-xs text-brass hover:border-brass hover:text-paper transition-colors cursor-pointer"
          >
            Return to Field Notebook
          </button>
        </div>
      </div>
    </div>
  );
}
