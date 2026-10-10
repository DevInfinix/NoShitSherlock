"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { recordLegalConsentAction } from "@/server/actions/auth-actions";

export function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isOver13, setIsOver13] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || isLoading) return;

    if (!isOver13) {
      setErrorMessage("You must confirm you are at least 13 years of age to enlist.");
      return;
    }
    if (!termsAccepted || !privacyAccepted) {
      setErrorMessage("You must accept the Terms of Service and acknowledge the Privacy Notice.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (res.error) {
        setErrorMessage(res.error.message ?? "Registration rejected by Scotland Yard records.");
        setIsLoading(false);
        return;
      }

      // Record immutable COPPA / legal consent entry
      await recordLegalConsentAction({
        isOver13: true,
        termsAccepted: true,
        privacyAccepted: true,
      });

      setSuccessNotice(
        "Warrant issued! Check your telegraph (inbox) for verification code, or proceed to case archive.",
      );
      setTimeout(() => {
        router.push("/cases");
      }, 1500);
    } catch {
      setErrorMessage("Could not connect to Bureau registration server.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto border-2 border-brass/60 bg-ink-raised p-8 shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brass/30 pb-4 mb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-brass block">
            SCOTLAND YARD {"//"} DETECTIVE ENROLLMENT
          </span>
          <h1 className="font-serif text-2xl text-paper font-bold mt-1">Enlistment Warrant</h1>
        </div>
        <div className="w-8 h-8 rounded-full border-2 border-brass/40 flex items-center justify-center font-mono text-xs text-brass font-bold">
          CID
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 mb-6 border border-evidence-red bg-oxblood/30 text-paper font-mono text-xs leading-relaxed">
          {errorMessage}
        </div>
      )}

      {successNotice && (
        <div className="p-3 mb-6 border border-brass bg-ink text-paper font-mono text-xs leading-relaxed">
          {successNotice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="signup-name"
            className="font-mono text-xs text-paper-muted uppercase tracking-wider block mb-1.5"
          >
            Detective Call Sign / Full Name:
          </label>
          <input
            id="signup-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Inspector E. Vance"
            className="w-full bg-ink border border-brass/40 p-2.5 font-mono text-sm text-paper placeholder-smoke focus:border-evidence-red focus:outline-hidden transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="font-mono text-xs text-paper-muted uppercase tracking-wider block mb-1.5"
          >
            Telegraph Address (Email):
          </label>
          <input
            id="signup-email"
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
            htmlFor="signup-password"
            className="font-mono text-xs text-paper-muted uppercase tracking-wider block mb-1.5"
          >
            Security Passcode:
          </label>
          <input
            id="signup-password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full bg-ink border border-brass/40 p-2.5 font-mono text-sm text-paper placeholder-smoke focus:border-evidence-red focus:outline-hidden transition-colors"
          />
        </div>

        {/* Legal & Age Gate Checkboxes */}
        <div className="pt-2 space-y-3 border-t border-brass/20">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={isOver13}
              onChange={(e) => setIsOver13(e.target.checked)}
              className="mt-1 h-4 w-4 rounded-none accent-evidence-red border-brass/40 bg-ink"
            />
            <span className="font-sans text-xs text-paper-muted leading-relaxed">
              I certify that I am at least 13 years of age.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded-none accent-evidence-red border-brass/40 bg-ink"
            />
            <span className="font-sans text-xs text-paper-muted leading-relaxed">
              I agree to the{" "}
              <Link href="/legal" target="_blank" className="text-brass hover:text-paper underline">
                Terms of Service
              </Link>
              .
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded-none accent-evidence-red border-brass/40 bg-ink"
            />
            <span className="font-sans text-xs text-paper-muted leading-relaxed">
              I acknowledge the{" "}
              <Link href="/legal" target="_blank" className="text-brass hover:text-paper underline">
                Privacy Notice
              </Link>
              .
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 bg-oxblood hover:bg-evidence-red border-2 border-evidence-red text-paper py-3 font-mono text-xs uppercase tracking-wider disabled:opacity-40 shadow-lg transition-colors cursor-pointer"
        >
          {isLoading ? "Filing Enlistment..." : "Issue Warrant & Join The Bureau"}
        </button>
      </form>

      {/* Switch to Login Link */}
      <div className="mt-6 pt-4 border-t border-brass/20 text-center">
        <span className="font-serif text-xs text-paper-muted">
          Already have an active warrant?{" "}
          <Link
            href="/login"
            className="text-brass hover:text-paper underline underline-offset-2 font-mono text-xs transition-colors"
          >
            Sign In Here &rarr;
          </Link>
        </span>
      </div>
    </div>
  );
}
