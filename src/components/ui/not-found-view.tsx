"use client";

import Link from "next/link";
import { type MouseEvent, useState } from "react";
import { BlobatarAvatar } from "@/components/ui/blobatar-avatar";
import { BorderBeam } from "@/components/ui/border-beam";
import { SpotlightCursor } from "@/components/ui/spotlight-cursor";
import { TextScramble } from "@/components/ui/text-scramble";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { soundEngine } from "@/lib/audio/sound-engine";

export function NotFoundView() {
  const [flashlightPos, setFlashlightPos] = useState({ x: 50, y: 50 });
  const [tagDiscovered, setTagDiscovered] = useState(false);

  const handlePointerMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFlashlightPos({ x, y });
  };

  const handleTagClick = () => {
    soundEngine.playPaper();
    setTagDiscovered(true);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[var(--color-ink)] p-6 text-[var(--color-paper)] selection:bg-[var(--color-evidence-red)]"
    >
      <SpotlightCursor />

      {/* Interactive Dark Warehouse Flashlight Mask */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 380px at ${flashlightPos.x}% ${flashlightPos.y}%, rgba(169, 135, 74, 0.12) 0%, rgba(9, 8, 7, 0.95) 70%, rgba(9, 8, 7, 1) 100%)`,
        }}
      />

      {/* Police Crime Scene Barrier Tape Ticker */}
      <div className="absolute top-12 left-0 right-0 -rotate-3 overflow-hidden border-y border-[var(--color-evidence-red)] bg-[var(--color-evidence-red)]/15 py-2 font-mono text-xs uppercase tracking-widest text-[var(--color-evidence-red)] backdrop-blur-sm select-none">
        <div className="flex w-max gap-8 animate-marquee">
          <span>
            CRIME SCENE {"//"} DO NOT CROSS {"//"} EVIDENCE MISSING {"//"} FILE 404
          </span>
          <span>&bull;</span>
          <span>
            POLICE LINE {"//"} DO NOT ENTER {"//"} ARCHIVES RESTRICTED
          </span>
          <span>&bull;</span>
          <span>
            CRIME SCENE {"//"} DO NOT CROSS {"//"} EVIDENCE MISSING {"//"} FILE 404
          </span>
          <span>&bull;</span>
          <span>
            POLICE LINE {"//"} DO NOT ENTER {"//"} ARCHIVES RESTRICTED
          </span>
        </div>
      </div>

      {/* Central Classified File Container */}
      <div className="relative z-10 max-w-2xl w-full border border-[var(--color-brass)]/40 bg-[var(--color-ink-raised)]/95 p-8 shadow-2xl backdrop-blur-md md:p-12 text-center space-y-6">
        <BorderBeam size={180} duration={8} />

        {/* Detective Header Stamp */}
        <div className="flex items-center justify-between border-b border-[var(--color-brass)]/20 pb-4">
          <div className="flex items-center gap-2">
            <BlobatarAvatar name="detective-unknown" size={32} />
            <span className="font-mono text-[10px] tracking-widest text-[var(--color-evidence-red)]">
              UNRESOLVED CASE 404
            </span>
          </div>
          <span className="font-mono text-[10px] text-[var(--color-paper-muted)]">
            STATUS: MISSING IN ACTION
          </span>
        </div>

        {/* Big Glitch 404 Title */}
        <h1 className="font-serif text-6xl font-bold tracking-tight text-[var(--color-paper)] md:text-8xl">
          <TextShimmer className="text-[var(--color-brass)]">404</TextShimmer>
        </h1>

        <div className="space-y-2">
          <h2 className="font-serif text-xl font-semibold text-[var(--color-paper)]">
            Case File Not Found in Central Archives
          </h2>
          <p className="font-serif text-sm leading-relaxed text-[var(--color-paper-muted)]">
            The page you are tracking has been scrubbed from records, relocated under witness
            protection, or never existed in the department files.
          </p>
        </div>

        {/* Scrambled Cipher Fragment */}
        <div className="border border-dashed border-[var(--color-brass)]/30 bg-[var(--color-ink)]/80 p-4 font-mono text-xs text-[var(--color-paper-muted)]">
          <span className="text-[var(--color-evidence-red)]">[CORRUPTED TELEGRAPH]: </span>
          <TextScramble duration={1.5} characterSet="0123456789ABCDEF!#$%">
            CIPHER-404-ERR-RECORD-NOT-FOUND-SECTOR-NULL
          </TextScramble>
        </div>

        {/* Interactive Evidence Tag Clue */}
        <button
          type="button"
          onClick={handleTagClick}
          className="w-full cursor-pointer border border-[var(--color-brass)]/60 bg-[var(--color-brass)]/10 p-3 font-mono text-xs transition-all hover:bg-[var(--color-brass)]/20 hover:border-[var(--color-brass)]"
        >
          <span className="text-[var(--color-brass)]">
            {tagDiscovered
              ? "★ EVIDENCE TAG EXAMINED: PATH CLEAR TO HEADQUARTERS"
              : "SEARCH FLASHLIGHT CONE: CLICK TO INSPECT CORNER EVIDENCE TAG"}
          </span>
        </button>

        {/* Return Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-[var(--color-brass)]/20">
          <Link
            href="/cases"
            onClick={() => soundEngine.playStamp()}
            className="border border-[var(--color-evidence-red)] bg-[var(--color-evidence-red)] px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-paper)] transition-all hover:bg-[#861f1e]"
          >
            RETURN TO CASE LIBRARY &rarr;
          </Link>
          <Link
            href="/"
            onClick={() => soundEngine.playPaper()}
            className="border border-[var(--color-brass)]/40 bg-[var(--color-ink)] px-6 py-2.5 font-mono text-xs uppercase tracking-wider text-[var(--color-paper-muted)] transition-all hover:border-[var(--color-brass)] hover:text-[var(--color-paper)]"
          >
            LANDING VAULT
          </Link>
        </div>
      </div>
    </div>
  );
}
