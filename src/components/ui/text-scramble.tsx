"use client";

import { useEffect, useRef, useState } from "react";
import { soundEngine } from "@/lib/audio/sound-engine";

interface TextScrambleProps {
  children: string;
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
  className?: string;
  duration?: number;
  speed?: number;
  characterSet?: string;
  trigger?: boolean;
  onScrambleComplete?: () => void;
  playAudio?: boolean;
}

const DEFAULT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789§¶#%&@*!?";

export function TextScramble({
  children,
  as: Component = "span",
  className = "",
  duration = 0.9,
  speed = 0.04,
  characterSet = DEFAULT_CHARS,
  trigger = true,
  onScrambleComplete,
  playAudio = false,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(children);
  const isScramblingRef = useRef(false);

  useEffect(() => {
    if (!trigger) {
      setDisplayText(children);
      return;
    }

    isScramblingRef.current = true;
    const targetText = children;
    const totalFrames = Math.max(1, Math.floor(duration / speed));
    let frame = 0;

    if (playAudio) {
      soundEngine.playTypewriter();
    }

    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;

      // Calculate how many characters are resolved from left to right
      const resolvedCharsCount = Math.floor(progress * targetText.length);

      const scrambled = targetText
        .split("")
        .map((char, index) => {
          if (char === " " || char === "\n") return char;
          if (index < resolvedCharsCount) {
            return char;
          }
          return characterSet[Math.floor(Math.random() * characterSet.length)];
        })
        .join("");

      setDisplayText(scrambled);

      if (frame >= totalFrames) {
        clearInterval(interval);
        setDisplayText(targetText);
        isScramblingRef.current = false;
        onScrambleComplete?.();
      }
    }, speed * 1000);

    return () => clearInterval(interval);
  }, [children, duration, speed, characterSet, trigger, onScrambleComplete, playAudio]);

  return <Component className={className}>{displayText}</Component>;
}
