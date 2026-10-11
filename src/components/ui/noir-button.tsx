"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { BorderBeam } from "@/components/ui/border-beam";

interface BaseButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "minimal";
  size?: "sm" | "md" | "lg";
  className?: string;
  withBeam?: boolean;
}

type NoirButtonAsButton = BaseButtonProps &
  ComponentPropsWithoutRef<"button"> & {
    href?: undefined;
  };

type NoirButtonAsLink = BaseButtonProps &
  ComponentPropsWithoutRef<typeof Link> & {
    href: string;
  };

export type NoirButtonProps = NoirButtonAsButton | NoirButtonAsLink;

export function NoirButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  withBeam = false,
  ...props
}: NoirButtonProps) {
  const sizeClasses = {
    sm: "px-3.5 py-1.5 text-xs font-mono tracking-wider",
    md: "px-5 py-2.5 text-xs sm:text-sm font-mono tracking-wider",
    lg: "px-7 py-3.5 text-sm sm:text-base font-mono tracking-widest",
  }[size];

  const variantClasses = {
    primary:
      "relative overflow-hidden border border-[#A7192D]/80 bg-gradient-to-r from-[#260D10]/90 via-[#181414]/95 to-[#260D10]/90 text-[#E8DCC8] hover:border-[#C52A3B] hover:text-white shadow-[0_4px_20px_rgba(167,25,45,0.25)] hover:shadow-[0_0_25px_rgba(197,42,59,0.45)] backdrop-blur-md",
    secondary:
      "relative overflow-hidden border border-[#79604A]/70 bg-[#181414]/80 text-[#E8DCC8] hover:border-[#E8DCC8] hover:bg-[#260D10]/60 shadow-[0_4px_16px_rgba(16,13,13,0.5)] hover:shadow-[0_0_20px_rgba(232,220,200,0.15)] backdrop-blur-md",
    outline:
      "relative overflow-hidden border border-[#79604A]/50 bg-transparent text-[#A69A8C] hover:border-[#A7192D] hover:text-[#E8DCC8] hover:bg-[#A7192D]/10 backdrop-blur-sm",
    minimal:
      "relative bg-transparent text-[#A69A8C] hover:text-[#E8DCC8] border-b border-transparent hover:border-[#A7192D]",
  }[variant];

  const commonClass = `inline-flex items-center justify-center gap-2.5 uppercase select-none transition-all duration-300 active:scale-[0.98] ${sizeClasses} ${variantClasses} ${className}`;

  const renderContent = () => (
    <>
      {/* Corner Bracket Accents for Noir Dossier Aesthetic */}
      {variant !== "minimal" && (
        <>
          <span className="pointer-events-none absolute top-0 left-0 h-1.5 w-1.5 border-t border-l border-[#E8DCC8]/40" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-1.5 w-1.5 border-b border-r border-[#E8DCC8]/40" />
        </>
      )}

      {/* Optional Animated Gilded Border Beam */}
      {withBeam && (
        <BorderBeam
          size={120}
          duration={6}
          borderWidth={1.5}
          colorFrom={variant === "primary" ? "#A7192D" : "#79604A"}
          colorTo={variant === "primary" ? "#E8DCC8" : "#A7192D"}
        />
      )}

      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </>
  );

  if ("href" in props && typeof props.href === "string") {
    return (
      <Link className={commonClass} {...props}>
        {renderContent()}
      </Link>
    );
  }

  return (
    <button
      type={(props as ComponentPropsWithoutRef<"button">).type || "button"}
      className={commonClass}
      {...(props as ComponentPropsWithoutRef<"button">)}
    >
      {renderContent()}
    </button>
  );
}
