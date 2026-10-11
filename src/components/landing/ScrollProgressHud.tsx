"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { soundEngine } from "@/lib/audio/sound-engine";

interface Sector {
  id: string;
  num: string;
  label: string;
  targetPercent: number;
}

const SECTORS: Sector[] = [
  { id: "sector-1", num: "01", label: "COLD OPEN", targetPercent: 0 },
  { id: "sector-2", num: "02", label: "DOSSIER VAULT", targetPercent: 40 },
  { id: "sector-3", num: "03", label: "ENLISTMENT", targetPercent: 85 },
];

export function ScrollProgressHud() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const p = Math.min(100, Math.max(0, (scrollY / maxScroll) * 100));
      setProgress(Math.round(p));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSector = (targetPercent: number) => {
    soundEngine.playPaper();
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = (targetPercent / 100) * maxScroll;
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  const currentSectorIndex = progress < 33 ? 0 : progress < 68 ? 1 : 2;

  return (
    <aside
      aria-label="Investigation progress track"
      className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-start gap-4 lg:flex"
    >
      {/* Top Header Label */}
      <div className="flex items-center gap-2 border-l border-[var(--color-brass)]/40 pl-2.5">
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--color-paper-muted)]">
          CLEARANCE TRACK
        </span>
        <span className="font-mono text-xs font-bold text-[var(--color-brass)]">
          {String(progress).padStart(2, "0")}%
        </span>
      </div>

      {/* Vertical Track Line */}
      <div className="relative my-1 ml-2.5 h-36 w-[1px] bg-[var(--color-ink-raised)]">
        <motion.div
          className="absolute top-0 left-0 w-[1px] bg-gradient-to-b from-[var(--color-brass)] to-[var(--color-evidence-red)]"
          style={{ height: `${progress}%` }}
        />
      </div>

      {/* Sectors list */}
      <div className="flex flex-col gap-3 pl-2.5">
        {SECTORS.map((sector, index) => {
          const isActive = index === currentSectorIndex;
          const isPassed = index < currentSectorIndex;

          return (
            <button
              key={sector.id}
              type="button"
              onClick={() => scrollToSector(sector.targetPercent)}
              className="group flex items-center gap-2 text-left transition-all duration-300"
            >
              <span
                className={`font-mono text-[10px] transition-colors ${
                  isActive
                    ? "font-bold text-[var(--color-evidence-red)]"
                    : isPassed
                      ? "text-[var(--color-brass)]"
                      : "text-[var(--color-smoke)] group-hover:text-[var(--color-paper-muted)]"
                }`}
              >
                {sector.num}
              </span>
              <span
                className={`font-serif text-xs tracking-wider uppercase transition-colors ${
                  isActive
                    ? "text-[var(--color-paper)] font-semibold"
                    : "text-[var(--color-smoke)] group-hover:text-[var(--color-paper-muted)]"
                }`}
              >
                {sector.label}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
