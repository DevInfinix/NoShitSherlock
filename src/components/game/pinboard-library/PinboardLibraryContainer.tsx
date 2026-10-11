"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { soundEngine } from "@/lib/audio/sound-engine";
import { signOut } from "@/lib/auth-client";
import type { ActiveCaseListing } from "@/server/services/game-session-service";
import { ForensicCaseInciseOverlay } from "./ForensicCaseInciseOverlay";
import { PinboardLibrary3D } from "./PinboardLibrary3D";

interface PinboardLibraryContainerProps {
  cases: ActiveCaseListing[];
  currentUser?: {
    id: string;
    email?: string | null;
    name?: string | null;
  } | null;
  agentTag?: string | null;
}

export function PinboardLibraryContainer({
  cases,
  currentUser,
  agentTag,
}: PinboardLibraryContainerProps) {
  const router = useRouter();
  const [hoveredCase, setHoveredCase] = useState<ActiveCaseListing | null>(null);
  const [selectedCase, setSelectedCase] = useState<ActiveCaseListing | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mousePos, setMousePos] = useState({ x: -300, y: -300 });

  // Track cursor position for custom detective flashlight beam
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Close inspection modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedCase(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleHoverCase = (item: ActiveCaseListing | null) => {
    if (item && item.slug !== hoveredCase?.slug) {
      soundEngine.playPaper();
    }
    setHoveredCase(item);
  };

  const handleSelectCase = (item: ActiveCaseListing) => {
    soundEngine.playStamp();
    setSelectedCase(item);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    soundEngine.playPaper();
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace("/login");
        },
      },
    });
  };

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#080605] text-[#E7DDC8] select-none cursor-none">
      {/* 1. Fullscreen 3D WebGL / R3F Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <PinboardLibrary3D
          cases={cases}
          hoveredCase={hoveredCase}
          selectedCase={selectedCase}
          onHoverCase={handleHoverCase}
          onSelectCase={handleSelectCase}
        />
      </div>

      {/* 2. Soft Atmospheric Vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(8,6,5,0.7)_80%,rgba(8,6,5,0.98)_100%)]" />

      {/* 3. Detective Flashlight Cursor Beam */}
      <div
        className="pointer-events-none fixed z-20 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform duration-75 ease-out"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
          background:
            "radial-gradient(circle, rgba(255,243,220,0.16) 0%, rgba(255,243,220,0.05) 45%, transparent 75%)",
        }}
      />

      {/* 4. Top Immersive Floating HUD Bar */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-8 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-4">
        {/* Top Left: Department Evidence Seal */}
        <div className="pointer-events-auto border border-[#A9874A]/40 bg-[#100D0A]/90 px-4 py-2 backdrop-blur-md shadow-xl flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A7192D] animate-pulse" />
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#A9874A] font-bold block">
              METROPOLITAN POLICE {"//"} GREEN FELT NOTICEBOARD
            </span>
            <span className="font-serif text-xs text-[#E7DDC8]">
              {cases.length} RESTRICTED EVIDENCE CASES PINNED
            </span>
          </div>
        </div>

        {/* Top Right: Detective Profile & Minimal Controls */}
        <div className="pointer-events-auto flex items-center gap-3">
          <Link
            href="/leaderboard"
            className="border border-[#A9874A]/40 bg-[#100D0A]/90 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#A9874A] hover:border-[#A9874A] hover:bg-[#A9874A]/10 transition-colors backdrop-blur-md shadow-lg"
          >
            Clearance Registry &rarr;
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-2 border border-[#A9874A]/40 bg-[#100D0A]/90 px-3 py-1.5 backdrop-blur-md shadow-lg font-mono text-[11px]">
              <span className="text-[#B8AD98]">OPERATIVE:</span>
              <span className="text-[#E7DDC8] font-bold">
                {currentUser.name ?? currentUser.email}
              </span>
              {agentTag && <span className="text-[#A7192D] font-bold ml-1">[{agentTag}]</span>}

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="ml-2 border-l border-[#A9874A]/30 pl-2 text-[10px] text-[#A7192D] hover:underline uppercase tracking-wider cursor-pointer font-bold"
              >
                {isSigningOut ? "Locking..." : "Sign Out"}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="border border-[#A9874A]/40 bg-[#100D0A]/90 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#E7DDC8] hover:border-[#A9874A] backdrop-blur-md"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* 5. Bottom Subtle Case Status Indicator */}
      <div className="absolute bottom-4 inset-x-4 sm:inset-x-8 z-20 pointer-events-none flex items-center justify-between">
        <div className="pointer-events-auto border border-[#A9874A]/40 bg-[#100D0A]/90 px-4 py-2 backdrop-blur-md shadow-xl text-left max-w-lg">
          {hoveredCase ? (
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#A7192D] font-bold block">
                [EXHIBIT TARGET] FILE #{hoveredCase.id}: {hoveredCase.title}
              </span>
              <span className="font-serif text-xs text-[#E7DDC8] block truncate">
                Difficulty: {"★".repeat(hoveredCase.difficulty)} {"//"} Click to unroll forensic
                dossier
              </span>
            </div>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#78716A] block">
              [CINEMATIC NOTICEBOARD {"//"} FLASHLIGHT ACTIVE]
            </span>
          )}
        </div>

        {/* Quick File Selectors */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {cases.map((c) => {
            const isHovered = hoveredCase?.slug === c.slug;
            const isSelected = selectedCase?.slug === c.slug;
            return (
              <button
                type="button"
                key={c.slug}
                onClick={() => handleSelectCase(c)}
                onMouseEnter={() => handleHoverCase(c)}
                onMouseLeave={() => handleHoverCase(null)}
                className={`border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                  isSelected || isHovered
                    ? "border-[#A7192D] bg-[#641B1B] text-[#E7DDC8] font-bold shadow-md scale-105"
                    : "border-[#A9874A]/30 bg-[#100D0A]/80 text-[#B8AD98] hover:border-[#A9874A]"
                }`}
              >
                FILE #{c.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Center Forensic Case Incise Modal (Stable click-to-unroll, zero hover race) */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            {/* Backdrop Dimmer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCase(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Content */}
            <div className="relative z-50 w-full max-w-4xl">
              <ForensicCaseInciseOverlay
                activeCase={selectedCase}
                onClose={() => setSelectedCase(null)}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
