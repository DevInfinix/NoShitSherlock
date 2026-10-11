"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  Brain,
  CheckCircle2,
  Pin,
  Shield,
  Sparkles,
  Star,
  Terminal,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CrimeSceneTape } from "@/components/landing/CrimeSceneTape";
import { FloatingDetectiveScene } from "@/components/landing/FloatingDetectiveScene";
import { NoirCloudSeparator } from "@/components/landing/NoirCloudSeparator";
import { SmoothScrollProvider } from "@/components/landing/SmoothScrollProvider";
import { VerticalInvestigateTimeline } from "@/components/landing/VerticalInvestigateTimeline";
import { BorderBeam } from "@/components/ui/border-beam";
import { NoirButton } from "@/components/ui/noir-button";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { SpotlightCursor } from "@/components/ui/spotlight-cursor";

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

  // Mouse coordinates for dynamic spotlight that follows the cursor
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Active right-side card tab: 0 = About, 1 = Free to Play & Ranks, 2 = Open Source
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);

  // Scroll progress for vertical timeline (0 to 1)
  const [scrollProgress, setScrollProgress] = useState(0);

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

      // Zoom and upwardly offset the frame to permanently crop out bottom watermarks
      const watermarkCropZoom = 1.16;
      drawW *= watermarkCropZoom;
      drawH *= watermarkCropZoom;
      offsetX = (w - drawW) / 2;
      offsetY = (h - drawH) / 2 - h * 0.05;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    };

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new window.Image();
      const numStr = String(i).padStart(3, "0");
      img.src = `/landing/frames/frame-${numStr}.webp`;

      img.onload = () => {
        if (!active) return;
        loaded++;
        setLoadCount(loaded);
        if (loaded === 1) {
          drawFrame(0);
        }
        if (loaded >= Math.min(30, TOTAL_FRAMES)) {
          setIsLoaded(true);
        }
      };

      images.push(img);
    }

    imagesRef.current = images;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
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

  // Track mouse coordinates for dynamic spotlight background
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, []);

  // GSAP ScrollTrigger Sequence across an extended 400vh track for deliberate, tactile scroll
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

        // Apply intrinsic zoom and upward offset to crop any bottom watermark
        const watermarkCropZoom = 1.16;
        drawW *= watermarkCropZoom;
        drawH *= watermarkCropZoom;
        offsetX = (w - drawW) / 2;
        offsetY = (h - drawH) / 2 - h * 0.05;

        ctx2d.clearRect(0, 0, w, h);
        ctx2d.drawImage(img, offsetX, offsetY, drawW, drawH);
      };

      const frameObj = { frame: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroTrackRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.0,
          onUpdate: (self) => {
            const target = Math.min(TOTAL_FRAMES - 1, Math.floor(frameObj.frame));
            currentFrameRef.current = target;
            drawFrame(target);

            // Synchronize active card tab based on scroll progress
            const p = self.progress;
            setScrollProgress(p);
            if (p < 0.33) {
              setActiveTab(0);
            } else if (p < 0.66) {
              setActiveTab(1);
            } else {
              setActiveTab(2);
            }
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

      // Detective silhouette: Starts zoomed at 1.28 and slightly right (+6vw on desktop), smoothly centers and remains zoomed to crop watermarks
      if (canvasWrapRef.current) {
        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
        tl.fromTo(
          canvasWrapRef.current,
          { scale: isDesktop ? 1.28 : 1.15, x: isDesktop ? "6vw" : "0vw" },
          { scale: isDesktop ? 1.14 : 1.05, x: "0vw", ease: "power2.out", duration: 0.8 },
          0,
        );
      }

      // Title: Starts very large, subtly reduces size by only ~15% on scroll (remains commanding and prominent)
      if (titleRef.current) {
        const isDesktop = typeof window !== "undefined" && window.innerWidth >= 1024;
        tl.fromTo(
          titleRef.current,
          { scale: 1.0, y: "0vh", x: "0vw", transformOrigin: "top left" },
          {
            scale: isDesktop ? 0.85 : 0.92,
            y: isDesktop ? "-4vh" : "0vh",
            x: "0vw",
            ease: "power1.inOut",
            duration: 0.7,
          },
          0,
        );
      }
    }, heroTrackRef);

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScrollProvider>
      <div className="relative min-h-screen w-full bg-[#100D0D] text-[#E8DCC8] selection:bg-[#A7192D] selection:text-[#E8DCC8]">
        {/* Cinematic Ambient Spotlight Cursor (Hides default OS cursor, shines flashlight cone) */}
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

        {/* =========================================================================
            NAVBAR: HIGH-CONTRAST, MINIMAL GLASS, "STAR ON GITHUB" & DISCREET CREDITS
           ========================================================================= */}
        <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between bg-[#100D0D]/60 backdrop-blur-md border-b border-[#79604A]/25 px-6 sm:px-12 py-4 pointer-events-auto shadow-md">
          {/* Left Branding: Favicon Logo + noshitsherlock + The Sam Studios credit */}
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-3 select-none">
              <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden border border-[#79604A]/80 bg-[#181414] p-1 shadow-md transition-all duration-300 group-hover:border-[#A7192D] group-hover:shadow-[0_0_12px_rgba(167,25,45,0.5)]">
                <Image
                  src="/favicon-32x32.png"
                  alt="NoShitSherlock Favicon"
                  width={24}
                  height={24}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
              <span className="font-gothica text-base sm:text-lg font-normal tracking-[0.2em] lowercase text-[#E8DCC8] transition-colors group-hover:text-[#A7192D]">
                noshitsherlock
              </span>
            </Link>

            {/* Discreet The Sam Studios Promotion */}
            <a
              href="https://thesamstudios.in"
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 border border-[#79604A]/50 bg-[#181414]/80 rounded-full font-mono text-[10px] uppercase tracking-wider text-[#E8DCC8] hover:text-white hover:border-[#A7192D] transition-all shadow-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#A7192D] animate-pulse" />
              <span>by The Sam Studios</span>
            </a>
          </div>

          {/* Right Action Controls: Star on GitHub, Login & Sign Up buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Prominent "STAR ON GITHUB" Button */}
            <a
              href="https://github.com/DevInfinix/NoShitSherlock"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-[#79604A]/70 bg-[#181414]/90 hover:border-[#E8DCC8] hover:text-[#E8DCC8] font-mono text-xs uppercase tracking-wider text-[#E8DCC8] transition-all shadow-md active:scale-95 group"
            >
              <svg
                className="w-4 h-4 fill-current text-[#E8DCC8] group-hover:text-[#A7192D] transition-colors"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span className="font-semibold text-[11px] sm:text-xs">STAR ON GITHUB</span>
              <Star className="w-3.5 h-3.5 text-[#A7192D] fill-[#A7192D]" />
            </a>

            {user ? (
              <NoirButton href="/cases" variant="primary" size="sm" withBeam>
                <span className="h-2 w-2 rounded-full bg-[#A7192D] animate-pulse" />
                <span>AGENT [{user.agentTag || user.name.slice(0, 3).toUpperCase()}]</span>
              </NoirButton>
            ) : (
              <>
                <NoirButton href="/login" variant="outline" size="sm">
                  Login as Detective
                </NoirButton>
                <NoirButton href="/signup" variant="primary" size="sm" withBeam>
                  Sign up as Detective
                </NoirButton>
              </>
            )}
          </div>
        </header>

        {/* =========================================================================
            SECTION 1: HERO VIEWPORT & SCROLL-DRIVEN DETECTIVE SEQUENCE (400vh TRACK)
           ========================================================================= */}
        <div ref={heroTrackRef} className="relative h-[400vh] w-full">
          <div className="sticky top-0 h-screen min-h-[100dvh] w-full overflow-hidden flex flex-col justify-between lg:flex-row lg:items-center px-4 sm:px-8 lg:px-16 pt-20 pb-6 lg:py-0">
            {/* Loading Overlay */}
            {!isLoaded && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#100D0D]">
                <span className="font-valmist font-bold text-sm tracking-[0.25em] uppercase text-[#79604A] animate-pulse">
                  LOADING CRIME SCENE EVIDENCE... {Math.round((loadCount / TOTAL_FRAMES) * 100)}%
                </span>
                <div className="mt-4 h-[2px] w-48 bg-[#181414]">
                  <div
                    className="h-full bg-[#A7192D] transition-all duration-200"
                    style={{ width: `${(loadCount / TOTAL_FRAMES) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* DYNAMIC CURSOR-FOLLOWING SPOTLIGHT ILLUMINATION */}
            <div
              className="pointer-events-none absolute inset-0 z-0 transition-all duration-75 ease-out"
              style={{
                background: `radial-gradient(circle 650px at ${mousePos.x}% ${mousePos.y}%, rgba(167, 25, 45, 0.35) 0%, rgba(38, 13, 16, 0.65) 45%, rgba(16, 13, 13, 0) 75%)`,
              }}
            />

            {/* Secondary Deep Burgundy Bottom Wash */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-48 z-0 opacity-70"
              style={{
                background: "linear-gradient(to top, #260D10 0%, transparent 100%)",
              }}
            />

            {/* Central Detective Canvas Container with Watermark Crop */}
            <div
              ref={canvasWrapRef}
              className="absolute inset-0 z-10 h-full w-full pointer-events-none flex items-center justify-center overflow-hidden"
            >
              <canvas
                ref={canvasRef}
                className="h-full w-full object-cover transition-opacity duration-500"
                style={{ opacity: isLoaded ? 1 : 0 }}
              />
            </div>

            {/* LEFT ZONE: ENHANCED "NO SHIT SHERLOCK" BOLD BRANDING (RESPONSIVE ON MOBILE) */}
            <div
              ref={titleRef}
              className="relative z-20 w-full max-w-full lg:max-w-xl xl:max-w-2xl select-none"
            >
              <div className="flex flex-col relative">
                {/* Background chromatic crimson echo for depth */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 translate-x-1 translate-y-1 opacity-20 pointer-events-none select-none"
                >
                  <span className="font-valmist font-extrabold text-[clamp(3.2rem,11.5vw,4.6rem)] sm:text-[clamp(4.2rem,12vw,5.5rem)] lg:text-[clamp(6.8rem,15vw,17rem)] uppercase leading-[0.74] text-[#A7192D] block">
                    NO
                  </span>
                  <span className="font-valmist font-extrabold text-[clamp(3.2rem,11.5vw,4.6rem)] sm:text-[clamp(4.2rem,12vw,5.5rem)] lg:text-[clamp(6.8rem,15vw,17rem)] uppercase leading-[0.74] text-[#A7192D] block">
                    SHIT
                  </span>
                  <span className="font-charlea font-extrabold italic text-[clamp(3.8rem,13.5vw,5.4rem)] sm:text-[clamp(4.8rem,14vw,6.5rem)] lg:text-[clamp(7.8rem,17vw,19.5rem)] leading-[0.78] text-[#A7192D] block">
                    Sherlock
                  </span>
                </div>

                {/* Primary Forefront Title */}
                <span className="font-valmist font-extrabold text-[clamp(3.2rem,11.5vw,4.6rem)] sm:text-[clamp(4.2rem,12vw,5.5rem)] lg:text-[clamp(6.8rem,15vw,17rem)] uppercase leading-[0.74] tracking-tight text-[#E8DCC8] drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)]">
                  NO
                </span>
                <span className="font-valmist font-extrabold text-[clamp(3.2rem,11.5vw,4.6rem)] sm:text-[clamp(4.2rem,12vw,5.5rem)] lg:text-[clamp(6.8rem,15vw,17rem)] uppercase leading-[0.74] tracking-tight text-[#E8DCC8] drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)]">
                  SHIT
                </span>
                <span className="font-charlea font-extrabold italic text-[clamp(3.8rem,13.5vw,5.4rem)] sm:text-[clamp(4.8rem,14vw,6.5rem)] lg:text-[clamp(7.8rem,17vw,19.5rem)] leading-[0.78] tracking-[-0.04em] text-[#A7192D] drop-shadow-[0_4px_36px_rgba(167,25,45,0.7)]">
                  Sherlock
                </span>

                {/* Vintage Sub-label */}
                <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#A69A8C] mt-1.5 block pl-0.5">
                  NOIR DETECTIVE WEB GAME
                </span>
              </div>
            </div>

            {/* RIGHT ZONE: UNBOXED, DYNAMIC EDITORIAL DOSSIER WITH PROGRESSIVE BLUR & TIMELINE */}
            <div className="relative z-20 w-full max-w-full lg:max-w-xl lg:ml-auto flex items-stretch gap-4 sm:gap-6">
              {/* Vertical Investigation Timeline Meter (Desktop only) */}
              <VerticalInvestigateTimeline
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                scrollProgress={scrollProgress}
              />

              {/* Dynamic Content Area with Smooth Progressive Blur Background (No harsh boxes) */}
              <div className="relative flex-1 flex flex-col justify-between py-2 min-h-[350px] sm:min-h-[400px]">
                {/* Smooth Progressive Blur & Atmospheric Charcoal Fade (No harsh boundaries or visible boxes) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-4 sm:-inset-6 -inset-y-6 sm:-inset-y-8 rounded-3xl bg-gradient-to-t lg:bg-gradient-to-l from-[#100D0D]/95 via-[#100D0D]/85 to-transparent backdrop-blur-[12px] z-0"
                />
                <ProgressiveBlur
                  direction="left"
                  className="hidden lg:block w-28 -left-14 inset-y-0"
                  layers={6}
                />

                {/* Tactile Tab Pills */}
                <div className="relative z-10 flex items-center gap-2 mb-4 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setActiveTab(0)}
                    className={`px-3 py-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 0
                        ? "border-b-2 border-[#A7192D] text-[#E8DCC8] font-bold"
                        : "border-b-2 border-transparent text-[#79604A] hover:text-[#E8DCC8]"
                    }`}
                  >
                    [01 ABOUT]
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab(1)}
                    className={`px-3 py-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 1
                        ? "border-b-2 border-[#A7192D] text-[#E8DCC8] font-bold"
                        : "border-b-2 border-transparent text-[#79604A] hover:text-[#E8DCC8]"
                    }`}
                  >
                    [02 CASES & RANKS]
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab(2)}
                    className={`px-3 py-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 2
                        ? "border-b-2 border-[#A7192D] text-[#E8DCC8] font-bold"
                        : "border-b-2 border-transparent text-[#79604A] hover:text-[#E8DCC8]"
                    }`}
                  >
                    [03 GITHUB]
                  </button>
                </div>

                {/* Animated Smooth Card Content */}
                <div className="relative z-10 flex-1 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {activeTab === 0 && (
                      <motion.div
                        key="tab-0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        <div className="space-y-1.5">
                          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#A7192D] block">
                            ABOUT THE NOIR GAME: DETECTIVE GAME
                          </span>
                          <h2 className="font-valmist font-bold text-3xl sm:text-4xl uppercase leading-tight text-[#E8DCC8]">
                            An Interactive Mystery Game
                          </h2>
                        </div>

                        <p className="font-selnora text-base leading-relaxed text-[#A69A8C]">
                          NoShitSherlock is a dark detective mystery game you can play directly in
                          your browser. Read suspect testimonies, listen to wiretaps, solve puzzles,
                          and piece together evidence to crack the crime.
                        </p>

                        {/* Dynamic Live Evidence Snippet */}
                        <div className="border border-[#79604A]/40 bg-[#181414]/70 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 font-mono text-xs text-[#E8DCC8]">
                            <Terminal className="w-3.5 h-3.5 text-[#A7192D]" />
                            <span>CASE 01: THE MISSING LEDGER</span>
                          </div>
                          <span className="font-mono text-[10px] text-[#A7192D] uppercase font-bold">
                            UNSOLVED
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <NoirButton href="/signup" variant="primary" size="md" withBeam>
                            Sign up as Detective
                          </NoirButton>
                          <NoirButton href="/login" variant="outline" size="md">
                            Login as Detective
                          </NoirButton>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 1 && (
                      <motion.div
                        key="tab-1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        <div className="space-y-1.5">
                          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#E8DCC8] block">
                            FREE TO PLAY {"//"} DETECTIVE LEADERBOARDS
                          </span>
                          <h2 className="font-valmist font-bold text-3xl sm:text-4xl uppercase leading-tight text-[#E8DCC8]">
                            Free to play. Many cases, plus leaderboards.
                          </h2>
                        </div>

                        <p className="font-selnora text-base leading-relaxed text-[#A69A8C]">
                          Play for free across multiple episodic cases. Work solo or invite a
                          friend. Once you crack all 5 puzzle sections, arrange the clues on a cork
                          pinboard with red yarn. Compete for the highest deduction score and
                          fastest solve time.
                        </p>

                        {/* Dynamic Live Stats Strip */}
                        <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-center">
                          <div className="border border-[#79604A]/40 bg-[#181414]/70 p-2 text-[#E8DCC8]">
                            <span className="text-[#A7192D] font-bold block text-sm">100%</span>
                            FREE TO PLAY
                          </div>
                          <div className="border border-[#79604A]/40 bg-[#181414]/70 p-2 text-[#E8DCC8]">
                            <span className="text-[#E8DCC8] font-bold block text-sm">5</span>
                            PUZZLE SECTIONS
                          </div>
                          <div className="border border-[#79604A]/40 bg-[#181414]/70 p-2 text-[#A7192D]">
                            <span className="text-[#C52A3B] font-bold block text-sm">LIVE</span>
                            LEADERBOARD
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <NoirButton href="/cases" variant="primary" size="md" withBeam>
                            Browse All Cases
                          </NoirButton>
                          <NoirButton href="/signup" variant="outline" size="md">
                            Sign up as Detective
                          </NoirButton>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 2 && (
                      <motion.div
                        key="tab-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        <div className="space-y-1.5">
                          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#A7192D] block">
                            OPEN SOURCE {"//"} GITHUB REPOSITORY
                          </span>
                          <h2 className="font-valmist font-bold text-3xl sm:text-4xl uppercase leading-tight text-[#E8DCC8]">
                            Open source & available on GitHub
                          </h2>
                        </div>

                        <p className="font-selnora text-base leading-relaxed text-[#A69A8C]">
                          NoShitSherlock is completely open source under Apache 2.0. Play the game,
                          explore how the puzzles were made, or author your own custom cases. If you
                          enjoy the game, drop a star on GitHub!
                        </p>

                        {/* Open Source Spec Badge */}
                        <div className="border border-[#79604A]/40 bg-[#181414]/70 p-3 flex items-center justify-between font-mono text-xs text-[#E8DCC8]">
                          <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-[#A7192D]" />
                            <span>APACHE 2.0 LICENSE</span>
                          </div>
                          <span className="text-[#A69A8C]">NEXT.JS 16 &bull; THREE.JS</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-2">
                          <a
                            href="https://github.com/DevInfinix/NoShitSherlock"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#A7192D] bg-[#260D10] text-[#E8DCC8] hover:border-[#E8DCC8] font-mono text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 group"
                          >
                            <svg
                              className="w-4 h-4 fill-current text-[#E8DCC8] group-hover:text-[#A7192D] transition-colors"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                              />
                            </svg>
                            <span>STAR ON GITHUB</span>
                            <Star className="w-3.5 h-3.5 text-[#A7192D] fill-[#A7192D]" />
                          </a>
                          <NoirButton href="/cases" variant="outline" size="md">
                            Play First Case
                          </NoirButton>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            DYNAMIC THREE.JS HORIZONTAL CLOUD/SMOKE SEPARATOR (FLAWLESS TRANSITION)
           ========================================================================= */}
        <NoirCloudSeparator />

        {/* =========================================================================
            POLICE EVIDENCE BARRIER TAPE TICKER (INSPIRED BY 404 CRIME SCENE)
           ========================================================================= */}
        <div className="relative z-30 my-6">
          <CrimeSceneTape rotate="-rotate-1" />
        </div>

        {/* =========================================================================
            LOWER SECTIONS WRAPPER WITH 3D FLOATING DETECTIVE SCENE BACKGROUND
           ========================================================================= */}
        <div className="relative w-full overflow-hidden">
          {/* Ambient 3D Three.js Floating Case Folders, Papers, Dust Motes & Desk Lamp */}
          <FloatingDetectiveScene />

          {/* =========================================================================
              SECTION 2: HOW THE INVESTIGATION WORKS (PLAIN ENGLISH, ENGAGING & CLEAR)
             ========================================================================= */}
          <section className="relative z-10 px-6 sm:px-12 lg:px-16 py-28 bg-[#100D0D]/75 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl space-y-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#79604A]/30 pb-8">
                <div className="space-y-3">
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#A7192D]">
                    HOW IT WORKS {"//"} 3 STEPS TO CRACK THE CASE
                  </span>
                  <h2 className="font-valmist font-bold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#E8DCC8]">
                    From Crime Scene to Evidence Board
                  </h2>
                </div>
                <p className="font-selnora text-sm sm:text-base text-[#A69A8C] max-w-md leading-relaxed">
                  Step into the detective&apos;s shoes. Read the case file, decipher physical and
                  recorded clues, and prove how the crime took place.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <SpotlightCard className="p-8 space-y-4 bg-[#181414]/90 backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-[#79604A]/30 pb-3">
                    <span className="font-valmist font-bold text-2xl text-[#A7192D]">01</span>
                    <Brain className="w-5 h-5 text-[#A7192D]" />
                  </div>
                  <h3 className="font-valmist font-bold text-2xl uppercase tracking-tight text-[#E8DCC8]">
                    Open The Case File
                  </h3>
                  <p className="font-selnora text-sm sm:text-base text-[#A69A8C] leading-relaxed">
                    Every case begins with an incident report. Inspect crime scene photos, examine
                    coroner findings, and read witness statements to understand what happened.
                  </p>
                  <div className="pt-2 font-mono text-xs text-[#79604A]">
                    {"//"} EXAMINE EVIDENCE
                  </div>
                </SpotlightCard>

                {/* Step 2 */}
                <SpotlightCard className="p-8 space-y-4 bg-[#181414]/90 backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-[#79604A]/30 pb-3">
                    <span className="font-valmist font-bold text-2xl text-[#C52A3B]">02</span>
                    <Sparkles className="w-5 h-5 text-[#C52A3B]" />
                  </div>
                  <h3 className="font-valmist font-bold text-2xl uppercase tracking-tight text-[#E8DCC8]">
                    Solve 5 Puzzle Sections
                  </h3>
                  <p className="font-selnora text-sm sm:text-base text-[#A69A8C] leading-relaxed">
                    Decipher coded letters, listen to wiretap audio transcripts, fill in ledger
                    blanks, and answer interrogation questions. Each answer unlocks unredacted
                    evidence.
                  </p>
                  <div className="pt-2 font-mono text-xs text-[#79604A]">
                    {"//"} UNLOCK NOTEBOOK CLUES
                  </div>
                </SpotlightCard>

                {/* Step 3 */}
                <SpotlightCard className="p-8 space-y-4 bg-[#181414]/90 backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-[#79604A]/30 pb-3">
                    <span className="font-valmist font-bold text-2xl text-[#A7192D]">03</span>
                    <Pin className="w-5 h-5 text-[#A7192D]" />
                  </div>
                  <h3 className="font-valmist font-bold text-2xl uppercase tracking-tight text-[#E8DCC8]">
                    String The Red Yarn
                  </h3>
                  <p className="font-selnora text-sm sm:text-base text-[#A69A8C] leading-relaxed">
                    When you reach the finale, the case file turns into an evidence corkboard. Drag
                    the clues in chronological order to connect them with red yarn and solve the
                    case.
                  </p>
                  <div className="pt-2 font-mono text-xs text-[#79604A]">
                    {"//"} FINAL CHRONOLOGICAL PROOF
                  </div>
                </SpotlightCard>
              </div>
            </div>
          </section>

          {/* =========================================================================
              SECTION 3: PLAY SOLO OR WITH FRIENDS (MULTIPLAYER CO-OP)
             ========================================================================= */}
          <section className="relative z-10 px-6 sm:px-12 lg:px-16 py-28 border-t border-[#79604A]/30 bg-gradient-to-b from-[#100D0D]/80 via-[#181414]/90 to-[#100D0D]/80 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#A7192D]">
                  SOLO OR CO-OP MULTIPLAYER
                </span>
                <h2 className="font-valmist font-bold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#E8DCC8]">
                  Team Up or Investigate Alone
                </h2>
                <p className="font-selnora text-base sm:text-lg leading-relaxed text-[#A69A8C]">
                  Whether you prefer solving mysteries independently late at night or teaming up
                  with friends on Discord, NoShitSherlock makes multiplayer seamless.
                </p>

                <div className="space-y-3 font-mono text-xs text-[#E8DCC8]/90">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#A7192D]" />
                    <span>Simple 8-character squad invite code to join friends instantly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#A7192D]" />
                    <span>
                      Live progress updates: clues unlocked by one friend appear on all screens
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#A7192D]" />
                    <span>
                      See who solved each puzzle in your squad debrief at the end of the case
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-4">
                  <NoirButton
                    href={user ? "/cases" : "/signup"}
                    variant="primary"
                    size="md"
                    withBeam
                  >
                    Start Detective Case
                  </NoirButton>
                  <NoirButton href="/cases" variant="outline" size="md">
                    View Case Files
                  </NoirButton>
                </div>
              </div>

              {/* Interactive Co-op Squad Card Mockup */}
              <div className="relative border-2 border-[#79604A] bg-[#181414]/95 p-8 sm:p-10 shadow-2xl space-y-6 backdrop-blur-md">
                <BorderBeam
                  size={180}
                  duration={10}
                  borderWidth={1.5}
                  colorFrom="#A7192D"
                  colorTo="#E8DCC8"
                />
                <div className="flex items-center justify-between border-b border-[#79604A]/30 pb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#A7192D]" />
                    <span className="font-mono text-xs uppercase tracking-wider text-[#E8DCC8]">
                      CO-OP SQUAD LOBBY
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#A7192D] bg-[#260D10] px-2 py-0.5 border border-[#A7192D]/40">
                    CODE: 8K7N2P9Q
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between border border-[#79604A]/40 bg-[#100D0D] p-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-valmist text-sm font-bold text-[#E8DCC8]">
                        Detective Miller (You)
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#A69A8C]">
                      SOLVED SECTION 1 & 2
                    </span>
                  </div>

                  <div className="flex items-center justify-between border border-[#79604A]/40 bg-[#100D0D] p-3">
                    <div className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="font-valmist text-sm font-bold text-[#E8DCC8]">
                        Detective Vance
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#A69A8C]">
                      DECIPHERING SECTION 3
                    </span>
                  </div>

                  <div className="flex items-center justify-between border border-dashed border-[#79604A]/40 bg-[#100D0D]/50 p-3">
                    <span className="font-mono text-xs text-[#79604A]">[EMPTY SQUAD SLOT]</span>
                    <span className="font-mono text-[10px] text-[#79604A]">SHARE CODE TO JOIN</span>
                  </div>
                </div>

                <div className="border-t border-[#79604A]/30 pt-3 flex items-center justify-between font-mono text-[11px] text-[#A69A8C]">
                  <span>CASE: THE MISSING LEDGER</span>
                  <span className="text-[#E8DCC8]">PROGRESS: 3 / 5 CLUES</span>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              SECTION 4: THE CHRONOLOGICAL RED-YARN PINBOARD FINALE
             ========================================================================= */}
          <section className="relative z-10 px-6 sm:px-12 lg:px-16 py-28 border-t border-[#79604A]/30 bg-[#100D0D]/80 backdrop-blur-sm">
            <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Visual Cork Pinboard Representation */}
              <div className="relative border-2 border-[#79604A] bg-[#181414]/95 p-8 sm:p-12 shadow-2xl space-y-6 backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-[#79604A]/30 pb-4">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#A7192D]">
                    CORK PINBOARD {"//"} TIMELINE ENGINE
                  </span>
                  <span className="font-mono text-xs text-[#A69A8C]">[5 EVIDENCE ITEMS]</span>
                </div>

                {/* Simulated Clue Cards with Red Yarn Connecting Line */}
                <div className="relative space-y-4 py-2">
                  <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-[#A7192D]/70" />

                  <div className="relative flex items-start gap-4 pl-10">
                    <span className="absolute left-4 top-2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[#A7192D] bg-[#100D0D]" />
                    <div className="border border-[#79604A]/40 bg-[#100D0D]/90 p-4 w-full">
                      <span className="font-mono text-[10px] text-[#A7192D] block">01:45 AM</span>
                      <h5 className="font-valmist text-sm font-bold uppercase text-[#E8DCC8]">
                        Intercepted Telegram from Post Office Wire
                      </h5>
                    </div>
                  </div>

                  <div className="relative flex items-start gap-4 pl-10">
                    <span className="absolute left-4 top-2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[#A7192D] bg-[#100D0D]" />
                    <div className="border border-[#79604A]/40 bg-[#100D0D]/90 p-4 w-full">
                      <span className="font-mono text-[10px] text-[#A7192D] block">02:15 AM</span>
                      <h5 className="font-valmist text-sm font-bold uppercase text-[#E8DCC8]">
                        Night Watchman Discovers Harold Finch
                      </h5>
                    </div>
                  </div>

                  <div className="relative flex items-start gap-4 pl-10">
                    <span className="absolute left-4 top-2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[#A7192D] bg-[#100D0D]" />
                    <div className="border border-[#79604A]/40 bg-[#100D0D]/90 p-4 w-full">
                      <span className="font-mono text-[10px] text-[#A7192D] block">03:30 AM</span>
                      <h5 className="font-valmist text-sm font-bold uppercase text-[#E8DCC8]">
                        Forged Transfer Authorization Document
                      </h5>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#79604A]/30 pt-4">
                  <span className="font-mono text-xs uppercase text-[#A69A8C]">
                    DRAG & DROP TIMELINE VERIFICATION
                  </span>
                  <span className="font-mono text-xs text-[#C52A3B] animate-pulse">
                    STRICT SEQUENCE
                  </span>
                </div>
              </div>

              {/* Explanation & Mechanics */}
              <div className="space-y-6 text-left">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#A7192D]">
                  THE INVESTIGATION FINALE
                </span>
                <h2 className="font-valmist font-bold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-[#E8DCC8]">
                  Reconstruct The Crime Timeline
                </h2>
                <p className="font-selnora text-base sm:text-lg leading-relaxed text-[#A69A8C]">
                  Once you finish solving Section 5, your case closes and morphs into a physical
                  cork pinboard. Drag and position your unlocked evidence cards in the exact order
                  events occurred.
                </p>
                <p className="font-garamond text-lg italic text-[#E8DCC8] border-l-2 border-[#A7192D] pl-4 py-1">
                  A single displaced event breaks the chain of custody. Solve the true sequence to
                  lock in your final score and take your spot on the leaderboard.
                </p>
                <div className="pt-2">
                  <NoirButton
                    href={user ? "/cases" : "/signup"}
                    variant="primary"
                    size="md"
                    withBeam
                  >
                    Start Investigation
                  </NoirButton>
                </div>
              </div>
            </div>
          </section>

          {/* =========================================================================
              SECTION 5: READY TO PLAY CALL TO ACTION
             ========================================================================= */}
          <section className="relative z-10 px-6 sm:px-12 lg:px-16 py-28 border-t border-[#79604A]/30 bg-gradient-to-b from-[#100D0D]/80 via-[#260D10]/70 to-[#100D0D]/90 backdrop-blur-sm">
            <div className="mx-auto max-w-4xl border-2 border-[#79604A] bg-[#181414]/95 p-8 sm:p-14 text-center space-y-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <BorderBeam
                size={200}
                duration={10}
                borderWidth={1.5}
                colorFrom="#A7192D"
                colorTo="#E8DCC8"
              />

              <div className="space-y-4">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#A7192D]">
                  CASE 01 AVAILABLE NOW
                </span>
                <h2 className="font-valmist font-bold text-3xl sm:text-4xl lg:text-5xl uppercase text-[#E8DCC8]">
                  Open Case 01: The Missing Ledger
                </h2>
                <p className="font-selnora text-base sm:text-lg text-[#A69A8C] max-w-xl mx-auto leading-relaxed">
                  An embezzlement audit turns into a homicide investigation at the Blackwood
                  Exchange. Play solo or invite a friend. Completely free to play.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <NoirButton href={user ? "/cases" : "/signup"} variant="primary" size="lg" withBeam>
                  {user ? "Access Case Files" : "Sign up as Detective"}
                </NoirButton>
                <NoirButton href="/cases" variant="outline" size="lg">
                  Explore Active Cases
                </NoirButton>
              </div>
            </div>
          </section>
        </div>

        {/* =========================================================================
            SECTION 6: MINIMALIST NOIR FOOTER WITH PROMINENT THE SAM STUDIOS PROMOTION
           ========================================================================= */}
        <footer className="relative z-30 border-t border-[#79604A]/30 bg-[#100D0D] px-6 sm:px-12 lg:px-16 py-14">
          <div className="mx-auto max-w-6xl space-y-10">
            {/* The Sam Studios Feature Redirect Card */}
            <div className="border border-[#79604A]/40 bg-[#181414] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#A7192D] block">
                  STUDIO ARCHIVE
                </span>
                <h4 className="font-valmist font-bold text-lg sm:text-xl text-[#E8DCC8] uppercase">
                  A Production by The Sam Studios
                </h4>
                <p className="font-selnora text-xs sm:text-sm text-[#A69A8C] max-w-md">
                  Crafted with passion for interactive web design, game engineering, and cinematic
                  storytelling.{" "}
                  <a
                    href="https://github.com/DevInfinix/NoShitSherlock/graphs/contributors"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#E8DCC8] hover:text-[#A7192D] underline underline-offset-2 transition-colors ml-1 font-mono text-[11px]"
                  >
                    View contributors on GitHub &rarr;
                  </a>
                </p>
              </div>
              <a
                href="https://thesamstudios.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#79604A]/70 bg-[#260D10]/80 text-[#E8DCC8] hover:border-[#E8DCC8] hover:bg-[#260D10] font-mono text-xs uppercase tracking-wider transition-all shadow-md group shrink-0"
              >
                <span>Visit The Sam Studios</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#A7192D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            {/* Bottom Row Links & Copyright */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2 border-t border-[#79604A]/20">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative h-6 w-6 overflow-hidden border border-[#79604A]/60 bg-[#181414] p-0.5">
                  <Image
                    src="/favicon-32x32.png"
                    alt="NoShitSherlock Logo"
                    width={20}
                    height={20}
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="font-gothica text-sm tracking-[0.15em] lowercase text-[#E8DCC8]">
                  noshitsherlock
                </span>
                <span className="font-mono text-[10px] text-[#79604A] pl-2 border-l border-[#79604A]/40">
                  APACHE 2.0
                </span>
              </div>

              <nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-wider text-[#A69A8C]">
                <Link href="/cases" className="hover:text-[#E8DCC8] transition-colors">
                  Cases
                </Link>
                <Link href="/login" className="hover:text-[#E8DCC8] transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="hover:text-[#E8DCC8] transition-colors">
                  Sign Up
                </Link>
                <Link href="/legal" className="hover:text-[#E8DCC8] transition-colors">
                  Legal
                </Link>
                <a
                  href="https://github.com/DevInfinix/NoShitSherlock"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#E8DCC8] transition-colors flex items-center gap-1.5"
                >
                  <span>GitHub</span>
                  <Star className="w-3 h-3 text-[#A7192D] fill-[#A7192D]" />
                </a>
              </nav>
            </div>
          </div>
        </footer>
      </div>
    </SmoothScrollProvider>
  );
}
