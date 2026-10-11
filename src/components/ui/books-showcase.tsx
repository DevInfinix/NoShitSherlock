"use client";

import { AnimatePresence, motion } from "motion/react";
import { type MouseEvent, useState } from "react";
import { soundEngine } from "@/lib/audio/sound-engine";

export interface CaseFileCfg {
  id: string;
  code: string;
  title: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "LETHAL";
  year: string;
  summary: string;
  classification: string;
  sectionsCount: number;
  cluesCount: number;
}

export type CaseDossierCfg = CaseFileCfg;

interface BooksShowcaseProps {
  cases: CaseFileCfg[];
  heroTitle?: string;
  className?: string;
  onSelectCase?: (c: CaseFileCfg) => void;
}

export function BooksShowcase({
  cases,
  heroTitle = "ACTIVE CASE FILES",
  className = "",
  onSelectCase,
}: BooksShowcaseProps) {
  const [selectedCase, setSelectedCase] = useState<CaseFileCfg | null>(cases[0] || null);

  const handleSelect = (c: CaseFileCfg) => {
    soundEngine.playPaper();
    setSelectedCase(c);
    onSelectCase?.(c);
  };

  return (
    <div className={`relative flex w-full flex-col items-center py-12 ${className}`}>
      {/* Background Section Title Stamp */}
      <div className="pointer-events-none absolute -top-8 select-none font-serif text-6xl tracking-widest text-[var(--color-ink-raised)] opacity-40 md:text-8xl">
        {heroTitle}
      </div>

      {/* 3D Case File Books Grid */}
      <div className="grid w-full max-w-6xl grid-cols-1 gap-8 px-6 md:grid-cols-3">
        {cases.map((caseItem) => {
          const isSelected = selectedCase?.id === caseItem.id;

          return (
            <CaseBookCard
              key={caseItem.id}
              caseFile={caseItem}
              isSelected={isSelected}
              onSelect={() => handleSelect(caseItem)}
            />
          );
        })}
      </div>

      {/* Selected Case Detail Sheet */}
      <AnimatePresence mode="wait">
        {selectedCase && (
          <motion.div
            key={selectedCase.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mt-12 w-full max-w-3xl border border-[var(--color-brass)]/40 bg-[var(--color-ink-raised)] p-6 shadow-2xl md:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-brass)]/20 pb-4">
              <div>
                <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--color-evidence-red)]">
                  CLASSIFIED {"//"} {selectedCase.code}
                </span>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-[var(--color-paper)]">
                  {selectedCase.title}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="border border-[var(--color-brass)]/40 px-2 py-0.5 font-mono text-[11px] text-[var(--color-brass)]">
                  LEVEL: {selectedCase.difficulty}
                </span>
                <span className="border border-[var(--color-smoke)]/40 px-2 py-0.5 font-mono text-[11px] text-[var(--color-paper-muted)]">
                  {selectedCase.year}
                </span>
              </div>
            </div>

            <p className="mt-4 font-serif text-sm leading-relaxed text-[var(--color-paper-muted)]">
              {selectedCase.summary}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-brass)]/20 pt-4">
              <div className="flex gap-4 font-mono text-xs text-[var(--color-paper-muted)]">
                <span>SECTIONS: {selectedCase.sectionsCount}</span>
                <span>•</span>
                <span>CLUES: {selectedCase.cluesCount}</span>
                <span>•</span>
                <span className="text-[var(--color-brass)]">{selectedCase.classification}</span>
              </div>

              <a
                href="/cases"
                onClick={() => soundEngine.playStamp()}
                className="inline-flex items-center gap-2 border border-[var(--color-evidence-red)] bg-[var(--color-evidence-red)]/10 px-4 py-1.5 font-mono text-xs tracking-wider uppercase text-[var(--color-paper)] transition-all duration-300 hover:bg-[var(--color-evidence-red)] hover:text-[var(--color-paper)]"
              >
                OPEN CASE FILE &rarr;
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CaseBookCard({
  caseFile,
  isSelected,
  onSelect,
}: {
  caseFile: CaseFileCfg;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 18, y: -y * 18 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <button
      type="button"
      className="perspective-1000 group w-full text-left cursor-pointer outline-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect}
    >
      <motion.div
        animate={{
          rotateY: isSelected ? 0 : tilt.x,
          rotateX: isSelected ? 0 : tilt.y,
          scale: isSelected ? 1.04 : 1,
          borderColor: isSelected ? "var(--color-evidence-red)" : "var(--color-brass)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`relative flex min-h-[380px] flex-col justify-between overflow-hidden border p-6 transition-shadow duration-300 ${
          isSelected
            ? "border-[var(--color-evidence-red)] bg-[var(--color-ink-raised)] shadow-[0_12px_40px_rgba(169,42,40,0.25)]"
            : "border-[var(--color-brass)]/40 bg-[var(--color-ink-raised)]/90 hover:border-[var(--color-brass)] hover:shadow-xl"
        }`}
      >
        {/* Faux Manila Spine strip */}
        <div className="absolute top-0 bottom-0 left-0 w-3 border-r border-[var(--color-brass)]/30 bg-gradient-to-r from-[#201A16] to-[#2B231D]" />

        {/* Top Case Label */}
        <div className="pl-3">
          <div className="flex items-center justify-between font-mono text-[10px] text-[var(--color-paper-muted)]">
            <span>{caseFile.code}</span>
            <span className="text-[var(--color-brass)]">{caseFile.year}</span>
          </div>
          <h4 className="mt-3 font-serif text-xl font-bold tracking-tight text-[var(--color-paper)]">
            {caseFile.title}
          </h4>
        </div>

        {/* Center Evidence Seal / Watermark */}
        <div className="my-6 flex items-center justify-center pl-3">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[var(--color-brass)]/30">
            <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-brass)]/60 text-center px-1">
              {caseFile.difficulty}
            </span>
            <div className="absolute inset-2 rounded-full border border-dashed border-[var(--color-evidence-red)]/40" />
          </div>
        </div>

        {/* Bottom classification footer */}
        <div className="border-t border-[var(--color-brass)]/20 pt-3 pl-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-paper-muted)]">
            <span>STATUS: ACTIVE</span>
            <span
              className={
                isSelected ? "text-[var(--color-evidence-red)]" : "text-[var(--color-smoke)]"
              }
            >
              {isSelected ? "INSPECTING" : "CLICK TO VIEW"}
            </span>
          </div>
        </div>
      </motion.div>
    </button>
  );
}
