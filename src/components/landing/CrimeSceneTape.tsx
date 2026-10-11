"use client";

interface CrimeSceneTapeProps {
  className?: string;
  rotate?: string;
}

export function CrimeSceneTape({ className = "", rotate = "-rotate-1" }: CrimeSceneTapeProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative w-full overflow-hidden border-y border-[#A7192D]/70 bg-[#260D10]/80 py-2.5 font-mono text-xs uppercase tracking-[0.25em] text-[#E8DCC8] backdrop-blur-md select-none shadow-[0_4px_24px_rgba(16,13,13,0.8)] ${rotate} ${className}`}
    >
      <div className="flex w-max gap-8 animate-marquee">
        <span className="text-[#A7192D] font-bold">POLICE EVIDENCE LINE</span>
        <span className="text-[#79604A]">&bull;</span>
        <span>DO NOT CROSS</span>
        <span className="text-[#79604A]">&bull;</span>
        <span className="text-[#E8DCC8]">ACTIVE CRIME SCENE INVESTIGATION</span>
        <span className="text-[#79604A]">&bull;</span>
        <span className="text-[#A7192D] font-bold">NO SHIT SHERLOCK</span>
        <span className="text-[#79604A]">&bull;</span>
        <span>CRACK THE CASE</span>
        <span className="text-[#79604A]">&bull;</span>
        <span className="text-[#E8DCC8]">CHAIN OF CUSTODY VERIFIED</span>
        <span className="text-[#79604A]">&bull;</span>
        <span className="text-[#A7192D] font-bold">POLICE EVIDENCE LINE</span>
        <span className="text-[#79604A]">&bull;</span>
        <span>DO NOT CROSS</span>
        <span className="text-[#79604A]">&bull;</span>
        <span className="text-[#E8DCC8]">ACTIVE CRIME SCENE INVESTIGATION</span>
      </div>
    </div>
  );
}
