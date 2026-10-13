"use client";

import { AnimatePresence } from "motion/react";
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
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#080605] text-[#E7DDC8] select-none cursor-default">
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

      {/* 2. Atmospheric Noir Vignette Overlay (edge fade and corner darkening) */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(8,6,4,0.48)_72%,rgba(4,3,2,0.92)_100%)]" />

      {/* 3. Subtle Warm Lamp Atmosphere Glow at Lower-Left Desk Area */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_16%_88%,rgba(255,174,66,0.09)_0%,transparent_48%)]" />

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

      {/* 5. Fullscreen Borderless 3D Case Dossier Inspection View */}
      <AnimatePresence>
        {selectedCase && (
          <ForensicCaseInciseOverlay
            activeCase={selectedCase}
            onClose={() => setSelectedCase(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
