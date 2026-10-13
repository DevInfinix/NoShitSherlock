"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

export function SpotlightCursor({ isHoveringTarget = false }: { isHoveringTarget?: boolean } = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const isInteractive = isPointer || isHoveringTarget;

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
          scale: isInteractive ? 1.25 : 1,
          opacity: isInteractive ? 0.92 : 0.7,
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

      {/* Detective Pointer Reticle / Hand Symbol */}
      <motion.div
        animate={{
          scale: isInteractive ? 1.25 : 1,
          borderColor: isInteractive ? "transparent" : "rgba(121, 96, 74, 0.6)",
        }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        className="relative flex items-center justify-center h-5 w-5 rounded-full border border-[#79604A]/60 pointer-events-none"
      >
        {isInteractive ? (
          /* Hand Symbol Pointer Cursor when hovering interactive case files or controls */
          <motion.svg
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 24 }}
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="#FAF6EE"
            stroke="#16110D"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute -top-2 -left-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] pointer-events-none"
          >
            <path d="M10 2v9m0-9c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v8.5m-3-8.5c0-.83-.67-1.5-1.5-1.5S7 2.17 7 3v9.5m6-1.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v2.5m0 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v3.5c0 3.31-2.69 6-6 6h-2c-2.76 0-5-2.24-5-5v-3.2c0-.98.49-1.9 1.3-2.44L7 12.5" />
          </motion.svg>
        ) : (
          /* Normal Central Luminous Lens Focal Pinpoint */
          <motion.div
            animate={{
              scale: 1,
              backgroundColor: "#E8DCC8",
              boxShadow: "0 0 8px rgba(232, 220, 200, 0.7)",
            }}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            className="h-1.5 w-1.5 rounded-full pointer-events-none"
          />
        )}
      </motion.div>
    </motion.div>
  );
}
