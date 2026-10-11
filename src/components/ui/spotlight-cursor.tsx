"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

export function SpotlightCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  // Smooth spring physics for organic momentum
  const springX = useSpring(mouseX, { damping: 26, stiffness: 380, mass: 0.35 });
  const springY = useSpring(mouseY, { damping: 26, stiffness: 380, mass: 0.35 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    // Hide default OS cursor when detective spotlight is active
    document.documentElement.classList.add("cursor-none");
    document.body.classList.add("cursor-none");

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
      document.documentElement.classList.remove("cursor-none");
      document.body.classList.remove("cursor-none");
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mouseX, mouseY, isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-50 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
      style={{
        x: springX,
        y: springY,
      }}
    >
      {/* Outer Wide Ambient Flashlight Light Cone */}
      <motion.div
        animate={{
          scale: isPointer ? 1.15 : 1,
          opacity: isPointer ? 0.95 : 0.8,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 760,
          height: 760,
          background:
            "radial-gradient(circle, rgba(232, 220, 200, 0.08) 0%, rgba(167, 25, 45, 0.06) 35%, rgba(38, 13, 16, 0.04) 55%, transparent 72%)",
        }}
      />

      {/* Inner Focused Flashlight Core Beam */}
      <motion.div
        animate={{
          scale: isPointer ? 1.25 : 1,
          opacity: isPointer ? 0.9 : 0.7,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 280,
          height: 280,
          background:
            "radial-gradient(circle, rgba(232, 220, 200, 0.16) 0%, rgba(167, 25, 45, 0.10) 45%, transparent 75%)",
        }}
      />

      {/* Detective Crosshair Reticle (Expands over interactive elements) */}
      <motion.div
        animate={{
          scale: isPointer ? 1.5 : 1,
          borderColor: isPointer ? "#A7192D" : "rgba(121, 96, 74, 0.6)",
        }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        className="relative flex items-center justify-center h-5 w-5 rounded-full border border-[#79604A]/60 pointer-events-none"
      >
        {/* Subtle crosshair hairline ticks when hovering buttons/links */}
        {isPointer && (
          <>
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[1px] h-1 bg-[#A7192D]" />
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-[1px] h-1 bg-[#A7192D]" />
            <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-[1px] w-1 bg-[#A7192D]" />
            <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-[1px] w-1 bg-[#A7192D]" />
          </>
        )}

        {/* Central Luminous Lens Focal Pinpoint */}
        <motion.div
          animate={{
            scale: isPointer ? 1.8 : 1,
            backgroundColor: isPointer ? "#C52A3B" : "#E8DCC8",
            boxShadow: isPointer
              ? "0 0 16px rgba(197, 42, 59, 0.9), 0 0 4px rgba(197, 42, 59, 0.6)"
              : "0 0 8px rgba(232, 220, 200, 0.7)",
          }}
          transition={{ type: "spring", stiffness: 450, damping: 28 }}
          className="h-1.5 w-1.5 rounded-full pointer-events-none"
        />
      </motion.div>
    </motion.div>
  );
}
