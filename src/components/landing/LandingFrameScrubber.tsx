"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TOTAL_FRAMES = 150;

export function LandingFrameScrubber() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadPercent, setLoadPercent] = useState(0);
  const [isReady, setIsReady] = useState(false);

  // Store preloaded HTMLImageElements
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    const updateFrame = (index: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = imagesRef.current[index];
      if (!img?.complete) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      // Draw image in "cover" mode centered
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

    // Preload frames
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const num = String(i).padStart(3, "0");
      img.src = `/landing/frames/frame-${num}.webp`;

      img.onload = () => {
        if (!isMounted) return;
        loadedCount++;
        const percent = Math.round((loadedCount / TOTAL_FRAMES) * 100);
        setLoadPercent(percent);

        // When the first 20 frames or all frames are ready, enable playback
        if (loadedCount === 20 || loadedCount === TOTAL_FRAMES) {
          setIsReady(true);
          updateFrame(currentFrameRef.current);
        }
      };

      images.push(img);
    }
    imagesRef.current = images;

    // Handle canvas sizing
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
      updateFrame(currentFrameRef.current);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Setup GSAP ScrollTrigger scrubbing
    const ctx = gsap.context(() => {
      if (!containerRef.current || !canvasRef.current) return;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => {
          const targetFrame = Math.min(
            TOTAL_FRAMES - 1,
            Math.floor(self.progress * (TOTAL_FRAMES - 1)),
          );
          currentFrameRef.current = targetFrame;
          updateFrame(targetFrame);
        },
      });
    }, containerRef);

    return () => {
      isMounted = false;
      window.removeEventListener("resize", handleResize);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-[350vh] w-full">
      {/* Pinned Viewport Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[var(--color-ink)]">
        {/* Loading overlay for initial frames */}
        {!isReady && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--color-ink)]">
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-[var(--color-brass)] animate-pulse">
              DECRYPTING ARCHIVE MEDIA... {loadPercent}%
            </span>
            <div className="mt-4 h-1 w-48 bg-[var(--color-ink-raised)]">
              <div
                className="h-full bg-[var(--color-evidence-red)] transition-all duration-200"
                style={{ width: `${loadPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Noir Vignette and gradient overlays */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-radial from-transparent via-[var(--color-ink)]/40 to-[var(--color-ink)]" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[var(--color-ink)] via-transparent to-[var(--color-ink)]/70" />

        {/* Canvas rendering image frames */}
        <canvas
          ref={canvasRef}
          className="h-full w-full object-cover transition-opacity duration-700"
          style={{ opacity: isReady ? 1 : 0 }}
        />
      </div>
    </div>
  );
}
