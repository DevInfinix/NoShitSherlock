"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { soundEngine } from "@/lib/audio/sound-engine";

export function AudioControlHud() {
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    setIsMuted(soundEngine.getMuted());
  }, []);

  const handleToggle = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playTypewriter();
    }
  };

  return (
    <div className="fixed top-6 right-6 z-30 flex items-center gap-3">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isMuted ? "Enable ambient audio" : "Mute audio"}
        className="group relative flex items-center gap-2 border border-[var(--color-brass)]/40 bg-[var(--color-ink-raised)]/90 px-3 py-1.5 backdrop-blur-md transition-all duration-300 hover:border-[var(--color-brass)] hover:bg-[var(--color-ink)]"
      >
        <span className="relative flex h-2 w-2">
          {!isMuted && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-evidence-red)] opacity-75" />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              isMuted ? "bg-[var(--color-smoke)]" : "bg-[var(--color-evidence-red)]"
            }`}
          />
        </span>

        {isMuted ? (
          <VolumeX className="h-3.5 w-3.5 text-[var(--color-paper-muted)] group-hover:text-[var(--color-paper)]" />
        ) : (
          <Volume2 className="h-3.5 w-3.5 text-[var(--color-brass)] group-hover:text-[var(--color-paper)]" />
        )}

        <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--color-paper-muted)] group-hover:text-[var(--color-paper)]">
          {isMuted ? "AUDIO OFF" : "WIRE ACTIVE"}
        </span>
      </button>
    </div>
  );
}
