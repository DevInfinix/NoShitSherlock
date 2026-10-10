"use client";

import { ArrowRight, Lock, Mail, ShieldAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { getAgentDetailsAction } from "@/server/actions/auth-actions";

// Dynamically load the 3D ID card with SSR disabled
const DetectiveIDCard3D = dynamic(
  () => import("./DetectiveIDCard3D").then((mod) => mod.DetectiveIDCard3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[460px] md:h-[540px] flex flex-col items-center justify-center border border-brass/20 bg-ink-raised/50 p-6">
        <div className="w-12 h-12 border-2 border-brass border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-mono text-xs text-brass uppercase tracking-widest">
          Materializing Scotland Yard Identification...
        </span>
      </div>
    ),
  },
);

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/cases";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Layout & hover states
  const [hoveredOption, setHoveredOption] = useState<"email" | "google" | "github" | null>(null);
  const [selectedOption, setSelectedOption] = useState<"email" | "google" | "github" | null>(
    "email",
  );

  // Welcome back slide-in animation state
  const [welcomeAgentTag, setWelcomeAgentTag] = useState<string | null>(null);

  const handleSubmitEmail = async (e: React.FormEvent) => {
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
          res.error.message ?? "Authentication failed. Check operative telegraph and passcode.",
        );
        setIsLoading(false);
        return;
      }

      // Fetch user's registered agent tag from database
      const details = await getAgentDetailsAction(email);
      const tag = details.success && details.agentTag ? details.agentTag : "004";

      // Trigger full-screen slide-in animation
      setWelcomeAgentTag(tag);

      // Transition to callback URL after dramatic animation
      setTimeout(() => {
        router.push(callbackUrl);
      }, 2600);
    } catch {
      setErrorMessage("Scotland Yard authorization dispatch unreachable. Please retry.");
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = async (provider: "github" | "google") => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signIn.social({
        provider,
        callbackURL: callbackUrl,
      });
    } catch {
      setErrorMessage(`Failed to initiate ${provider} identity clearance.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-ink text-paper flex flex-col justify-between overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-oxblood/15 via-ink to-ink pointer-events-none" />

      {/* Main Top Content: Massive Typography + 3D Card */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-6">
        <header className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
          {/* Left Column: Viewport-Dominating Typography */}
          <div className="flex-1 text-left w-full">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-block w-2.5 h-2.5 bg-evidence-red rounded-full animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-[0.35em] text-brass">
                METROPOLITAN POLICE {"//"} IDENTITY CLEARANCE
              </span>
            </div>

            <h1 className="font-valmist font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-paper uppercase leading-[0.88] select-none">
              Detective
              <br />
              <span className="text-brass">Sign In</span>
            </h1>

            <p className="mt-6 font-charlea text-lg sm:text-xl md:text-2xl text-paper-muted italic max-w-xl">
              Verification required for access to unresolved case dossiers, evidence notebooks, and
              chronological pinboards.
            </p>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 border border-evidence-red bg-oxblood/40 text-paper font-mono text-xs flex items-center gap-3"
              >
                <ShieldAlert className="w-5 h-5 text-evidence-red shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </div>

          {/* Right Column: 3D Interactive Detective ID Card */}
          <div className="w-full lg:w-[480px] shrink-0">
            <DetectiveIDCard3D email={email} agentTag="004" isPasswordFocused={isPasswordFocused} />
          </div>
        </header>
      </div>

      {/* Bottom Area: 3 Options Covering Full Width Horizontally */}
      <div className="relative z-10 w-full border-t border-brass/30 bg-ink-raised/90 backdrop-blur-md">
        <div className="w-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-brass/30 transition-all duration-500 ease-out">
          {/* OPTION 1: Email Login */}
          <button
            type="button"
            onMouseEnter={() => setHoveredOption("email")}
            onMouseLeave={() => setHoveredOption(null)}
            className={`p-6 md:p-8 flex flex-col justify-between cursor-pointer text-left transition-all duration-500 ease-out ${
              hoveredOption === "email"
                ? "md:flex-[1.6] bg-oxblood/20 shadow-inner"
                : hoveredOption !== null
                  ? "md:flex-[0.7] opacity-65"
                  : "md:flex-1"
            } ${selectedOption === "email" ? "border-b-2 md:border-b-0 md:border-t-2 border-brass bg-ink-raised" : ""}`}
            onClick={() => setSelectedOption("email")}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-brass tracking-widest uppercase">
                  SECTION 01
                </span>
                <Mail
                  className={`w-5 h-5 transition-colors ${hoveredOption === "email" ? "text-brass" : "text-smoke"}`}
                />
              </div>
              <h2 className="font-valmist text-2xl md:text-3xl text-paper uppercase font-bold tracking-tight">
                Email Login
              </h2>
              <p className="font-mono text-xs text-paper-muted mt-2">
                Telegraph clearance via Scotland Yard secure passcode
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-brass font-mono text-xs tracking-wider uppercase">
              <span>{selectedOption === "email" ? "ACTIVE ENTRY" : "SELECT TO ENTER"}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* OPTION 2: Google Login */}
          <button
            type="button"
            onMouseEnter={() => setHoveredOption("google")}
            onMouseLeave={() => setHoveredOption(null)}
            onClick={() => handleSocialSignIn("google")}
            className={`p-6 md:p-8 flex flex-col justify-between cursor-pointer text-left transition-all duration-500 ease-out ${
              hoveredOption === "google"
                ? "md:flex-[1.6] bg-oxblood/20 shadow-inner"
                : hoveredOption !== null
                  ? "md:flex-[0.7] opacity-65"
                  : "md:flex-1"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-brass tracking-widest uppercase">
                  SECTION 02
                </span>
                <svg
                  className={`w-5 h-5 transition-colors ${hoveredOption === "google" ? "fill-brass" : "fill-smoke"}`}
                  viewBox="0 0 24 24"
                  aria-label="Google"
                >
                  <title>Google</title>
                  <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                </svg>
              </div>
              <h2 className="font-valmist text-2xl md:text-3xl text-paper uppercase font-bold tracking-tight">
                Google Login
              </h2>
              <p className="font-mono text-xs text-paper-muted mt-2">
                External diplomatic clearance through Google authentication
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-brass font-mono text-xs tracking-wider uppercase">
              <span>AUTHENTICATE NOW</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* OPTION 3: GitHub Login */}
          <button
            type="button"
            onMouseEnter={() => setHoveredOption("github")}
            onMouseLeave={() => setHoveredOption(null)}
            onClick={() => handleSocialSignIn("github")}
            className={`p-6 md:p-8 flex flex-col justify-between cursor-pointer text-left transition-all duration-500 ease-out ${
              hoveredOption === "github"
                ? "md:flex-[1.6] bg-oxblood/20 shadow-inner"
                : hoveredOption !== null
                  ? "md:flex-[0.7] opacity-65"
                  : "md:flex-1"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-brass tracking-widest uppercase">
                  SECTION 03
                </span>
                <svg
                  className={`w-5 h-5 transition-colors ${hoveredOption === "github" ? "fill-brass" : "fill-smoke"}`}
                  viewBox="0 0 24 24"
                  aria-label="GitHub"
                >
                  <title>GitHub</title>
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </div>
              <h2 className="font-valmist text-2xl md:text-3xl text-paper uppercase font-bold tracking-tight">
                GitHub Login
              </h2>
              <p className="font-mono text-xs text-paper-muted mt-2">
                Engineering cryptographic badge through GitHub identity
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-brass font-mono text-xs tracking-wider uppercase">
              <span>AUTHENTICATE NOW</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Revealed Email/Password Form when Email option is active */}
        <AnimatePresence>
          {selectedOption === "email" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="border-t border-brass/40 bg-ink p-6 md:p-10"
            >
              <form onSubmit={handleSubmitEmail} className="max-w-4xl mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label
                      htmlFor="detective-email"
                      className="font-mono text-xs text-brass tracking-[0.2em] uppercase flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4 text-brass" />
                      OPERATIVE TELEGRAPH ADDRESS
                    </label>
                    <input
                      id="detective-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ENTER YOUR OPERATIVE EMAIL..."
                      className="w-full bg-transparent border-b-2 border-brass/40 focus:border-brass py-3 font-valmist text-xl sm:text-2xl text-paper placeholder:text-smoke/50 outline-none transition-colors tracking-wide"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label
                      htmlFor="detective-password"
                      className="font-mono text-xs text-brass tracking-[0.2em] uppercase flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4 text-brass" />
                      ENCRYPTED PASSCODE
                    </label>
                    <input
                      id="detective-password"
                      type="password"
                      required
                      value={password}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="ENTER PASSCODE ENCRYPTION..."
                      className="w-full bg-transparent border-b-2 border-brass/40 focus:border-brass py-3 font-mono text-xl sm:text-2xl text-paper placeholder:text-smoke/50 outline-none transition-colors tracking-widest"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-brass/20">
                  <div className="font-mono text-xs text-paper-muted">
                    New operative without credentials?{" "}
                    <Link
                      href="/signup"
                      className="text-brass hover:text-paper underline underline-offset-4 tracking-wider transition-colors"
                    >
                      ENLIST HERE &rarr;
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto px-10 py-4 bg-oxblood hover:bg-evidence-red text-paper border-2 border-evidence-red font-valmist text-lg font-bold uppercase tracking-widest shadow-xl transition-all cursor-pointer disabled:opacity-40"
                  >
                    {isLoading ? "VERIFYING CLEARANCE..." : "SIGN IN AS OPERATIVE"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dramatic Full-Screen Welcome Animation Overlay */}
      <AnimatePresence>
        {welcomeAgentTag && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink flex flex-col justify-center items-center px-6 overflow-hidden"
          >
            <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
              {/* Line 1: WELCOME (Slides from Left) */}
              <motion.div
                initial={{ x: "-100vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-full text-7xl sm:text-9xl lg:text-[13rem] font-valmist font-extrabold uppercase tracking-tighter text-paper leading-none"
              >
                WELCOME
              </motion.div>

              {/* Line 2: BACK, (Slides from Right) */}
              <motion.div
                initial={{ x: "100vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="w-full text-7xl sm:text-9xl lg:text-[13rem] font-valmist font-extrabold uppercase tracking-tighter text-brass leading-none"
              >
                BACK,
              </motion.div>

              {/* Line 3: AGENT (Slides from Left) */}
              <motion.div
                initial={{ x: "-100vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
                className="w-full text-7xl sm:text-9xl lg:text-[13rem] font-valmist font-extrabold uppercase tracking-tighter text-paper leading-none"
              >
                AGENT
              </motion.div>

              {/* Line 4: 004 (Slides from Right) */}
              <motion.div
                initial={{ x: "100vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.54, ease: [0.16, 1, 0.3, 1] }}
                className="w-full text-7xl sm:text-9xl lg:text-[13rem] font-valmist font-extrabold uppercase tracking-tighter text-evidence-red leading-none"
              >
                {welcomeAgentTag}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
