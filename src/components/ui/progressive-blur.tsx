"use client";

interface ProgressiveBlurProps {
  direction?: "top" | "bottom" | "left" | "right";
  className?: string;
  layers?: number;
}

export function ProgressiveBlur({
  direction = "bottom",
  className = "",
  layers = 6,
}: ProgressiveBlurProps) {
  const isVertical = direction === "top" || direction === "bottom";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 ${
        direction === "bottom" ? "bottom-0" : direction === "top" ? "top-0" : ""
      } ${className}`}
    >
      {Array.from({ length: layers }).map((_, index) => {
        const step = (index + 1) / layers;
        const blurAmount = Math.round(step * 16);
        const opacity = Math.sin((step * Math.PI) / 2);

        return (
          <div
            key={blurAmount}
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${blurAmount}px)`,
              WebkitBackdropFilter: `blur(${blurAmount}px)`,
              maskImage: isVertical
                ? `linear-gradient(to ${direction === "bottom" ? "top" : "bottom"}, rgba(0,0,0,${opacity}) 0%, transparent 100%)`
                : `linear-gradient(to ${direction === "right" ? "left" : "right"}, rgba(0,0,0,${opacity}) 0%, transparent 100%)`,
              WebkitMaskImage: isVertical
                ? `linear-gradient(to ${direction === "bottom" ? "top" : "bottom"}, rgba(0,0,0,${opacity}) 0%, transparent 100%)`
                : `linear-gradient(to ${direction === "right" ? "left" : "right"}, rgba(0,0,0,${opacity}) 0%, transparent 100%)`,
            }}
          />
        );
      })}
    </div>
  );
}
