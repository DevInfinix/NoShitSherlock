"use client";

import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { soundEngine } from "@/lib/audio/sound-engine";
import type { ActiveCaseListing } from "@/server/services/game-session-service";
import { ForensicCaseInciseOverlay } from "./ForensicCaseInciseOverlay";
import { PinboardLibrary3D } from "./PinboardLibrary3D";

interface PinboardLibraryContainerProps {
  cases: ActiveCaseListing[];
}

export function PinboardLibraryContainer({ cases }: PinboardLibraryContainerProps) {
  const [activeCase, setActiveCase] = useState<ActiveCaseListing | null>(null);

  const handleHoverCase = (item: ActiveCaseListing | null) => {
    if (item && item.slug !== activeCase?.slug) {
      soundEngine.playPaper();
    }
    setActiveCase(item);
  };

  const handleSelectCase = (item: ActiveCaseListing) => {
    soundEngine.playStamp();
    setActiveCase(item);
  };

  return (
    <div className="relative w-full min-h-[85vh] flex flex-col items-center justify-center overflow-hidden rounded-lg border-4 border-[#251810] shadow-[0_25px_60px_rgba(0,0,0,0.95)] bg-[#0C0907]">
      {/* 3D WebGL / R3F Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <PinboardLibrary3D
          cases={cases}
          activeCase={activeCase}
          onHoverCase={handleHoverCase}
          onSelectCase={handleSelectCase}
        />
      </div>

      {/* Atmospheric Vignette & Corner Shadows */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_50%,transparent_50%,rgba(10,8,6,0.8)_95%)]" />

      {/* Top HUD Bar with Quick Case Roster & Clearance Hints */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-8 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-3">
        <div className="border border-[#A9874A]/40 bg-[#15110F]/85 px-3 py-1.5 backdrop-blur-md">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#A9874A] block">
            CENTRAL ARCHIVE {"//"} SCOTLAND YARD HOMICIDE PINBOARD
          </span>
          <span className="font-serif text-xs text-[#E7DDC8]">
            Hover or tap any pinned case file to inspect crime scene evidence
          </span>
        </div>

        {/* Quick Case Switcher Badges */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {cases.map((c) => {
            const isSelected = activeCase?.slug === c.slug;
            return (
              <button
                type="button"
                key={c.slug}
                onClick={() => handleSelectCase(c)}
                className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected
                    ? "border-[#A7192D] bg-[#641B1B] text-[#E7DDC8] font-bold shadow-md"
                    : "border-[#A9874A]/30 bg-[#15110F]/80 text-[#B8AD98] hover:border-[#A9874A]"
                }`}
              >
                FILE #{c.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* Center Forensic Case Incise Overlay (Focus Mode) */}
      <div className="relative z-30 flex items-center justify-center p-4 w-full pointer-events-none">
        <AnimatePresence>
          {activeCase && (
            <ForensicCaseInciseOverlay
              activeCase={activeCase}
              onClose={() => setActiveCase(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Hint Indicator */}
      <div className="absolute bottom-3 z-20 pointer-events-none font-mono text-[10px] text-[#78716A] uppercase tracking-widest">
        [3D INTERACTIVE EVIDENCE WALL — PARALLAX & ROTATION SENSITIVE]
      </div>
    </div>
  );
}
