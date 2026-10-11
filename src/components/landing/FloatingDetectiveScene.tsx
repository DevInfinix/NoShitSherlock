"use client";

import { useEffect, useState } from "react";

interface FloatingDetectiveSceneProps {
  className?: string;
}

export function FloatingDetectiveScene({ className = "" }: FloatingDetectiveSceneProps) {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouseOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden select-none ${className}`}
    >
      {/* Volumetric Desk Lamp Cone of Light */}
      <div
        className="absolute -top-32 right-1/4 w-[600px] h-[750px] pointer-events-none opacity-40 blur-3xl transition-transform duration-700 ease-out"
        style={{
          background:
            "radial-gradient(ellipse at 50% 20%, rgba(232, 220, 200, 0.18) 0%, rgba(167, 25, 45, 0.12) 40%, transparent 75%)",
          transform: `translate(${mouseOffset.x * 25}px, ${mouseOffset.y * 20}px)`,
        }}
      />

      {/* Deep Burgundy Corner Shadow Wash */}
      <div
        className="absolute bottom-1/4 -left-32 w-[550px] h-[650px] pointer-events-none opacity-50 blur-3xl transition-transform duration-700 ease-out"
        style={{
          background: "radial-gradient(circle, rgba(38, 13, 16, 0.8) 0%, rgba(16, 13, 13, 0) 70%)",
          transform: `translate(${-mouseOffset.x * 20}px, ${-mouseOffset.y * 15}px)`,
        }}
      />

      {/* Floating 3D Item 1: Evidence Manila Case Folder (Top Left) */}
      <div
        className="absolute top-28 -left-10 sm:left-6 lg:left-12 pointer-events-none opacity-40 transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${mouseOffset.x * 30}px, ${mouseOffset.y * 25}px, 0) rotate(${
            -12 + mouseOffset.x * 4
          }deg)`,
        }}
      >
        <div className="relative w-52 sm:w-64 h-64 sm:h-80 border-2 border-[#79604A]/50 bg-[#1c1613] p-5 shadow-2xl backdrop-blur-sm">
          {/* Manila Tab */}
          <div className="absolute -top-4 left-4 h-4 w-20 border-t-2 border-x-2 border-[#79604A]/50 bg-[#1c1613] rounded-t-sm" />
          <div className="border border-[#79604A]/30 h-full p-4 flex flex-col justify-between">
            <div className="space-y-2">
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#A7192D] block">
                CASE EXHIBIT #01
              </span>
              <div className="h-[2px] w-12 bg-[#A7192D]/60" />
              <div className="space-y-1.5 pt-2">
                <div className="h-1.5 w-full bg-[#79604A]/25 rounded-full" />
                <div className="h-1.5 w-4/5 bg-[#79604A]/25 rounded-full" />
                <div className="h-1.5 w-3/4 bg-[#79604A]/25 rounded-full" />
              </div>
            </div>
            <div className="border-2 border-[#A7192D]/50 px-2 py-1 text-center -rotate-6">
              <span className="font-mono text-[10px] uppercase font-bold text-[#A7192D]">
                CONFIDENTIAL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating 3D Item 2: Polaroid Crime Scene Photo (Top Right) */}
      <div
        className="absolute top-48 -right-8 sm:right-8 lg:right-16 pointer-events-none opacity-35 transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${mouseOffset.x * -25}px, ${mouseOffset.y * -20}px, 0) rotate(${
            14 + mouseOffset.y * 5
          }deg)`,
        }}
      >
        <div className="relative w-44 sm:w-52 h-56 sm:h-64 border-2 border-[#79604A]/60 bg-[#181414] p-3 shadow-2xl">
          {/* Photo Frame Area */}
          <div className="w-full h-40 sm:h-48 border border-[#79604A]/30 bg-[#100D0D] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#260D10]/50 via-transparent to-[#100D0D]/80" />
            <span className="font-mono text-[9px] text-[#79604A] tracking-wider uppercase z-10">
              EXHIBIT B {"//"} CRIME SCENE
            </span>
          </div>
          <div className="pt-2 text-center">
            <span className="font-mono text-[8px] text-[#A69A8C] uppercase tracking-widest">
              BLACKWOOD EXCHANGE
            </span>
          </div>
        </div>
      </div>

      {/* Floating 3D Item 3: Redacted Telegram Wiretap Slip (Mid Left) */}
      <div
        className="absolute top-1/2 -left-12 sm:left-4 pointer-events-none opacity-30 transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${mouseOffset.x * 20}px, ${mouseOffset.y * 35}px, 0) rotate(${
            8 - mouseOffset.x * 3
          }deg)`,
        }}
      >
        <div className="w-60 sm:w-72 border border-[#79604A]/50 bg-[#151210] p-4 shadow-xl font-mono text-[9px] space-y-2 text-[#A69A8C]">
          <div className="flex justify-between border-b border-[#79604A]/30 pb-1 text-[#E8DCC8]">
            <span>TELEGRAPH WIRE</span>
            <span>01:45 AM</span>
          </div>
          <p className="tracking-wider leading-relaxed">
            MESSAGE INTERCEPTED: [REDACTED] FINCH DEPARTED AT MIDNIGHT. LEDGER TRANSFERRED TO
            [REDACTED].
          </p>
        </div>
      </div>

      {/* Floating Dust Particles Texture */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#E8DCC8_1px,transparent_1px)] [background-size:48px_48px] pointer-events-none" />
    </div>
  );
}
