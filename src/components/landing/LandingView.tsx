"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AudioControlHud } from "@/components/landing/AudioControlHud";
import { SmoothScrollProvider } from "@/components/landing/SmoothScrollProvider";
import { SpotlightCursor } from "@/components/ui/spotlight-cursor";
import { soundEngine } from "@/lib/audio/sound-engine";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TOTAL_FRAMES = 150;

interface LandingViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    agentTag?: string | null;
    username?: string | null;
  } | null;
}

export function LandingView({ user }: LandingViewProps) {
  const heroTrackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadCount, setLoadCount] = useState(0);

  // Preload 150 frames in public/landing/frames/
  useEffect(() => {
    let active = true;
    const images: HTMLImageElement[] = [];
    let loaded = 0;

    const drawFrame = (frameIdx: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = imagesRef.current[frameIdx];
      if (!img?.complete) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      let drawW = w;
      let drawH = h;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawH = w / imgRatio;
        offsetY = (h - drawH) / 2;
      } else {
        drawW = h * imgRatio;
        offsetX = (w - drawW) / 2;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    };

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const num = String(i).padStart(3, "0");
      img.src = `/landing/frames/frame-${num}.webp`;

      img.onload = () => {
        if (!active) return;
        loaded++;
        setLoadCount(loaded);
        if (loaded === 15 || loaded === TOTAL_FRAMES) {
          setIsLoaded(true);
          drawFrame(currentFrameRef.current);
        }
      };

      images.push(img);
    }
    imagesRef.current = images;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      drawFrame(currentFrameRef.current);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      active = false;
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // GSAP ScrollTrigger for the Hero Track
  useEffect(() => {
    if (!heroTrackRef.current) return;

    const ctx = gsap.context(() => {
      const drawFrame = (frameIdx: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx2d = canvas.getContext("2d");
        if (!ctx2d) return;

        const img = imagesRef.current[frameIdx];
        if (!img?.complete) return;

        const dpr = window.devicePixelRatio || 1;
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        const imgRatio = img.width / img.height;
        const canvasRatio = w / h;
        let drawW = w;
        let drawH = h;
        let offsetX = 0;
        let offsetY = 0;

        if (canvasRatio > imgRatio) {
          drawH = w / imgRatio;
          offsetY = (h - drawH) / 2;
        } else {
          drawW = h * imgRatio;
          offsetX = (w - drawW) / 2;
        }

        ctx2d.clearRect(0, 0, w, h);
        ctx2d.drawImage(img, offsetX, offsetY, drawW, drawH);
      };

      const frameObj = { frame: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroTrackRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: () => {
            const target = Math.min(TOTAL_FRAMES - 1, Math.floor(frameObj.frame));
            currentFrameRef.current = target;
            drawFrame(target);
          },
        },
      });

      // Scrub frames across hero scroll
      tl.to(
        frameObj,
        {
          frame: TOTAL_FRAMES - 1,
          ease: "none",
          duration: 1,
        },
        0,
      );

      // Detective: Initial zoom (1.18) & right shift (+7vw), smoothly centering (0vw, 1.0)
      if (canvasWrapRef.current) {
        tl.fromTo(
          canvasWrapRef.current,
          { scale: 1.18, x: "7vw" },
          { scale: 1.0, x: "0vw", ease: "power2.out", duration: 0.6 },
          0,
        );
      }

      // Title: Starts large, smoothly scales down towards top-left brand anchor
      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { scale: 1.0, y: "0vh", x: "0vw", transformOrigin: "top left" },
          { scale: 0.52, y: "-18vh", x: "-1.5vw", ease: "power2.inOut", duration: 0.55 },
          0,
        );
      }

      // Atmospheric crimson backlight intensifies as magnifying glass raises
      if (ambientGlowRef.current) {
        tl.fromTo(
          ambientGlowRef.current,
          { opacity: 0.45, scale: 0.95 },
          { opacity: 0.8, scale: 1.25, ease: "power1.inOut", duration: 1 },
          0,
        );
      }

      // Right-side hero content fades out smoothly as scroll transitions to mechanics
      if (heroContentRef.current) {
        tl.fromTo(
          heroContentRef.current,
          { opacity: 1, y: 0 },
          { opacity: 0.15, y: -40, ease: "power1.in", duration: 0.4 },
          0.3,
        );
      }
    }, heroTrackRef);

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScrollProvider>
      <div className="relative min-h-screen w-full bg-[#100D0D] text-[#E8DCC8] selection:bg-[#A7192D] selection:text-[#E8DCC8]">
        {/* Cinematic Ambient Spotlight Cursor (Follows mouse, normal OS cursor remains visible) */}
        <SpotlightCursor />

        {/* Global Film Grain Noise Texture */}
        <svg
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-30 h-full w-full opacity-[0.035]"
        >
          <filter id="noir-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.75"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noir-grain)" />
        </svg>

        {/* PROMINENT, HIGH-CONTRAST TOP NAVBAR */}
        <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between border-b border-[#79604A]/30 bg-[#100D0D]/90 px-6 sm:px-10 py-4 backdrop-blur-md">
          {/* Brand Mark */}
          <Link
            href="/"
            onClick={() => soundEngine.playPaper()}
            className="group flex items-center gap-3 select-none"
          >
            <div className="flex h-8 w-8 items-center justify-center border border-[#79604A] bg-[#260D10] shadow-md transition-colors group-hover:border-[#A7192D]">
              <span className="font-valmist text-sm font-bold text-[#E8DCC8]">N</span>
            </div>
            <div className="flex flex-col">
              <span className="font-valmist text-sm font-bold uppercase tracking-wider text-[#E8DCC8] group-hover:text-[#A7192D] transition-colors">
                NoShitSherlock
              </span>
              <span className="font-mono text-[9px] tracking-widest text-[#A69A8C]">
                DETECTIVE WEB GAME
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-wider text-[#A69A8C]">
            <Link
              href="/cases"
              onClick={() => soundEngine.playPaper()}
              className="hover:text-[#E8DCC8] transition-colors"
            >
              Cases
            </Link>
            <a href="#mechanics" className="hover:text-[#E8DCC8] transition-colors">
              Investigation
            </a>
            <a href="#case-01" className="hover:text-[#E8DCC8] transition-colors">
              Dossier 01
            </a>
            <Link
              href="/legal"
              onClick={() => soundEngine.playPaper()}
              className="hover:text-[#E8DCC8] transition-colors"
            >
              Directives
            </Link>
          </nav>

          {/* Right Action Controls & Audio Toggle */}
          <div className="flex items-center gap-4">
            <AudioControlHud />

            {user ? (
              <Link
                href="/cases"
                onClick={() => soundEngine.playStamp()}
                className="flex items-center gap-2 border border-[#79604A] bg-[#260D10] px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-[#E8DCC8] hover:border-[#A7192D] hover:bg-[#A7192D]/20 transition-all"
              >
                <span className="h-2 w-2 rounded-full bg-[#A7192D] animate-pulse" />
                <span>AGENT [{user.agentTag || user.name.slice(0, 3).toUpperCase()}]</span>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  onClick={() => soundEngine.playPaper()}
                  className="font-mono text-xs uppercase tracking-wider text-[#A69A8C] hover:text-[#E8DCC8] transition-colors px-2 py-1"
                >
                  Log as detective
                </Link>
                <Link
                  href="/signup"
                  onClick={() => soundEngine.playStamp()}
                  className="border border-[#A7192D] bg-[#A7192D] px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#E8DCC8] hover:bg-[#C52A3B] transition-all shadow-md"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* =========================================================================
            SECTION 1: HERO VIEWPORT & SCROLL-DRIVEN DETECTIVE SEQUENCE (220vh TRACK)
           ========================================================================= */}
        <div ref={heroTrackRef} className="relative h-[220vh] w-full">
          {/* Sticky 100vh Arena */}
          <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-between px-6 sm:px-12 lg:px-16 pt-16">
            {/* Loading Overlay */}
            {!isLoaded && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#100D0D]">
                <span className="font-valmist font-bold text-sm tracking-[0.25em] uppercase text-[#79604A] animate-pulse">
                  DECRYPTING EVIDENCE ARCHIVE... {Math.round((loadCount / TOTAL_FRAMES) * 100)}%
                </span>
                <div className="mt-4 h-[2px] w-48 bg-[#181414]">
                  <div
                    className="h-full bg-[#A7192D] transition-all duration-200"
                    style={{ width: `${(loadCount / TOTAL_FRAMES) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Layered Deep Burgundy and Crimson Atmospheric Backlight */}
            <div
              ref={ambientGlowRef}
              className="pointer-events-none absolute inset-0 z-0 transition-opacity"
              style={{
                background:
                  "radial-gradient(circle 650px at 55% 48%, rgba(167, 25, 45, 0.28) 0%, rgba(38, 13, 16, 0.55) 50%, rgba(16, 13, 13, 0) 75%)",
              }}
            />

            {/* Secondary Deep Burgundy Bottom Wash */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-48 z-0 opacity-60"
              style={{
                background: "linear-gradient(to top, #260D10 0%, transparent 100%)",
              }}
            />

            {/* Central Detective Canvas Container */}
            <div
              ref={canvasWrapRef}
              className="absolute inset-0 z-10 h-full w-full pointer-events-none flex items-center justify-center"
            >
              <canvas
                ref={canvasRef}
                className="h-full w-full object-cover transition-opacity duration-500"
                style={{ opacity: isLoaded ? 1 : 0 }}
              />
            </div>

            {/* LEFT ZONE: OVERSIZED "NO SHIT SHERLOCK" TITLE (WITH CONTRASTING COLORS) */}
            <div
              ref={titleRef}
              className="relative z-20 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl select-none"
            >
              <div className="flex flex-col">
                {/* "NO" in Warm Ivory */}
                <span className="font-valmist font-extrabold text-[clamp(4.2rem,8.5vw,9.8rem)] uppercase leading-[0.80] tracking-tight text-[#E8DCC8]">
                  NO
                </span>
                {/* "SHIT" in Warm Ivory */}
                <span className="font-valmist font-extrabold text-[clamp(4.2rem,8.5vw,9.8rem)] uppercase leading-[0.80] tracking-tight text-[#E8DCC8]">
                  SHIT
                </span>
                {/* "Sherlock" in Rich Crimson Red (Charlea Demo, Bold, Substantial) */}
                <span className="font-charlea font-bold italic text-[clamp(4.6rem,9.5vw,10.8rem)] leading-[0.86] tracking-[-0.03em] text-[#A7192D] drop-shadow-[0_4px_16px_rgba(167,25,45,0.35)]">
                  Sherlock
                </span>
              </div>
            </div>

            {/* RIGHT ZONE: CLEARLY LEGIBLE, CONCISE HERO BRIEFING */}
            <div
              ref={heroContentRef}
              className="relative z-20 w-full max-w-md lg:max-w-lg space-y-6 text-left"
            >
              {/* Eyebrow Label */}
              <div className="inline-flex items-center gap-2 border border-[#79604A]/50 bg-[#260D10]/80 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A7192D] animate-ping" />
                <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-[#E8DCC8]">
                  COLD CASE INVESTIGATION
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-valmist font-bold text-3xl sm:text-4xl lg:text-5xl uppercase leading-[1.05] tracking-tight text-[#E8DCC8]">
                Every cold case hides an unbroken sequence.
              </h1>

              {/* Readable Game Description */}
              <p className="font-selnora text-base sm:text-lg leading-relaxed text-[#A69A8C]">
                An open-source noir detective web game. Open the evidence folder, interrogate
                wiretaps, examine forensic transcripts, and collect clues into your notebook across
                five progressive sections.
              </p>

              {/* Garamond Condensed Italic Accent */}
              <p className="font-garamond text-lg sm:text-xl italic text-[#E8DCC8]/90 border-l-2 border-[#A7192D] pl-4 py-1">
                Once the folder closes, string the red yarn on the pinboard to reconstruct the
                timeline in chronological order.
              </p>

              {/* Prominent, High-Contrast Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                {user ? (
                  <Link
                    href="/cases"
                    onClick={() => soundEngine.playStamp()}
                    className="border border-[#A7192D] bg-[#A7192D] hover:bg-[#C52A3B] px-8 py-3.5 font-valmist font-bold text-base uppercase tracking-widest text-[#E8DCC8] shadow-2xl transition-all cursor-pointer"
                  >
                    Resume active case &rarr;
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      onClick={() => soundEngine.playStamp()}
                      className="border border-[#A7192D] bg-[#A7192D] hover:bg-[#C52A3B] px-8 py-3.5 font-valmist font-bold text-base uppercase tracking-widest text-[#E8DCC8] shadow-2xl transition-all cursor-pointer"
                    >
                      Register as detective &rarr;
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => soundEngine.playPaper()}
                      className="border border-[#79604A] bg-[#100D0D]/90 hover:border-[#E8DCC8] hover:bg-[#260D10] px-6 py-3.5 font-mono text-xs uppercase tracking-wider text-[#E8DCC8] transition-all cursor-pointer"
                    >
                      Log as detective
                    </Link>
                  </>
                )}
              </div>

              {/* Subtle Scroll Hint */}
              <div className="pt-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-[#79604A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A7192D]" />
                <span>SCROLL DOWN TO INSPECT EVIDENCE &darr;</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: INVESTIGATION MECHANICS & GAMEPLAY LOOP (#mechanics)
           ========================================================================= */}
        <section
          id="mechanics"
          className="relative z-30 min-h-screen px-6 sm:px-12 lg:px-16 py-28 border-t border-[#79604A]/30 bg-gradient-to-b from-[#100D0D] via-[#260D10]/40 to-[#100D0D]"
        >
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Section Header */}
            <div className="space-y-4 max-w-3xl">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#A7192D] block">
                01 {"//"} THE INVESTIGATION ARCHITECTURE
              </span>
              <h2 className="font-valmist font-extrabold text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#E8DCC8]">
                Server-Authoritative Deductions.
                <br />
                <span className="text-[#A7192D]">Zero Guesswork.</span>
              </h2>
              <p className="font-selnora text-lg sm:text-xl text-[#A69A8C] leading-relaxed">
                Correct answers never reach client memory. Every attempt, penalty, and clue unlock
                is executed in a single atomic database transaction.
              </p>
            </div>

            {/* 3 Core Gameplay Phases */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Phase 1 */}
              <div className="border border-[#79604A]/40 bg-[#181414]/90 p-8 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#79604A]/30 pb-3">
                  <span className="font-valmist font-bold text-2xl text-[#A7192D]">01</span>
                  <span className="font-mono text-[10px] uppercase text-[#A69A8C] tracking-widest">
                    PHASE ONE
                  </span>
                </div>
                <h3 className="font-valmist font-bold text-2xl uppercase tracking-tight text-[#E8DCC8]">
                  The Evidence Folder
                </h3>
                <p className="font-selnora text-sm sm:text-base text-[#A69A8C] leading-relaxed">
                  Five progressive sections of mixed puzzles: fill-in-the-blank letter ciphers,
                  forensic multiple-choice questions, testimony contradiction switches, cryptic
                  manuscripts, and analog wiretaps with synchronized audio playback.
                </p>
              </div>

              {/* Phase 2 */}
              <div className="border border-[#79604A]/40 bg-[#181414]/90 p-8 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#79604A]/30 pb-3">
                  <span className="font-valmist font-bold text-2xl text-[#79604A]">02</span>
                  <span className="font-mono text-[10px] uppercase text-[#A69A8C] tracking-widest">
                    PHASE TWO
                  </span>
                </div>
                <h3 className="font-valmist font-bold text-2xl uppercase tracking-tight text-[#E8DCC8]">
                  The Detective Notebook
                </h3>
                <p className="font-selnora text-sm sm:text-base text-[#A69A8C] leading-relaxed">
                  Every correct deduction permanently unlocks unredacted evidence items, autopsy
                  reports, and witness affidavits into your inventory notebook. You cannot guess
                  your way through.
                </p>
              </div>

              {/* Phase 3 */}
              <div className="border border-[#79604A]/40 bg-[#181414]/90 p-8 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#79604A]/30 pb-3">
                  <span className="font-valmist font-bold text-2xl text-[#C52A3B]">03</span>
                  <span className="font-mono text-[10px] uppercase text-[#A69A8C] tracking-widest">
                    PHASE THREE
                  </span>
                </div>
                <h3 className="font-valmist font-bold text-2xl uppercase tracking-tight text-[#E8DCC8]">
                  The Yarn Pinboard
                </h3>
                <p className="font-selnora text-sm sm:text-base text-[#A69A8C] leading-relaxed">
                  After Section 5 closes, the evidence folder becomes the crime pinboard. Drag and
                  arrange your gathered clues in strict chronological order. One correct timeline
                  breaks the case.
                </p>
              </div>
            </div>

            {/* Technical Rule Callout */}
            <div className="border-l-4 border-[#A7192D] bg-[#260D10]/40 p-6 font-mono text-xs text-[#A69A8C] space-y-1">
              <span className="font-bold text-[#E8DCC8] uppercase tracking-wider block">
                STATUTORY RULE {"//"} ANTI-SPAM & PENALTIES
              </span>
              <p>
                Each question allows a maximum of 5 attempts with server-enforced cooldowns. Wrong
                deductions penalize your score. Score never drops below zero.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: CASE DOSSIER ARCHIVES (#case-01)
           ========================================================================= */}
        <section
          id="case-01"
          className="relative z-30 min-h-screen px-6 sm:px-12 lg:px-16 py-28 border-t border-[#79604A]/30 bg-[#100D0D]"
        >
          <div className="mx-auto max-w-6xl space-y-14">
            {/* Header */}
            <div className="space-y-4">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#79604A] block">
                02 {"//"} CENTRAL CASE ARCHIVES
              </span>
              <h2 className="font-valmist font-extrabold text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#E8DCC8]">
                Open Case Dossiers
              </h2>
              <p className="font-selnora text-lg sm:text-xl text-[#A69A8C]">
                Cold cases waiting for deduction. Progress persists server-side across all devices.
              </p>
            </div>

            {/* Case 01: The Blackwood Protocol (Hero Card) */}
            <div className="border-2 border-[#79604A] bg-[#181414] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              {/* Corner Watermark */}
              <div className="absolute top-0 right-0 border-b border-l border-[#79604A]/40 bg-[#260D10] px-4 py-2 font-mono text-xs text-[#A7192D] tracking-widest uppercase">
                STATUS: ACTIVE CASE
              </div>

              <div className="max-w-3xl space-y-6">
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#A69A8C]">
                  <span className="border border-[#79604A] px-2.5 py-1 text-[#E8DCC8]">
                    CASE ID: 1928-BW
                  </span>
                  <span>DIFFICULTY: HARD (4/5)</span>
                  <span>5 SECTIONS</span>
                  <span>12 EVIDENCE CLUES</span>
                </div>

                <h3 className="font-valmist font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#E8DCC8]">
                  The Blackwood Protocol
                </h3>

                <p className="font-selnora text-base sm:text-lg text-[#A69A8C] leading-relaxed">
                  A locked first-class railway carriage arrives in Edinburgh carrying a deceased
                  diplomat and an empty steel briefcase. Five suspects with conflicting timetables.
                  Decrypt the coroner&apos;s findings, analyze intercepted telegrams, and
                  reconstruct the killer&apos;s movements.
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-6">
                  <Link
                    href="/cases"
                    onClick={() => soundEngine.playStamp()}
                    className="border border-[#A7192D] bg-[#A7192D] hover:bg-[#C52A3B] px-8 py-3.5 font-valmist font-bold text-sm uppercase tracking-widest text-[#E8DCC8] shadow-xl transition-all cursor-pointer"
                  >
                    Open Case Dossier &rarr;
                  </Link>

                  <span className="font-mono text-xs text-[#79604A]">
                    TIME ESTIMATE: 35-45 MINUTES
                  </span>
                </div>
              </div>
            </div>

            {/* Upcoming Archived Files */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="border border-[#79604A]/30 bg-[#181414]/60 p-6 space-y-3">
                <span className="font-mono text-[10px] uppercase text-[#79604A] tracking-widest">
                  CASE ARCHIVE {"//"} 1934
                </span>
                <h4 className="font-valmist font-bold text-xl uppercase text-[#E8DCC8]">
                  The Whispering Wire
                </h4>
                <p className="font-selnora text-sm text-[#A69A8C]">
                  An espionage cell operating inside the General Post Office. Decrypt telegraph
                  cables and locate the compromised transmitter.
                </p>
                <span className="font-mono text-xs text-[#A7192D] block pt-2">
                  STATUS: IN TRANSCRIPTION
                </span>
              </div>

              <div className="border border-[#79604A]/30 bg-[#181414]/60 p-6 space-y-3">
                <span className="font-mono text-[10px] uppercase text-[#79604A] tracking-widest">
                  CASE ARCHIVE {"//"} 1941
                </span>
                <h4 className="font-valmist font-bold text-xl uppercase text-[#E8DCC8]">
                  The Crimson Ledger
                </h4>
                <p className="font-selnora text-sm text-[#A69A8C]">
                  Counterfeit wartime bullion and a midnight explosion in the harbor treasury. Sift
                  forensic ash and reconstruct the conspirators&apos; ledger.
                </p>
                <span className="font-mono text-xs text-[#A7192D] block pt-2">
                  STATUS: IN FORENSIC AUDIT
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: ENLISTMENT CLEARANCE & FINAL CALL TO ACTION
           ========================================================================= */}
        <section className="relative z-30 px-6 sm:px-12 lg:px-16 py-28 border-t border-[#79604A]/30 bg-gradient-to-b from-[#100D0D] via-[#260D10]/50 to-[#100D0D]">
          <div className="mx-auto max-w-4xl border-2 border-[#79604A] bg-[#181414] p-8 sm:p-14 text-center space-y-8 shadow-2xl">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#A7192D] block">
              03 {"//"} OPERATIVE ENROLLMENT
            </span>

            <h2 className="font-valmist font-extrabold text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-[#E8DCC8]">
              {user ? "Report to Headquarters" : "Claim Your Detective Clearance"}
            </h2>

            <p className="font-selnora text-base sm:text-lg text-[#A69A8C] max-w-2xl mx-auto leading-relaxed">
              {user
                ? `Operative [${user.agentTag || user.name}], your credentials and solve records are verified. Return to the active dossier and finish the timeline.`
                : "Every recruit receives a permanent three-digit badge designation. Your solve times, scores, and hint balances sync seamlessly across desktop and mobile."}
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-6">
              {user ? (
                <Link
                  href="/cases"
                  onClick={() => soundEngine.playStamp()}
                  className="border border-[#A7192D] bg-[#A7192D] hover:bg-[#C52A3B] px-10 py-4 font-valmist font-bold text-base uppercase tracking-widest text-[#E8DCC8] shadow-2xl transition-all cursor-pointer"
                >
                  Resume investigation &rarr;
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    onClick={() => soundEngine.playStamp()}
                    className="border border-[#A7192D] bg-[#A7192D] hover:bg-[#C52A3B] px-10 py-4 font-valmist font-bold text-base uppercase tracking-widest text-[#E8DCC8] shadow-2xl transition-all cursor-pointer"
                  >
                    Register as detective &rarr;
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => soundEngine.playPaper()}
                    className="border border-[#79604A] bg-[#100D0D] hover:border-[#E8DCC8] hover:bg-[#260D10] px-8 py-4 font-mono text-xs uppercase tracking-wider text-[#E8DCC8] transition-all cursor-pointer"
                  >
                    Log as detective
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: COMPLETE NOIR FOOTER
           ========================================================================= */}
        <footer className="relative z-30 border-t border-[#79604A]/30 bg-[#100D0D] px-6 sm:px-12 lg:px-16 py-12">
          <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-mono text-[#A69A8C]">
            <div className="flex items-center gap-3">
              <span className="font-valmist font-bold text-[#E8DCC8] uppercase tracking-wider">
                NoShitSherlock
              </span>
              <span>&bull;</span>
              <span>&copy; 1928–2026. ALL RIGHTS RESERVED.</span>
            </div>

            <div className="flex items-center gap-8">
              <Link
                href="/legal"
                onClick={() => soundEngine.playPaper()}
                className="hover:text-[#E8DCC8] transition-colors"
              >
                Terms & Privacy
              </Link>
              <a
                href="https://github.com/DevInfinix/noshitsherlock"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#E8DCC8] transition-colors"
              >
                GitHub Source
              </a>
              <Link
                href="/not-found"
                onClick={() => soundEngine.playPaper()}
                className="hover:text-[#A7192D] transition-colors"
              >
                Classified 404
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </SmoothScrollProvider>
  );
}
