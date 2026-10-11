"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface ResendVerificationBannerProps {
  email: string;
}

export function ResendVerificationBanner({ email }: ResendVerificationBannerProps) {
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleResend = async () => {
    if (isSending || cooldown > 0) return;

    setIsSending(true);
    setStatusMessage(null);

    try {
      const res = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/cases",
      });

      if (res?.error) {
        setStatusMessage(res.error.message || "Failed to dispatch verification email.");
      } else {
        setStatusMessage("Verification email dispatched. Please check your inbox or spam folder.");
        setCooldown(60); // 60-second client-side cooldown
      }
    } catch {
      setStatusMessage("Network error. Please try again shortly.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mb-8 border-2 border-[#A7192D] bg-[#240C0F]/90 p-5 font-mono text-xs text-[#E8DCC8] shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <span className="font-bold uppercase tracking-widest text-[#A7192D] flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#A7192D] animate-pulse" />
            [SECURITY PROTOCOL] EMAIL VERIFICATION REQUIRED
          </span>
          <p className="font-serif text-[#B8AD98] text-sm leading-relaxed">
            Your operative account (<strong>{email}</strong>) has not yet confirmed email
            verification. Departmental protocols require verified credentials before opening cold
            case files or submitting evidence deductions.
          </p>
          {statusMessage && (
            <p className="text-[11px] text-[#C59E58] pt-1 font-mono">{statusMessage}</p>
          )}
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={handleResend}
            disabled={isSending || cooldown > 0}
            className="border-2 border-[#A7192D] bg-[#641B1B] hover:bg-[#A7192D] text-[#E8DCC8] px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold transition-all disabled:opacity-40 cursor-pointer shadow-md"
          >
            {isSending
              ? "Dispatching..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend Verification Email"}
          </button>
        </div>
      </div>
    </div>
  );
}
