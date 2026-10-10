"use client";

import { ArrowRight, Lock, Mail, ShieldAlert } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { getAgentDetailsAction } from "@/server/actions/auth-actions";

const DetectiveIDCard3D = dynamic(
  () => import("./DetectiveIDCard3D").then((mod) => mod.DetectiveIDCard3D),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[620px] lg:h-[780px] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-2 border-brass border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-mono text-xs text-brass uppercase tracking-widest text-center">
          Materializing Operative Dossier Identification...
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

  // Vertical accordion state
  const [hoveredOption, setHoveredOption] = useState<"email" | "google" | "github" | null>(null);
  const [expandedOption, setExpandedOption] = useState<"email" | "google" | "github" | null>(
    "email",
  );

  // Full screen welcome slide-in
  const [welcomeAgentTag, setWelcomeAgentTag] = useState<string | null>(null);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn.email({
        email: email.trim(),
        password,
      });

      if (res.error) {
        setErrorMessage(res.error.message ?? "Authentication failed. Check email and password.");
        setIsLoading(false);
        return;
      }

      const details = await getAgentDetailsAction(email);
      const tag = details.success && details.agentTag ? details.agentTag : "004";

      setWelcomeAgentTag(tag);

      setTimeout(() => {
        router.push(callbackUrl);
      }, 2600);
    } catch {
      setErrorMessage("Authentication server unreachable. Please retry.");
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
      setErrorMessage(`Failed to initiate ${provider} sign in.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-ink text-paper flex items-center justify-center overflow-x-hidden p-4 sm:p-8 lg:p-12">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-oxblood/15 via-ink to-ink pointer-events-none" />

      {/* Main Container: Covers 85-90% of viewport */}
      <div className="relative z-10 w-full max-w-[94vw] min-h-[88vh] mx-auto flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* LEFT COLUMN: Dominant Area (~67% on desktop) */}
          <div className="lg:col-span-8 flex flex-col justify-center text-left">
            {/* Top Bar Switcher */}
            <div className="flex items-center justify-between mb-4 border-b border-brass/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-evidence-red rounded-full animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-brass">
                  NO SHIT SHERLOCK {"//"} IDENTITY CLEARANCE
                </span>
              </div>

              {/* Mode Switcher Pill */}
              <div className="inline-flex items-center border border-brass/40 bg-ink-raised p-1 rounded-sm font-mono text-xs tracking-wider">
                <span className="px-4 py-1.5 bg-brass text-ink font-bold uppercase shadow-sm select-none">
                  SIGN IN
                </span>
                <Link
                  href="/signup"
                  className="px-4 py-1.5 text-paper-muted hover:text-paper uppercase transition-colors"
                >
                  SIGN UP
                </Link>
              </div>
            </div>

            {/* Viewport-Dominating Main Typography */}
            <h1 className="font-valmist font-extrabold text-6xl sm:text-7xl md:text-8xl lg:text-[7.8rem] xl:text-[8.5rem] tracking-tight text-paper uppercase leading-[0.88] select-none">
              Detective
              <br />
              <span className="text-brass">Sign In</span>
            </h1>

            <p className="mt-4 font-charlea text-xl sm:text-2xl text-paper-muted italic max-w-2xl">
              Access cold case dossiers, evidence notebooks, and chronological pinboards.
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

            {/* Vertical Stack: Noticeably expands on hover */}
            <div className="mt-8 border border-brass/40 bg-ink-raised/80 divide-y divide-brass/30 shadow-2xl transition-all duration-300">
              {/* ROW 1: EMAIL LOGIN */}
              <div
                className={`transition-all duration-300 ease-out ${
                  hoveredOption === "email"
                    ? "bg-oxblood/25 border-l-4 border-l-brass"
                    : hoveredOption !== null
                      ? "opacity-55"
                      : ""
                } ${expandedOption === "email" ? "bg-ink-raised" : ""}`}
              >
                <button
                  type="button"
                  onMouseEnter={() => setHoveredOption("email")}
                  onMouseLeave={() => setHoveredOption(null)}
                  onClick={() => setExpandedOption((prev) => (prev === "email" ? null : "email"))}
                  className={`w-full px-6 sm:px-8 flex items-center justify-between text-left cursor-pointer transition-all duration-300 ${
                    hoveredOption === "email"
                      ? "py-8 md:py-10"
                      : hoveredOption !== null
                        ? "py-4 md:py-4.5"
                        : "py-6"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Mail
                      className={`w-6 h-6 transition-colors ${
                        hoveredOption === "email" || expandedOption === "email"
                          ? "text-brass"
                          : "text-smoke"
                      }`}
                    />
                    <div>
                      <span className="font-mono text-xs text-brass tracking-widest uppercase">
                        OPTION 01
                      </span>
                      <h2 className="font-valmist text-2xl md:text-3xl text-paper uppercase font-bold tracking-tight mt-0.5">
                        Email Login
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs text-brass tracking-widest uppercase">
                    <span>{expandedOption === "email" ? "COLLAPSE" : "OPEN INPUTS"}</span>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform duration-300 ${
                        expandedOption === "email" ? "rotate-90" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* In-Place Revealed Form */}
                <AnimatePresence>
                  {expandedOption === "email" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="border-t border-brass/30 bg-ink px-6 sm:px-8 py-6 overflow-hidden"
                    >
                      <form onSubmit={handleSubmitEmail} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label
                              htmlFor="login-email"
                              className="font-mono text-xs text-brass tracking-widest uppercase flex items-center gap-2"
                            >
                              <Mail className="w-3.5 h-3.5 text-brass" />
                              EMAIL ADDRESS
                            </label>
                            <input
                              id="login-email"
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="ENTER YOUR EMAIL..."
                              className="w-full bg-transparent border-b-2 border-brass/40 focus:border-brass py-2.5 font-valmist text-xl sm:text-2xl text-paper placeholder:text-smoke/50 outline-none transition-colors tracking-wide"
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="login-password"
                              className="font-mono text-xs text-brass tracking-widest uppercase flex items-center gap-2"
                            >
                              <Lock className="w-3.5 h-3.5 text-brass" />
                              PASSWORD
                            </label>
                            <input
                              id="login-password"
                              type="password"
                              required
                              value={password}
                              onFocus={() => setIsPasswordFocused(true)}
                              onBlur={() => setIsPasswordFocused(false)}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="ENTER YOUR PASSWORD..."
                              className="w-full bg-transparent border-b-2 border-brass/40 focus:border-brass py-2.5 font-mono text-xl sm:text-2xl text-paper placeholder:text-smoke/50 outline-none transition-colors tracking-widest"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                          <span className="font-mono text-xs text-paper-muted">
                            Click ID badge anytime to inspect reverse.
                          </span>
                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto px-8 py-3.5 bg-oxblood hover:bg-evidence-red text-paper border-2 border-evidence-red font-valmist text-base font-bold uppercase tracking-widest shadow-xl transition-all cursor-pointer disabled:opacity-40"
                          >
                            {isLoading ? "VERIFYING..." : "SIGN IN"}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ROW 2: GOOGLE LOGIN */}
              <button
                type="button"
                onMouseEnter={() => setHoveredOption("google")}
                onMouseLeave={() => setHoveredOption(null)}
                onClick={() => handleSocialSignIn("google")}
                className={`w-full px-6 sm:px-8 flex items-center justify-between text-left cursor-pointer transition-all duration-300 ease-out ${
                  hoveredOption === "google"
                    ? "py-8 md:py-10 bg-oxblood/25 border-l-4 border-l-brass"
                    : hoveredOption !== null
                      ? "py-4 md:py-4.5 opacity-55"
                      : "py-6"
                }`}
              >
                <div className="flex items-center gap-4">
                  <svg
                    className={`w-6 h-6 transition-colors ${
                      hoveredOption === "google" ? "fill-brass" : "fill-smoke"
                    }`}
                    viewBox="0 0 24 24"
                    aria-label="Google"
                  >
                    <title>Google</title>
                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                  </svg>
                  <div>
                    <span className="font-mono text-xs text-brass tracking-widest uppercase">
                      OPTION 02
                    </span>
                    <h2 className="font-valmist text-2xl md:text-3xl text-paper uppercase font-bold tracking-tight mt-0.5">
                      Google Login
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs text-brass tracking-widest uppercase">
                  <span>CONTINUE WITH GOOGLE</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              {/* ROW 3: GITHUB LOGIN */}
              <button
                type="button"
                onMouseEnter={() => setHoveredOption("github")}
                onMouseLeave={() => setHoveredOption(null)}
                onClick={() => handleSocialSignIn("github")}
                className={`w-full px-6 sm:px-8 flex items-center justify-between text-left cursor-pointer transition-all duration-300 ease-out ${
                  hoveredOption === "github"
                    ? "py-8 md:py-10 bg-oxblood/25 border-l-4 border-l-brass"
                    : hoveredOption !== null
                      ? "py-4 md:py-4.5 opacity-55"
                      : "py-6"
                }`}
              >
                <div className="flex items-center gap-4">
                  <svg
                    className={`w-6 h-6 transition-colors ${
                      hoveredOption === "github" ? "fill-brass" : "fill-smoke"
                    }`}
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
                  <div>
                    <span className="font-mono text-xs text-brass tracking-widest uppercase">
                      OPTION 03
                    </span>
                    <h2 className="font-valmist text-2xl md:text-3xl text-paper uppercase font-bold tracking-tight mt-0.5">
                      GitHub Login
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs text-brass tracking-widest uppercase">
                  <span>CONTINUE WITH GITHUB</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: 3D Warrant Card (~33% width, Borderless Canvas) */}
          <div className="lg:col-span-4 flex items-center justify-center w-full">
            <DetectiveIDCard3D
              email={email}
              agentTag="004"
              isPasswordFocused={isPasswordFocused}
              hoveredProvider={hoveredOption}
            />
          </div>
        </div>
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
