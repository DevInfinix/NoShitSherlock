"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

export function SpotlightCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  // Smooth spring physics for fluid movement
  const springX = useSpring(mouseX, { damping: 28, stiffness: 320, mass: 0.5 });
  const springY = useSpring(mouseY, { damping: 28, stiffness: 320, mass: 0.5 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect touch device
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest(
          "a, button, input, textarea, select, [role='button'], [data-interactive]",
        );
        setIsPointer(!!interactive);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY, isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Viewport-wide spotlight lighting cone */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 420px at var(--spot-x, 50vw) var(--spot-y, 50vh), rgba(169, 135, 74, 0.08) 0%, rgba(100, 27, 27, 0.04) 35%, rgba(9, 8, 7, 0) 70%)`,
        }}
      />

      {/* Reticle / Lens Spotlight */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-50 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
        style={{
          x: springX,
          y: springY,
        }}
      >
        <motion.div
          animate={{
            scale: isPointer ? 1.6 : 1,
            borderColor: isPointer ? "var(--color-evidence-red)" : "var(--color-brass)",
            backgroundColor: isPointer ? "rgba(169, 42, 40, 0.15)" : "rgba(169, 135, 74, 0.04)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative h-8 w-8 rounded-full border border-[var(--color-brass)]/60 backdrop-blur-[0.5px]"
        >
          {/* Crosshair markers */}
          <div className="absolute top-1/2 left-0 h-[1px] w-1.5 -translate-y-1/2 bg-[var(--color-brass)]/80" />
          <div className="absolute top-1/2 right-0 h-[1px] w-1.5 -translate-y-1/2 bg-[var(--color-brass)]/80" />
          <div className="absolute top-0 left-1/2 h-1.5 w-[1px] -translate-x-1/2 bg-[var(--color-brass)]/80" />
          <div className="absolute bottom-0 left-1/2 h-1.5 w-[1px] -translate-x-1/2 bg-[var(--color-brass)]/80" />

          {/* Center pinpoint */}
          <div className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-evidence-red)]" />
        </motion.div>
      </motion.div>
    </>
  );
}
