"use client";

import type { CSSProperties, ReactNode } from "react";

interface TextShimmerProps {
  children: ReactNode;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
  className?: string;
  duration?: number;
  spread?: number;
}

export function TextShimmer({
  children,
  as: Component = "span",
  className = "",
  duration = 2.5,
}: TextShimmerProps) {
  return (
    <Component
      className={`inline-block bg-[length:250%_100%] bg-clip-text text-transparent animate-shimmer ${className}`}
      style={
        {
          backgroundImage:
            "linear-gradient(90deg, var(--color-paper-muted) 0%, var(--color-paper) 40%, var(--color-brass) 50%, var(--color-paper-muted) 60%, var(--color-paper-muted) 100%)",
          animationDuration: `${duration}s`,
        } as CSSProperties
      }
    >
      {children}
    </Component>
  );
}
