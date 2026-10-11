"use client";

import { type MouseEvent, type ReactNode, useRef, useState } from "react";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
}

export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(169, 135, 74, 0.15)",
  borderColor = "var(--color-brass)",
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const handlePointerMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handlePointerLeave = () => {
    setPosition(null);
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`relative overflow-hidden border border-[var(--color-brass)]/30 bg-[var(--color-ink-raised)] transition-all duration-300 hover:border-[var(--color-brass)] ${className}`}
    >
      {/* Dynamic spotlight glow */}
      {position && (
        <div
          className="pointer-events-none absolute -inset-px opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(350px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
          }}
        />
      )}

      {/* Subtle border highlight */}
      {position && (
        <div
          className="pointer-events-none absolute inset-0 border border-transparent transition-opacity duration-300"
          style={{
            borderColor,
            maskImage: `radial-gradient(220px circle at ${position.x}px ${position.y}px, black, transparent 80%)`,
            WebkitMaskImage: `radial-gradient(220px circle at ${position.x}px ${position.y}px, black, transparent 80%)`,
          }}
        />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
