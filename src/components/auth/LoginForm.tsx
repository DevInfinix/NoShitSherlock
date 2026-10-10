"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/cases";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn.email({
        email,
        password,
      });

      if (res.error) {
        setErrorMessage(
          res.error.message ?? "Authentication failed. Verify call sign and passcode.",
        );
        setIsLoading(false);
        return;
      }

      router.push(callbackUrl);
    } catch {
      setErrorMessage("Could not connect to Scotland Yard authentication server.");
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "github" | "google") => {
    try {
      await signIn.social({
        provider,
        callbackURL: callbackUrl,
      });
    } catch {
      setErrorMessage(`Failed to initiate ${provider} identity clearance.`);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto border-2 border-brass/60 bg-ink-raised p-8 shadow-2xl relative">
      {/* Decorative Badge Stamp */}
      <div className="flex items-center justify-between border-b border-brass/30 pb-4 mb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-brass block">
            METROPOLITAN POLICE {"//"} WARRANT CARD
          </span>
          <h1 className="font-serif text-2xl text-paper font-bold mt-1">Detective Sign-In</h1>
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-brass/40 flex items-center justify-center font-mono text-xs text-brass font-bold">
          SY
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 mb-6 border border-evidence-red bg-oxblood/30 text-paper font-mono text-xs leading-relaxed">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="login-email"
            className="font-mono text-xs text-paper-muted uppercase tracking-wider block mb-1.5"
          >
            Telegraph Address (Email):
          </label>
          <input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="detective@scotlandyard.gov"
            className="w-full bg-ink border border-brass/40 p-2.5 font-mono text-sm text-paper placeholder-smoke focus:border-evidence-red focus:outline-hidden transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="font-mono text-xs text-paper-muted uppercase tracking-wider block mb-1.5"
          >
            Security Passcode:
          </label>
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full bg-ink border border-brass/40 p-2.5 font-mono text-sm text-paper placeholder-smoke focus:border-evidence-red focus:outline-hidden transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-oxblood hover:bg-evidence-red border-2 border-evidence-red text-paper py-3 font-mono text-xs uppercase tracking-wider disabled:opacity-40 shadow-lg transition-colors cursor-pointer"
        >
          {isLoading ? "Verifying Warrant..." : "Verify Identity & Enter Archives"}
        </button>
      </form>

      {/* Social Provider Stubs */}
      <div className="mt-6 pt-6 border-t border-brass/20 space-y-3">
        <span className="font-mono text-[10px] text-smoke uppercase tracking-widest block text-center">
          OR VERIFY VIA EXTERNAL AGENCY
        </span>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialSignIn("github")}
            className="border border-brass/40 bg-ink hover:border-brass p-2 font-mono text-xs text-paper-muted hover:text-paper transition-colors cursor-pointer"
          >
            [ GITHUB ]
          </button>
          <button
            type="button"
            onClick={() => handleSocialSignIn("google")}
            className="border border-brass/40 bg-ink hover:border-brass p-2 font-mono text-xs text-paper-muted hover:text-paper transition-colors cursor-pointer"
          >
            [ GOOGLE ]
          </button>
        </div>
      </div>

      {/* Switch to Signup Link */}
      <div className="mt-6 pt-4 border-t border-brass/20 text-center">
        <span className="font-serif text-xs text-paper-muted">
          New to the Bureau?{" "}
          <Link
            href="/signup"
            className="text-brass hover:text-paper underline underline-offset-2 font-mono text-xs transition-colors"
          >
            Enlist as Detective &rarr;
          </Link>
        </span>
      </div>
    </div>
  );
}
