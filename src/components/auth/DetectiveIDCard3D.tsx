"use client";

import { useRef, useState } from "react";

export interface DetectiveCardProps {
  email?: string;
  agentTag?: string;
  codename?: string;
  isPasswordFocused?: boolean;
  isFlipped?: boolean;
  hoveredProvider?: "email" | "google" | "github" | null;
  onCardClick?: () => void;
}

export function DetectiveIDCard3D({
  email = "",
  agentTag = "???",
  codename = "",
  isPasswordFocused = false,
  isFlipped = false,
  hoveredProvider = null,
  onCardClick,
}: DetectiveCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [internalFlip, setInternalFlip] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const cleanEmail = email.trim();
  const rawUsername = codename && codename !== "RECRUIT" ? codename.trim() : "";
  const rawEmailPrefix = cleanEmail ? cleanEmail.split("@")[0] : "";
  const activeCallsign = (rawUsername || rawEmailPrefix || "RECRUIT").toUpperCase();
  const activeEmail = cleanEmail ? cleanEmail.toLowerCase() : "PENDING CLEARANCE";
  const displayTag = agentTag === "???" || !agentTag ? "???" : agentTag;

  const shouldFlip = (isFlipped ?? internalFlip) || isPasswordFocused;

  const handleToggleFlip = () => {
    setInternalFlip((prev) => !prev);
    if (onCardClick) onCardClick();
  };

  // Lenient, smooth 3D tilt tracking without jitter or wobble
  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: 0, y: 0 });
  };

  const rotX = isHovered ? -mousePos.y * 14 : 0;
  const rotY = (shouldFlip ? 180 : 0) + (isHovered ? mousePos.x * 16 : 0);

  return (
    <div
      className="relative w-full py-4 flex items-center justify-center select-none"
      style={{ perspective: "1400px" }}
    >
      {/* 3D Interactive Card Container */}
      <button
        type="button"
        ref={cardRef}
        aria-label="Interactive Detective ID Warrant Card. Tap or click to flip."
        onClick={handleToggleFlip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggleFlip();
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative cursor-pointer transition-transform duration-500 ease-out outline-none border-none p-0 bg-transparent text-left"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`,
          width: "min(92vw, 360px)",
          height: "520px",
        }}
      >
        {/* Top Metallic Brass Swivel Clip & D-Ring (Permanently Anchored) */}
        <div
          className="absolute -top-7 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none"
          style={{ transform: "translateZ(12px)" }}
        >
          {/* D-Ring */}
          <div className="w-8 h-4 border-2 border-brass rounded-t-full bg-ink/80 shadow-md" />
          {/* Swivel body */}
          <div className="w-5 h-4 bg-gradient-to-b from-[#c5a059] to-[#8c6d31] rounded-sm shadow-sm" />
          {/* Clip jaw over slot */}
          <div className="w-16 h-3 bg-[#a9874a] border border-[#d4af37] shadow-lg rounded-xs" />
        </div>

        {/* FRONT FACE OF WARRANT BADGE */}
        <div
          className="absolute inset-0 rounded-lg p-5 flex flex-col justify-between shadow-2xl border-2 border-brass/80 bg-[#14100e] text-paper overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "translateZ(1px)",
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.85), inset 0 0 25px rgba(169, 135, 74, 0.12)",
          }}
        >
          {/* Ambient Provider Background Tint */}
          {hoveredProvider === "google" && (
            <div className="absolute inset-0 bg-blue-500/10 pointer-events-none transition-opacity duration-300" />
          )}
          {hoveredProvider === "github" && (
            <div className="absolute inset-0 bg-purple-500/10 pointer-events-none transition-opacity duration-300" />
          )}
          {hoveredProvider === "email" && (
            <div className="absolute inset-0 bg-evidence-red/15 pointer-events-none transition-opacity duration-300" />
          )}

          {/* Inner hairline border */}
          <div className="absolute inset-2 border border-brass/30 rounded-md pointer-events-none" />

          {/* Badge Top Header */}
          <div className="relative z-10 text-center pt-2 border-b border-brass/30 pb-2.5">
            <div className="w-14 h-1.5 mx-auto mb-2 bg-[#090807] border border-brass/50 rounded-full" />
            <h3 className="font-valmist font-extrabold text-base tracking-[0.2em] text-brass uppercase leading-none">
              NO SHIT SHERLOCK
            </h3>
            <p className="font-mono text-[9px] text-paper-muted tracking-wider uppercase mt-1">
              DEPARTMENT OF UNRESOLVED INVESTIGATIONS
            </p>
          </div>

          {/* Photo Box & Details Row */}
          <div className="relative z-10 grid grid-cols-12 gap-3 items-center my-auto">
            {/* Silhouette Photo Box (Left 5 cols) */}
            <div className="col-span-5 relative bg-[#090807] border-2 border-brass/80 h-36 rounded-xs flex flex-col items-center justify-end overflow-hidden p-1 shadow-inner">
              {/* Fedora & Trench Silhouette */}
              <div className="w-12 h-6 bg-[#261e18] rounded-t-full mb-1 relative">
                <div className="w-16 h-1.5 bg-[#18130f] rounded-full absolute -bottom-0.5 -left-2" />
              </div>
              <div className="w-16 h-14 bg-[#1f1814] rounded-t-lg relative border-t border-brass/40" />

              {/* Verified Stamp Overlay */}
              <div className="absolute bottom-1 right-1 border border-evidence-red text-evidence-red px-1 py-0.5 text-[8px] font-mono font-bold rotate-[-12deg] bg-ink/70">
                VERIFIED
              </div>
            </div>

            {/* Operative Details (Right 7 cols) */}
            <div className="col-span-7 flex flex-col justify-center space-y-2 text-left pl-1">
              <div>
                <span className="font-mono text-[9px] text-smoke block uppercase tracking-wider">
                  OPERATIVE NO.
                </span>
                <span className="font-valmist font-extrabold text-2xl text-paper tracking-wide block leading-tight">
                  AGENT {displayTag}
                </span>
              </div>

              <div>
                <span className="font-mono text-[9px] text-smoke block uppercase tracking-wider">
                  CALLSIGN
                </span>
                <span className="font-mono font-bold text-xs text-brass block truncate">
                  {activeCallsign}
                </span>
              </div>

              <div>
                <span className="font-mono text-[9px] text-smoke block uppercase tracking-wider">
                  TELEGRAPH
                </span>
                <span className="font-mono text-[10px] text-paper-muted block truncate">
                  {activeEmail}
                </span>
              </div>

              <div>
                <span className="font-mono text-[9px] text-smoke block uppercase tracking-wider">
                  STATUS
                </span>
                <span className="font-mono font-bold text-[10px] block leading-tight">
                  {hoveredProvider === "google" && (
                    <span className="text-blue-400">● GOOGLE CLEARANCE</span>
                  )}
                  {hoveredProvider === "github" && (
                    <span className="text-purple-400">● GITHUB CLEARANCE</span>
                  )}
                  {hoveredProvider === "email" && (
                    <span className="text-red-400">● TELEGRAPH PASSCODE</span>
                  )}
                  {!hoveredProvider && isPasswordFocused && (
                    <span className="text-amber-400">● VERIFYING PASSCODE</span>
                  )}
                  {!hoveredProvider && !isPasswordFocused && (
                    <span className="text-emerald-400">● ACTIVE INVESTIGATOR</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Fingerprint & Department Seal */}
          <div className="relative z-10 flex items-center justify-between border-t border-brass/30 pt-2 px-1">
            {/* Stylized Fingerprint */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-9 border border-brass/40 rounded-full flex items-center justify-center relative overflow-hidden opacity-60">
                <div className="w-6 h-7 border border-brass/50 rounded-full" />
                <div className="w-4 h-5 border border-brass/60 rounded-full absolute" />
                <div className="w-2 h-3 border border-brass/70 rounded-full absolute" />
              </div>
              <span className="font-mono text-[8px] text-smoke uppercase tracking-tight">
                CLASS V<br />
                DOSSIER
              </span>
            </div>

            {/* Circular Project Seal */}
            <div className="w-12 h-12 rounded-full border border-brass/60 flex flex-col items-center justify-center text-center p-1 opacity-80">
              <span className="font-valmist text-[7px] font-bold text-brass uppercase leading-none">
                NO SHIT
              </span>
              <span className="font-mono text-[6px] text-smoke uppercase">SHERLOCK</span>
            </div>
          </div>

          {/* Barcode & Serial Number */}
          <div className="relative z-10 bg-[#090807] border border-brass/40 rounded-xs p-1.5 text-center mt-1">
            <div className="h-6 flex items-center justify-center gap-0.5 overflow-hidden opacity-85">
              {[
                { id: "b1", w: 3 },
                { id: "b2", w: 1 },
                { id: "b3", w: 4 },
                { id: "b4", w: 1 },
                { id: "b5", w: 5 },
                { id: "b6", w: 2 },
                { id: "b7", w: 6 },
                { id: "b8", w: 1 },
                { id: "b9", w: 3 },
                { id: "b10", w: 4 },
                { id: "b11", w: 1 },
                { id: "b12", w: 2 },
                { id: "b13", w: 5 },
                { id: "b14", w: 1 },
                { id: "b15", w: 3 },
                { id: "b16", w: 2 },
                { id: "b17", w: 4 },
                { id: "b18", w: 1 },
                { id: "b19", w: 6 },
                { id: "b20", w: 2 },
                { id: "b21", w: 1 },
                { id: "b22", w: 3 },
              ].map((bar) => (
                <div key={bar.id} style={{ width: `${bar.w}px` }} className="h-full bg-paper" />
              ))}
            </div>
            <div className="font-mono text-[9px] text-paper-muted tracking-widest mt-1">
              NSS-DOI-{displayTag}-883492-X
            </div>
          </div>

          {/* Flip Hint */}
          <div className="relative z-10 text-center font-mono text-[8px] text-smoke uppercase tracking-widest mt-1">
            [ TAP OR CLICK TO FLIP WARRANT ]
          </div>
        </div>

        {/* BACK FACE OF WARRANT BADGE */}
        <div
          className="absolute inset-0 rounded-lg p-5 flex flex-col justify-between shadow-2xl border-2 border-brass/80 bg-[#14100e] text-paper overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg) translateZ(1px)",
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.85), inset 0 0 25px rgba(169, 135, 74, 0.12)",
          }}
        >
          {/* Inner hairline border */}
          <div className="absolute inset-2 border border-brass/30 rounded-md pointer-events-none" />

          {/* Magnetic Stripe across top */}
          <div className="relative z-10 -mx-5 -mt-1 h-10 bg-[#090807] border-y border-brass/40 flex items-center justify-center">
            <span className="font-mono text-[8px] text-brass/70 tracking-[0.3em] uppercase">
              ENCRYPTED TRACK 1 {"//"} METROPOLITAN VAULT
            </span>
          </div>

          {/* Microchip & Legal Directives */}
          <div className="relative z-10 flex gap-3 items-center my-2">
            {/* Gold Microchip */}
            <div className="w-12 h-10 bg-gradient-to-br from-[#d4af37] to-[#8c6d31] rounded-xs border border-ink p-1 flex flex-col justify-between shadow-md shrink-0">
              <div className="w-full h-0.5 bg-[#423315]" />
              <div className="w-full h-0.5 bg-[#423315]" />
              <div className="w-full h-0.5 bg-[#423315]" />
            </div>

            {/* Directive notice */}
            <p className="font-serif text-[9px] text-paper-muted leading-tight text-left">
              Official warrant of No Shit Sherlock. Authorized to examine crime scenes and place
              chronological pinboard deductions.
            </p>
          </div>

          {/* Operative Signature Strip */}
          <div className="relative z-10 bg-[#e7ddc8] text-ink p-2 rounded-xs border border-brass/60 my-1">
            <span className="font-mono text-[8px] text-[#78716a] block uppercase">
              OPERATIVE SIGNATURE
            </span>
            <span className="font-handwriting text-xl text-[#1e1b4b] italic block leading-none py-1">
              {activeCallsign || "Sherlock Holmes"}
            </span>
          </div>

          {/* Cryptographic Access Verification */}
          <div className="relative z-10 bg-[#090807] border border-oxblood/80 p-2.5 rounded-xs text-left font-mono text-[9px] space-y-1">
            <div className="text-evidence-red font-bold uppercase tracking-wider">
              CRYPTOGRAPHIC CREDENTIAL HASH
            </div>
            <div className="text-paper truncate">HASH: [SHA-256::NSS-{displayTag}::993a4f8b]</div>
            <div className="text-paper-muted truncate">TELEGRAPH: {activeEmail}</div>
            <div className="text-brass">CLEARANCE: GRANTED FOR ALL DOSSIERS</div>
          </div>

          {/* Red Rubber Evidence Stamp */}
          <div className="relative z-10 border-2 border-evidence-red text-evidence-red p-2 text-center rotate-[-4deg] bg-ink/60">
            <div className="font-stamp text-xs font-bold uppercase tracking-widest">
              NO SHIT SHERLOCK
            </div>
            <div className="font-mono text-[8px]">COLD CASE DIVISION • LONDON</div>
          </div>

          {/* Flip Hint */}
          <div className="relative z-10 text-center font-mono text-[8px] text-smoke uppercase tracking-widest mt-1">
            [ TAP OR CLICK TO FLIP TO FRONT ]
          </div>
        </div>
      </button>
    </div>
  );
}
