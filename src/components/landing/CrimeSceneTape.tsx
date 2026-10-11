"use client";

interface CrimeSceneTapeProps {
  className?: string;
  rotate?: string;
}

export function CrimeSceneTape({ className = "", rotate = "-rotate-1" }: CrimeSceneTapeProps) {
  const tapeSegments = [
    { label: "POLICE EVIDENCE LINE", highlight: true },
    { label: "DO NOT CROSS", highlight: false },
    { label: "ACTIVE CRIME SCENE INVESTIGATION", highlight: true, redText: false },
    { label: "NO SHIT SHERLOCK", highlight: true },
    { label: "CRACK THE CASE", highlight: false },
    { label: "CHAIN OF CUSTODY VERIFIED", highlight: false },
    { label: "FORENSIC UNIT 07", highlight: true },
    { label: "RESTRICTED ACCESS", highlight: false },
  ];

  return (
    <div
      aria-hidden="true"
      className={`relative w-full overflow-hidden border-y-2 border-[#A7192D] bg-[#220B0E]/95 py-3 font-mono text-xs uppercase tracking-[0.28em] text-[#E8DCC8] backdrop-blur-md select-none shadow-[0_0_40px_rgba(0,0,0,0.95),0_12px_24px_rgba(167,25,45,0.25)] ${rotate} ${className}`}
    >
      {/* Subtle diagonal micro-striping overlay for realistic police barrier tape texture */}
      <div className="pointer-events-none absolute inset-0 opacity-15 bg-[repeating-linear-gradient(45deg,#000,#000_10px,#A7192D_10px,#A7192D_20px)]" />

      {/* Continuously looping seamless marquee ticker */}
      <div className="flex w-max gap-8 animate-marquee relative z-10">
        {[...tapeSegments, ...tapeSegments].map((seg, i) => (
          <span key={`tape-1-${seg.label}-${i}`} className="inline-flex items-center gap-8">
            <span
              className={seg.highlight ? "text-[#A7192D] font-bold" : "text-[#E8DCC8] font-medium"}
            >
              {seg.label}
            </span>
            <span className="text-[#79604A] select-none">&bull;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
