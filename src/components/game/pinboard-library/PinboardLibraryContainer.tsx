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

  // Close inspection on Escape key
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
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#0A0806] text-[#E7DDC8] select-none">
      {/* 1. Fullscreen 3D WebGL / R3F Canvas Layer (Covers 100% Viewport) */}
      <div className="absolute inset-0 z-0">
        <PinboardLibrary3D
          cases={cases}
          hoveredCase={hoveredCase}
          selectedCase={selectedCase}
          onHoverCase={handleHoverCase}
          onSelectCase={handleSelectCase}
        />
      </div>

      {/* 2. Soft Atmospheric Peripheral Vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(10,8,6,0.6)_85%,rgba(10,8,6,0.95)_100%)]" />

      {/* 3. Top Immersive Floating HUD Bar */}
      <div className="absolute top-4 inset-x-4 sm:inset-x-8 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-4">
        {/* Top Left: Department Evidence Seal */}
        <div className="pointer-events-auto border border-[#A9874A]/40 bg-[#120E0B]/90 px-4 py-2 backdrop-blur-md shadow-xl flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A7192D] animate-pulse" />
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#A9874A] font-bold block">
              METROPOLITAN POLICE {"//"} CENTRAL COLD FILE WALL
            </span>
            <span className="font-serif text-xs text-[#E7DDC8]">
              {cases.length} RESTRICTED EVIDENCE FILES PINNED
            </span>
          </div>
        </div>

        {/* Top Right: Detective Profile & Minimal Controls */}
        <div className="pointer-events-auto flex items-center gap-3">
          <Link
            href="/leaderboard"
            className="border border-[#A9874A]/40 bg-[#120E0B]/90 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#A9874A] hover:border-[#A9874A] hover:bg-[#A9874A]/10 transition-colors backdrop-blur-md shadow-lg"
          >
            Clearance Registry &rarr;
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-2 border border-[#A9874A]/40 bg-[#120E0B]/90 px-3 py-1.5 backdrop-blur-md shadow-lg font-mono text-[11px]">
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
              className="border border-[#A9874A]/40 bg-[#120E0B]/90 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-[#E7DDC8] hover:border-[#A9874A] backdrop-blur-md"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* 4. Bottom Hover Status Ribbon (Provides instant hover feedback without covering cards) */}
      <div className="absolute bottom-4 inset-x-4 sm:inset-x-8 z-20 pointer-events-none flex items-center justify-between">
        <div className="pointer-events-auto border border-[#A9874A]/40 bg-[#120E0B]/90 px-4 py-2 backdrop-blur-md shadow-xl text-left max-w-lg">
          {hoveredCase ? (
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#A7192D] font-bold block">
                [INSPECT TARGET] FILE #{hoveredCase.id}: {hoveredCase.title}
              </span>
              <span className="font-serif text-xs text-[#E7DDC8] block truncate">
                Level: {"★".repeat(hoveredCase.difficulty)} {"//"} Click to unroll forensic dossier
                & evidence photos
              </span>
            </div>
          ) : (
            <div className="space-y-0.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#78716A] block">
                [IMMERSIVE 3D EVIDENCE WALL]
              </span>
              <span className="font-serif text-xs text-[#B8AD98] block">
                Hover to inspect cards &bull; Click to open high-resolution forensic briefing
              </span>
            </div>
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
                    : "border-[#A9874A]/30 bg-[#120E0B]/80 text-[#B8AD98] hover:border-[#A9874A]"
                }`}
              >
                FILE #{c.id}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Center Forensic Case Incise Modal (Opens reliably on click, no hover-fight) */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            {/* Backdrop Dimmer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCase(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
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
