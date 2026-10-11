"use client";

import { Blobatar } from "@blobatar/react";
import { soundEngine } from "@/lib/audio/sound-engine";

interface BlobatarAvatarProps {
  name: string;
  size?: number;
  className?: string;
  interactive?: boolean;
}

export function BlobatarAvatar({
  name,
  size = 48,
  className = "",
  interactive = true,
}: BlobatarAvatarProps) {
  const handleClick = () => {
    if (interactive) {
      soundEngine.playPaper();
    }
  };

  const content = (
    <>
      <Blobatar name={name || "operative"} size={size} />
      {/* Subtle vignette inner ring */}
      <div className="pointer-events-none absolute inset-0 rounded-full border border-[var(--color-ink)]/40 shadow-inner" />
    </>
  );

  const containerClasses = `relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[var(--color-brass)]/50 bg-[var(--color-ink-raised)] p-0.5 shadow-md transition-all duration-300 ${
    interactive ? "cursor-pointer hover:border-[var(--color-brass)] hover:scale-105" : ""
  } ${className}`;

  if (interactive) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={containerClasses}
        style={{ width: size + 6, height: size + 6 }}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={containerClasses} style={{ width: size + 6, height: size + 6 }}>
      {content}
    </div>
  );
}
