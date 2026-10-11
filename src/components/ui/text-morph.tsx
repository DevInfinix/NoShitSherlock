"use client";

import { AnimatePresence, motion } from "motion/react";

interface TextMorphProps {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
}

export function TextMorph({ text, className = "", as: Component = "span" }: TextMorphProps) {
  return (
    <Component className={`relative inline-block overflow-hidden ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </Component>
  );
}
