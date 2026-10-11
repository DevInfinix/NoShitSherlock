"use client";

import { motion } from "motion/react";

interface VerticalInvestigateTimelineProps {
  activeTab: 0 | 1 | 2;
  onSelectTab: (tab: 0 | 1 | 2) => void;
  scrollProgress: number; // 0 to 1
  className?: string;
}

export function VerticalInvestigateTimeline({
  activeTab,
  onSelectTab,
  scrollProgress,
  className = "",
}: VerticalInvestigateTimelineProps) {
  const stages = [
    { id: 0 as const, num: "01", label: "ABOUT", desc: "The Game" },
    { id: 1 as const, num: "02", label: "CASES", desc: "Free & Ranks" },
    { id: 2 as const, num: "03", label: "SOURCE", desc: "GitHub" },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col items-center justify-between py-2 select-none pointer-events-auto ${className}`}
      aria-label="Investigation Phase Timeline"
    >
      {/* Top Evidence Marker */}
      <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#79604A] mb-2">
        TIMELINE
      </span>

      {/* Vertical Rail with Dynamic Red Thread */}
      <div className="relative flex-1 flex flex-col justify-between items-center w-8">
        {/* Background Track Line with Tick Marks */}
        <div className="absolute top-2 bottom-2 w-[1px] bg-[#79604A]/30 flex flex-col justify-between items-center py-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={`tick-${i}`}
              className={`w-1.5 h-[1px] ${i % 4 === 0 ? "w-2.5 bg-[#79604A]/60" : "bg-[#79604A]/25"}`}
            />
          ))}
        </div>

        {/* Dynamic Scrub Thread (Fills down with scroll progress) */}
        <div
          className="absolute top-2 w-[2px] bg-gradient-to-b from-[#A7192D] to-[#E8DCC8] origin-top transition-all duration-100 ease-out"
          style={{
            height: `calc(${Math.min(100, Math.max(0, scrollProgress * 100))}% - 16px)`,
          }}
        />

        {/* Stage Nodes */}
        {stages.map((stage) => {
          const isActive = activeTab === stage.id;
          return (
            <button
              type="button"
              key={stage.id}
              onClick={() => onSelectTab(stage.id)}
              className="group relative z-10 flex items-center gap-3 py-3 cursor-pointer outline-none transition-transform active:scale-95"
            >
              {/* Node Indicator */}
              <div
                className={`relative flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-300 ${
                  isActive
                    ? "border-[#A7192D] bg-[#260D10] shadow-[0_0_12px_rgba(167,25,45,0.8)] scale-110"
                    : "border-[#79604A]/50 bg-[#100D0D] hover:border-[#E8DCC8] hover:scale-105"
                }`}
              >
                <span
                  className={`font-mono text-[10px] font-bold ${
                    isActive ? "text-[#E8DCC8]" : "text-[#79604A] group-hover:text-[#E8DCC8]"
                  }`}
                >
                  {stage.num}
                </span>

                {/* Pulsing center ping when active */}
                {isActive && (
                  <motion.span
                    layoutId="timeline-pulse"
                    className="absolute inset-0 rounded-full border border-[#A7192D] animate-ping opacity-75"
                  />
                )}
              </div>

              {/* Stage Popout Label (Shows on hover or active) */}
              <div className="absolute left-8 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="border border-[#79604A]/50 bg-[#181414]/95 px-2 py-0.5 shadow-lg backdrop-blur-sm">
                  <span className="font-mono text-[10px] tracking-wider uppercase text-[#E8DCC8] block">
                    {stage.label}
                  </span>
                  <span className="font-mono text-[8px] text-[#A69A8C] block">{stage.desc}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Percentage Readout */}
      <div className="mt-3 text-center">
        <span className="font-mono text-[10px] text-[#A7192D] block font-bold">
          {Math.round(scrollProgress * 100)}%
        </span>
        <span className="font-mono text-[8px] text-[#79604A] uppercase tracking-widest block">
          SCRUB
        </span>
      </div>
    </aside>
  );
}
