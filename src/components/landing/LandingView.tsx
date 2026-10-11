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
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const beat1Ref = useRef<HTMLDivElement>(null);
  const beat2Ref = useRef<HTMLDivElement>(null);
  const beat3Ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadCount, setLoadCount] = useState(0);

  // Preload 150 frames
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

  // Choreographed GSAP timeline
  useEffect(() => {
    if (!trackRef.current) return;

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

      // Master scroll timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trackRef.current,
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

      // Frame scrubbing across whole track (0 -> 149)
      tl.to(
        frameObj,
        {
          frame: TOTAL_FRAMES - 1,
          ease: "none",
          duration: 1,
        },
        0,
      );

      // Detective scale and position:
      // Starts enlarged (1.20) and shifted to the right (+8vw).
      // Smoothly returns to center (0vw) and normal scale (1.0).
      if (canvasWrapRef.current) {
        tl.fromTo(
          canvasWrapRef.current,
          {
            scale: 1.2,
            x: "8vw",
          },
          {
            scale: 1.0,
            x: "0vw",
            ease: "power2.out",
            duration: 0.5,
          },
          0,
        );
      }

      // Title transformation:
      // Starts massive in the center-left.
      // Shrinks to compact brand mark and docks top-left.
      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          {
            scale: 1.0,
            y: "0vh",
            x: "0vw",
            transformOrigin: "top left",
          },
          {
            scale: 0.44,
            y: "-26vh",
            x: "-1vw",
            ease: "power2.inOut",
            duration: 0.42,
          },
          0,
        );
      }

      // Crimson atmospheric backlight expands slightly as magnifying glass approaches
      if (glowRef.current) {
        tl.fromTo(
          glowRef.current,
          { opacity: 0.35, scale: 0.9 },
          { opacity: 0.7, scale: 1.2, ease: "power1.inOut", duration: 1 },
          0,
        );
      }

      // Narrative Beat 1: Initial premise (visible at start, fades out by 0.32)
      if (beat1Ref.current) {
        tl.fromTo(
          beat1Ref.current,
          { opacity: 1, y: 0, pointerEvents: "auto" },
          { opacity: 0, y: -30, pointerEvents: "none", ease: "power1.in", duration: 0.15 },
          0.18,
        );
      }

      // Narrative Beat 2: Core Loop (fades in at 0.36, fades out at 0.68)
      if (beat2Ref.current) {
        tl.fromTo(
          beat2Ref.current,
          { opacity: 0, y: 35, pointerEvents: "none" },
          { opacity: 1, y: 0, pointerEvents: "auto", ease: "power2.out", duration: 0.12 },
          0.35,
        );
        tl.to(
          beat2Ref.current,
          { opacity: 0, y: -30, pointerEvents: "none", ease: "power1.in", duration: 0.12 },
          0.64,
        );
      }

      // Narrative Beat 3: Enlistment & Action (fades in at 0.72, solid till end)
      if (beat3Ref.current) {
        tl.fromTo(
          beat3Ref.current,
          { opacity: 0, y: 35, pointerEvents: "none" },
          { opacity: 1, y: 0, pointerEvents: "auto", ease: "power2.out", duration: 0.15 },
          0.72,
        );
      }
    }, trackRef);

    return () => ctx.revert();
  }, []);

  return (
    <SmoothScrollProvider>
      <div className="relative min-h-screen w-full bg-[#090807] text-[#E7DDC8] selection:bg-[#A92A28] selection:text-[#E7DDC8] cursor-none overflow-x-hidden">
        {/* Refined Cinematic Spotlight Cursor */}
        <SpotlightCursor />

        {/* Global Noir Sound Controls */}
        <AudioControlHud />

        {/* Procedural Film Grain Overlay */}
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

        {/* Global Vignette and Darkness Gradients */}
        <div className="pointer-events-none fixed inset-0 z-20 bg-radial from-transparent via-[#090807]/30 to-[#090807]/90" />
        <div className="pointer-events-none fixed inset-0 z-20 bg-gradient-to-t from-[#090807] via-transparent to-[#090807]/80" />

        {/* Master Pinned Track (320vh total scrub length) */}
        <div ref={trackRef} className="relative h-[320vh] w-full">
          {/* Sticky 100vh Viewport Arena */}
          <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
            {/* Loading indicator for initial frame burst */}
            {!isLoaded && (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#090807]">
                <span className="font-valmist font-bold text-sm tracking-[0.25em] uppercase text-[#A9874A] animate-pulse">
                  PREPARING CASE DOSSIER... {Math.round((loadCount / TOTAL_FRAMES) * 100)}%
                </span>
                <div className="mt-4 h-[2px] w-48 bg-[#15110F]">
                  <div
                    className="h-full bg-[#A92A28] transition-all duration-200"
                    style={{ width: `${(loadCount / TOTAL_FRAMES) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Subtle Crimson Atmospheric Rim Lighting */}
            <div
              ref={glowRef}
              className="pointer-events-none absolute inset-0 z-0 opacity-40 transition-opacity"
              style={{
                background:
                  "radial-gradient(circle 620px at 58% 50%, rgba(100, 27, 27, 0.28) 0%, rgba(169, 42, 40, 0.08) 45%, transparent 75%)",
              }}
            />

            {/* Detective Canvas Container (controlled by GSAP scale and horizontal shift) */}
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

            {/* Persistent Top Hairline Bar */}
            <header className="fixed top-0 inset-x-0 z-30 flex items-center justify-between px-8 py-6 pointer-events-auto">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#B8AD98]/60">
                  CASE ARCHIVES {"//"} NO SHIT SHERLOCK
                </span>
              </div>

              <div className="flex items-center gap-6 mr-28 sm:mr-32">
                {user ? (
                  <Link
                    href="/cases"
                    onClick={() => soundEngine.playStamp()}
                    className="group flex items-center gap-2 border border-[#A9874A]/40 bg-[#15110F]/80 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-[#E7DDC8] backdrop-blur-md transition-all hover:border-[#A9874A] hover:bg-[#A9874A]/10"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#A92A28]" />
                    <span>AGENT [{user.agentTag || user.name.slice(0, 3).toUpperCase()}]</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-wider text-[#B8AD98]">
                    <Link
                      href="/login"
                      onClick={() => soundEngine.playPaper()}
                      className="hover:text-[#E7DDC8] transition-colors"
                    >
                      Log as detective
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => soundEngine.playStamp()}
                      className="border border-[#A9874A]/60 bg-[#A9874A]/10 px-3.5 py-1 text-[#E7DDC8] hover:border-[#A9874A] hover:bg-[#A9874A]/20 transition-all"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </header>

            {/* LEFT SIDE: OVERSIZED "NO SHIT SHERLOCK" TITLE TREATMENT */}
            <div
              ref={titleRef}
              className="absolute left-8 sm:left-12 lg:left-16 top-[28vh] z-20 max-w-xl pointer-events-none select-none"
            >
              <div className="flex flex-col">
                <span className="font-valmist font-extrabold text-[clamp(4.2rem,9.5vw,10.5rem)] uppercase leading-[0.82] tracking-tight text-[#E7DDC8]">
                  NO
                </span>
                <span className="font-valmist font-extrabold text-[clamp(4.2rem,9.5vw,10.5rem)] uppercase leading-[0.82] tracking-tight text-[#E7DDC8]">
                  SHIT
                </span>
                <span className="font-charlea font-bold italic text-[clamp(4.6rem,10.2vw,11.5rem)] leading-[0.85] tracking-[-0.03em] text-[#E7DDC8]">
                  Sherlock
                </span>
              </div>
            </div>

            {/* RIGHT SIDE: CONTINUOUS CHOREOGRAPHED NARRATIVE BEATS */}
            <div className="absolute right-8 sm:right-12 lg:right-16 top-[28vh] z-20 w-full max-w-md lg:max-w-lg pointer-events-auto">
              {/* BEAT 1: THE PREMISE (Active 0.0 - 0.32) */}
              <div ref={beat1Ref} className="space-y-6 text-left">
                <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-[#A92A28] block">
                  THE PREMISE
                </span>

                <h2 className="font-valmist font-bold text-3xl sm:text-4xl lg:text-5xl uppercase leading-[1.05] tracking-tight text-[#E7DDC8]">
                  Every cold case hides an unbroken sequence.
                </h2>

                <p className="font-selnora text-base sm:text-lg leading-relaxed text-[#B8AD98]">
                  An open-source noir detective game. Open the evidence folder, examine crime-scene
                  exhibits, decode encrypted messages, and interrogate wiretaps across five
                  progressive sections.
                </p>

                <p className="font-garamond text-lg sm:text-xl italic text-[#B8AD98]/90 border-l-2 border-[#A9874A]/40 pl-4 py-1">
                  Collect the clues into your notebook. Once the folder closes, string the red yarn
                  on the pinboard to reconstruct the timeline.
                </p>

                <div className="pt-4 flex items-center gap-3 text-xs font-mono text-[#78716A] uppercase tracking-widest">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#A9874A] animate-ping" />
                  <span>SCROLL TO PROCEED WITH INVESTIGATION &darr;</span>
                </div>
              </div>

              {/* BEAT 2: THE CORE INVESTIGATION LOOP (Active 0.36 - 0.68) */}
              <div ref={beat2Ref} className="space-y-6 text-left opacity-0">
                <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-[#A9874A] block">
                  INVESTIGATION DISCIPLINE
                </span>

                <h2 className="font-valmist font-bold text-3xl sm:text-4xl lg:text-5xl uppercase leading-[1.05] tracking-tight text-[#E7DDC8]">
                  Server-Authoritative.
                  <br />
                  <span className="text-[#A92A28]">Zero Guesswork.</span>
                </h2>

                <div className="space-y-4 font-mono text-xs text-[#B8AD98] border-t border-[#A9874A]/30 pt-4">
                  <div className="flex gap-4">
                    <span className="text-[#A9874A] font-bold">01</span>
                    <div>
                      <strong className="text-[#E7DDC8] uppercase block font-valmist text-sm">
                        The Evidence Folder
                      </strong>
                      <p className="font-selnora text-sm text-[#B8AD98] mt-1 leading-normal">
                        Five sections of puzzle deduction: letter-dash ciphers, witness
                        cross-examinations, true/false testimony contradictions, cryptic codes, and
                        analog wiretaps.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 border-t border-[#15110F] pt-3">
                    <span className="text-[#A9874A] font-bold">02</span>
                    <div>
                      <strong className="text-[#E7DDC8] uppercase block font-valmist text-sm">
                        The Detective Notebook
                      </strong>
                      <p className="font-selnora text-sm text-[#B8AD98] mt-1 leading-normal">
                        Correct deductions permanently unlock evidence artifacts and timestamped
                        testimonies into your inventory pocketbook.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 border-t border-[#15110F] pt-3">
                    <span className="text-[#A92A28] font-bold">03</span>
                    <div>
                      <strong className="text-[#E7DDC8] uppercase block font-valmist text-sm">
                        The Yarn Pinboard
                      </strong>
                      <p className="font-selnora text-sm text-[#B8AD98] mt-1 leading-normal">
                        Arrange gathered clues in exact chronological order. One correct timeline
                        breaks the case wide open.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="font-mono text-[11px] text-[#78716A]">
                  * Correct answers never touch client memory. Scores and penalties are locked on
                  the database.
                </p>
              </div>

              {/* BEAT 3: CASE 01 & ENLISTMENT CALL TO ACTION (Active 0.72 - 1.0) */}
              <div ref={beat3Ref} className="space-y-6 text-left opacity-0">
                <div className="flex items-center gap-3">
                  <span className="border border-[#A92A28] bg-[#A92A28]/20 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#E7DDC8]">
                    CASE 01 ACTIVE
                  </span>
                  <span className="font-mono text-[10px] text-[#A9874A] tracking-widest">
                    EDINBURGH EXPRESS {"//"} 1928
                  </span>
                </div>

                <h2 className="font-valmist font-bold text-3xl sm:text-4xl lg:text-5xl uppercase leading-[1.05] tracking-tight text-[#E7DDC8]">
                  The Blackwood Protocol
                </h2>

                <p className="font-selnora text-base sm:text-lg leading-relaxed text-[#B8AD98]">
                  A diplomat found dead in a sealed railway carriage. An empty steel briefcase and
                  five suspects with conflicting timetables. The files are open.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  {user ? (
                    <Link
                      href="/cases"
                      onClick={() => soundEngine.playStamp()}
                      className="px-8 py-3.5 bg-[#A92A28] hover:bg-[#861f1e] text-[#E7DDC8] font-valmist font-bold text-base uppercase tracking-widest text-center shadow-2xl transition-all cursor-pointer border border-[#A92A28]"
                    >
                      Resume investigation &rarr;
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/signup"
                        onClick={() => soundEngine.playStamp()}
                        className="px-8 py-3.5 bg-[#A92A28] hover:bg-[#861f1e] text-[#E7DDC8] font-valmist font-bold text-base uppercase tracking-widest text-center shadow-2xl transition-all cursor-pointer border border-[#A92A28]"
                      >
                        Register as detective &rarr;
                      </Link>
                      <Link
                        href="/login"
                        onClick={() => soundEngine.playPaper()}
                        className="px-6 py-3.5 bg-transparent hover:bg-[#A9874A]/10 text-[#E7DDC8] font-mono text-xs uppercase tracking-wider text-center border border-[#A9874A]/60 transition-all cursor-pointer"
                      >
                        Log as detective
                      </Link>
                    </>
                  )}
                </div>

                <div className="pt-8 border-t border-[#A9874A]/20 flex items-center justify-between font-mono text-[10px] text-[#78716A]">
                  <span>&copy; NOSHITSHERLOCK. ALL RIGHTS RESERVED.</span>
                  <div className="flex gap-4">
                    <Link href="/legal" className="hover:text-[#E7DDC8] transition-colors">
                      TERMS & PRIVACY
                    </Link>
                    <a
                      href="https://github.com/DevInfinix/noshitsherlock"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[#E7DDC8] transition-colors"
                    >
                      GITHUB
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SmoothScrollProvider>
  );
}
