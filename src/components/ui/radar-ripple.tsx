"use client";

interface RadarRippleProps {
  className?: string;
  size?: number;
  count?: number;
  color?: string;
}

export function RadarRipple({
  className = "",
  size = 280,
  count = 3,
  color = "var(--color-evidence-red)",
}: RadarRippleProps) {
  return (
    <div
      className={`pointer-events-none relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="absolute rounded-full border opacity-0"
          style={{
            borderColor: color,
            width: size,
            height: size,
            animation: "pulse-radar 3.5s cubic-bezier(0, 0.2, 0.8, 1) infinite",
            animationDelay: `${i * 1.1}s`,
          }}
        />
      ))}
    </div>
  );
}
