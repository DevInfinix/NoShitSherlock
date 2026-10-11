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
  const springX = useSpring(mouseX, { damping: 28, stiffness: 350, mass: 0.4 });
  const springY = useSpring(mouseY, { damping: 28, stiffness: 350, mass: 0.4 });

  useEffect(() => {
    if (typeof window === "undefined") return;

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
    <motion.div
      className="pointer-events-none fixed top-0 left-0 z-50 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
      style={{
        x: springX,
        y: springY,
      }}
    >
      {/* Controlled cinematic flashlight beam */}
      <motion.div
        animate={{
          scale: isPointer ? 1.15 : 1,
          opacity: isPointer ? 0.95 : 0.75,
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 320,
          height: 320,
          background:
            "radial-gradient(circle, rgba(231, 221, 200, 0.08) 0%, rgba(100, 27, 27, 0.05) 42%, rgba(9, 8, 7, 0) 70%)",
        }}
      />

      {/* Refined central lens focal pinpoint */}
      <motion.div
        animate={{
          scale: isPointer ? 1.8 : 1,
          backgroundColor: isPointer ? "var(--color-evidence-red)" : "var(--color-paper)",
          boxShadow: isPointer
            ? "0 0 14px rgba(169, 42, 40, 0.8), 0 0 4px rgba(169, 42, 40, 0.5)"
            : "0 0 8px rgba(231, 221, 200, 0.6)",
        }}
        transition={{ type: "spring", stiffness: 450, damping: 28 }}
        className="relative h-1.5 w-1.5 rounded-full pointer-events-none"
      />
    </motion.div>
  );
}
