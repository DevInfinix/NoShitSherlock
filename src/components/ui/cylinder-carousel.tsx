"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { soundEngine } from "@/lib/audio/sound-engine";

export interface EvidenceExhibit {
  id: string;
  tag: string;
  title: string;
  type: string;
  notes: string;
}

interface CylinderCarouselProps {
  exhibits: EvidenceExhibit[];
  className?: string;
}

export function CylinderCarousel({ exhibits, className = "" }: CylinderCarouselProps) {
  const [rotationIndex, setRotationIndex] = useState(0);

  const rotate = (direction: "prev" | "next") => {
    soundEngine.playPaper();
    if (direction === "next") {
      setRotationIndex((prev) => prev + 1);
    } else {
      setRotationIndex((prev) => prev - 1);
    }
  };

  const total = exhibits.length;
  const anglePerItem = 360 / total;

  return (
    <div className={`relative flex flex-col items-center overflow-hidden py-10 ${className}`}>
      <div className="mb-6 flex items-center justify-between w-full max-w-4xl px-4">
        <div>
          <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--color-evidence-red)]">
            EVIDENCE REPOSITORY
          </span>
          <h3 className="font-serif text-2xl font-bold text-[var(--color-paper)]">
            Deduction Artifact Carousel
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => rotate("prev")}
            aria-label="Previous exhibit"
            className="border border-[var(--color-brass)]/40 px-3 py-1 font-mono text-xs text-[var(--color-paper)] hover:border-[var(--color-brass)] hover:bg-[var(--color-brass)]/10"
          >
            &larr; PREV
          </button>
          <button
            type="button"
            onClick={() => rotate("next")}
            aria-label="Next exhibit"
            className="border border-[var(--color-brass)]/40 px-3 py-1 font-mono text-xs text-[var(--color-paper)] hover:border-[var(--color-brass)] hover:bg-[var(--color-brass)]/10"
          >
            NEXT &rarr;
          </button>
        </div>
      </div>

      {/* 3D Scene Container */}
      <div className="relative h-[280px] w-full max-w-3xl [perspective:1200px] flex items-center justify-center">
        <motion.div
          animate={{ rotateY: -rotationIndex * anglePerItem }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
          className="relative h-[220px] w-[260px] [transform-style:preserve-3d]"
        >
          {exhibits.map((item, idx) => {
            const itemAngle = idx * anglePerItem;
            return (
              <div
                key={item.id}
                className="absolute inset-0 border border-[var(--color-brass)]/40 bg-[var(--color-ink-raised)]/95 p-5 shadow-2xl backdrop-blur-md"
                style={{
                  transform: `rotateY(${itemAngle}deg) translateZ(320px)`,
                  backfaceVisibility: "hidden",
                }}
              >
                <div className="flex items-center justify-between border-b border-[var(--color-brass)]/20 pb-2">
                  <span className="font-mono text-[9px] uppercase text-[var(--color-evidence-red)]">
                    {item.tag}
                  </span>
                  <span className="font-mono text-[9px] text-[var(--color-paper-muted)]">
                    {item.type}
                  </span>
                </div>
                <h4 className="mt-3 font-serif text-base font-bold text-[var(--color-paper)]">
                  {item.title}
                </h4>
                <p className="mt-2 font-serif text-xs leading-relaxed text-[var(--color-paper-muted)] line-clamp-3">
                  {item.notes}
                </p>
                <div className="mt-4 pt-2 border-t border-[var(--color-brass)]/10 font-mono text-[9px] text-[var(--color-smoke)]">
                  EXHIBIT INDEX {"//"} #{idx + 1}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
