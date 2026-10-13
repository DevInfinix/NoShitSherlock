"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { soundEngine } from "@/lib/audio/sound-engine";
import type { ActiveCaseListing } from "@/server/services/game-session-service";

interface ForensicCaseInciseOverlayProps {
  activeCase: ActiveCaseListing | null;
  onClose: () => void;
}

export function ForensicCaseInciseOverlay({ activeCase, onClose }: ForensicCaseInciseOverlayProps) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!activeCase) return null;

  const previewImage =
    activeCase.slug === "case-01-missing-ledger"
      ? "/cases/case-01-missing-ledger/images/case1_image1.webp"
      : `/cases/${activeCase.slug}/images/image_1.webp`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto relative w-full max-w-4xl border-2 border-[#D4C3A3] bg-[#E7DDC8] p-6 sm:p-8 shadow-2xl shadow-black/90 text-[#1C1510] rounded-sm"
      >
        {/* Subtle vintage paper texture overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#C4B290_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

        {/* Top Bureau Dossier Header */}
        <div className="relative flex flex-wrap items-start justify-between gap-4 border-b-2 border-[#1C1510]/20 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="border-2 border-[#A7192D] px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-widest text-[#A7192D]">
                INCIDENT DOSSIER {"//"} FILE #{activeCase.id.toString().padStart(3, "0")}
              </span>
              <span className="font-mono text-xs text-[#641B1B]">
                LEVEL: {"★".repeat(activeCase.difficulty)}
                {"☆".repeat(5 - activeCase.difficulty)} ({activeCase.difficulty}/5)
              </span>
            </div>
            <h2 className="mt-2 font-serif text-2xl sm:text-4xl font-bold tracking-tight text-[#1C1510]">
              {activeCase.title}
            </h2>
          </div>

          {/* Dismiss / Close button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playPaper();
              onClose();
            }}
            className="border border-[#1C1510]/40 bg-[#DFD3BA]/60 px-3 py-1 font-mono text-xs uppercase tracking-wider text-[#1C1510] hover:bg-[#1C1510] hover:text-[#E7DDC8] transition-colors cursor-pointer"
          >
            &times; Close Focus
          </button>
        </div>

        {/* Middle Content Grid: Crime Scene Photo Preview + Case Debriefing */}
        <div className="relative mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Polaroid Crime Scene Exhibit Photo */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full aspect-4/3 border-4 border-white bg-[#100D0D] p-1.5 shadow-xl rotate-[-1.5deg]">
              {/* Actual Case Image with Procedural Fallback */}
              <div className="relative w-full h-full overflow-hidden bg-[#15110F]">
                {!imgFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewImage}
                    alt={activeCase.title}
                    onError={() => setImgFailed(true)}
                    className="w-full h-full object-cover filter contrast-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#15110F] p-4 text-center border border-[#79604A]/30">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-[#A7192D] font-bold">
                      [CLASSIFIED EVIDENCE]
                    </span>
                    <span className="font-serif text-xs text-[#E8DCC8] mt-1 font-semibold">
                      {activeCase.title}
                    </span>
                    <span className="font-mono text-[9px] text-[#79604A] mt-2 uppercase">
                      CRIME SCENE RECONSTRUCTION STILL
                    </span>
                  </div>
                )}
              </div>

              {/* Red Evidence Tape Label */}
              <div className="absolute -top-3 -right-3 bg-[#A7192D] text-[#E7DDC8] px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-widest font-bold shadow-md rotate-3">
                EXHIBIT A
              </div>
            </div>
            <span className="mt-2 font-mono text-[10px] text-[#554335] uppercase tracking-wider">
              CRIME SCENE RECONSTRUCTION STILL
            </span>
          </div>

          {/* Case Narrative Synopsis & Metric Overview */}
          <div className="md:col-span-7 space-y-4">
            <div className="border-l-4 border-[#641B1B] bg-[#DFD3BA]/50 p-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#641B1B] font-bold block mb-1">
                DISPATCH SUMMARY & DETECTIVE BRIEF:
              </span>
              <p className="font-serif text-sm sm:text-base leading-relaxed text-[#2C2119]">
                {activeCase.description}
              </p>
            </div>

            {/* Score & Session Status Indicators */}
            <div className="grid grid-cols-2 gap-3 font-mono text-xs border border-[#1C1510]/15 bg-[#F2EADB]/80 p-3">
              <div>
                <span className="text-[#78716A] text-[10px] uppercase block">Max Reward</span>
                <span className="font-bold text-[#1C1510] text-sm">{activeCase.maxScore} PTS</span>
              </div>
              <div>
                <span className="text-[#78716A] text-[10px] uppercase block">
                  Investigation Status
                </span>
                {activeCase.activeSessionStatus === "COMPLETED" ? (
                  <span className="font-bold text-[#A7192D] text-sm">[SOLVED]</span>
                ) : activeCase.activeSessionStatus === "IN_PROGRESS" ? (
                  <span className="font-bold text-[#A9874A] text-sm">
                    IN PROGRESS ({activeCase.activeSessionScore ?? 0} PTS)
                  </span>
                ) : (
                  <span className="font-bold text-[#554335] text-sm">[UNSOLVED COLD FILE]</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="relative mt-8 pt-5 border-t-2 border-[#1C1510]/20 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/pinboard/${activeCase.slug}`}
            onClick={() => soundEngine.playPaper()}
            className="border border-[#1C1510]/50 bg-[#DFD3BA]/40 px-4 py-2 font-mono text-xs uppercase tracking-wider text-[#1C1510] hover:bg-[#1C1510] hover:text-[#E7DDC8] transition-colors"
          >
            Evidence Pinboard &rarr;
          </Link>

          <Link
            href={`/cases/${activeCase.slug}`}
            onClick={() => soundEngine.playStamp()}
            className="border-2 border-[#A7192D] bg-[#641B1B] hover:bg-[#A7192D] text-[#E7DDC8] px-6 py-2.5 font-mono text-xs uppercase tracking-widest font-bold shadow-lg transition-all"
          >
            {activeCase.activeSessionStatus === "IN_PROGRESS"
              ? "Continue Investigation →"
              : "Open Case File →"}
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
