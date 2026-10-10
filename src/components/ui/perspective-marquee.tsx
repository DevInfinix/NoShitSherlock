"use client";

import type { ReactNode } from "react";

interface PerspectiveMarqueeProps {
  children: ReactNode;
  direction?: "left" | "right";
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
  rotateDeg?: number;
}

export function PerspectiveMarquee({
  children,
  direction = "left",
  speed = 30,
  pauseOnHover = true,
  className = "",
  rotateDeg = -2,
}: PerspectiveMarqueeProps) {
  return (
    <div
      className={`relative w-full overflow-hidden py-3 [perspective:1000px] ${className}`}
      style={{
        transform: `rotate(${rotateDeg}deg)`,
      }}
    >
      <div
        className={`flex w-max shrink-0 gap-8 ${
          direction === "left" ? "animate-marquee" : "animate-marquee [animation-direction:reverse]"
        } ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
        style={
          {
            animationDuration: `${speed}s`,
            "--gap": "2rem",
          } as React.CSSProperties
        }
      >
        <div className="flex shrink-0 items-center gap-8">{children}</div>
        <div className="flex shrink-0 items-center gap-8">{children}</div>
        <div className="flex shrink-0 items-center gap-8">{children}</div>
      </div>
    </div>
  );
}
