"use client";

import { ArrowRight, Lock, Mail, ShieldAlert, Stamp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import {
  checkAgentTagAvailableAction,
  checkUsernameAvailableAction,
  completeTrainingAction,
  recordLegalConsentAction,
  registerAgentDetailsAction,
} from "@/server/actions/auth-actions";

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

type Step = "credentials" | "agentTag" | "username" | "welcome" | "rules";

export function SignupForm() {
  const router = useRouter();

  // Wizard Step
  const [step, setStep] = useState<Step>("credentials");

  // Step 0: Initial Credentials & Vertical Stack
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<"email" | "google" | "github" | null>(null);
  const [expandedOption, setExpandedOption] = useState<"email" | "google" | "github" | null>(
    "email",
  );

  // Step 1: Agent Tag (3 digits)
  const [agentTag, setAgentTag] = useState("");
  const [isTagChecking, setIsTagChecking] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);

  // Step 2: Username
  const [username, setUsername] = useState("");
  const [isUsernameChecking, setIsUsernameChecking] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Step 4: Rules & Legal Parchment
  const [isOver13, setIsOver13] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isStamped, setIsStamped] = useState(false);
  const [stampDate, setStampDate] = useState<string>("");

  // Generic loading & error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle Initial Email / Password Submission
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    if (password.length < 8) {
      setErrorMessage("Password must contain at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signUp.email({
        email: email.trim(),
        password,
        name: "Provisional Operative",
      });

      if (res.error) {
        setErrorMessage(res.error.message ?? "Registration rejected by records.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setStep("agentTag");
    } catch {
      setErrorMessage("Could not connect to registration server.");
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = async (provider: "github" | "google") => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signIn.social({
        provider,
        callbackURL: "/signup?step=agentTag",
      });
    } catch {
      setErrorMessage(`Failed to initiate ${provider} registration.`);
      setIsLoading(false);
    }
  };

  // Handle Step 1: Agent Tag Confirmation (Exactly 3 Digits)
  const handleTagInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 3);
    setAgentTag(val);
    setTagError(null);
  };

  const handleConfirmTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (agentTag.length !== 3) {
      setTagError("Agent tag must be exactly three numeric digits (e.g. 004).");
      return;
    }

    setIsTagChecking(true);
    setTagError(null);

    const check = await checkAgentTagAvailableAction(agentTag);
    setIsTagChecking(false);

    if (!check.success || !check.available) {
      setTagError(check.error || `Agent ${agentTag} has already been assigned.`);
      return;
    }

    setStep("username");
  };

  // Handle Step 2: Username Confirmation
  const handleConfirmUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    if (cleanUsername.length < 2) {
      setUsernameError("Detective name must be at least 2 characters.");
      return;
    }

    setIsUsernameChecking(true);
    setUsernameError(null);

    const check = await checkUsernameAvailableAction(cleanUsername);
    if (!check.success || !check.available) {
      setIsUsernameChecking(false);
      setUsernameError(check.error || `Username '${cleanUsername}' is already taken.`);
      return;
    }

    const regRes = await registerAgentDetailsAction({
      agentTag,
      username: cleanUsername,
    });
    setIsUsernameChecking(false);

    if (!regRes.success) {
      setUsernameError(regRes.error || "Failed to issue operative warrant.");
      return;
    }

    setStep("welcome");
    setTimeout(() => {
      setStep("rules");
    }, 2800);
  };

  // Handle Step 4: Stamping "Complete Training"
  const handleStampTraining = async () => {
    if (!isOver13 || !termsAccepted || !privacyAccepted) {
      setErrorMessage("You must accept all legal requirements before receiving active clearance.");
      return;
    }

    setIsLoading(true);
    setIsStamped(true);
    setStampDate(
      new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    );

    try {
      await recordLegalConsentAction({
        isOver13: true,
        termsAccepted: true,
        privacyAccepted: true,
      });
      await completeTrainingAction();

      setTimeout(() => {
        router.push("/cases");
      }, 1600);
    } catch {
      setIsLoading(false);
      setIsStamped(false);
      setErrorMessage("Failed to record training certification.");
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-ink text-paper flex items-center justify-center overflow-x-hidden p-4 sm:p-8 lg:p-12">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-oxblood/15 via-ink to-ink pointer-events-none" />

      {/* Main Container: Covers 85-90% of viewport */}
      <div className="relative z-10 w-full max-w-[94vw] min-h-[88vh] mx-auto flex flex-col justify-center">
        {/* STEP 0: CREDENTIALS INTAKE WITH SAME SPLIT LAYOUT */}
        {step === "credentials" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* LEFT COLUMN: Dominant Area (~67% on desktop) */}
            <div className="lg:col-span-8 flex flex-col justify-center text-left">
              {/* Top Switcher: Minimal & Bold */}
              <div className="flex items-center justify-between mb-4 border-b border-brass/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-brass rounded-full animate-pulse" />
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-brass">
                    NO SHIT SHERLOCK {"//"} REGISTRATION
                  </span>
                </div>

                {/* Mode Switcher Pill */}
                <div className="inline-flex items-center border border-brass/40 bg-ink-raised p-1 rounded-sm font-mono text-xs tracking-wider">
                  <Link
                    href="/login"
                    className="px-4 py-1.5 text-paper-muted hover:text-paper uppercase transition-colors"
                  >
                    SIGN IN
                  </Link>
                  <span className="px-4 py-1.5 bg-evidence-red text-paper font-bold uppercase shadow-sm select-none">
                    SIGN UP
                  </span>
                </div>
              </div>

              {/* Viewport-Dominating Main Typography */}
              <h1 className="font-valmist font-extrabold text-6xl sm:text-7xl md:text-8xl lg:text-[7.8rem] xl:text-[8.5rem] tracking-tight text-paper uppercase leading-[0.88] select-none">
                Detective
                <br />
                <span className="text-evidence-red">Sign Up</span>
              </h1>

              <p className="mt-4 font-charlea text-xl sm:text-2xl text-paper-muted italic max-w-2xl">
                Begin your appointment to the Department of Unresolved Investigations. Every recruit
                receives an interactive warrant badge and evidence book.
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
                {/* ROW 1: EMAIL SIGN UP */}
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
                          Email Sign Up
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
                        <form onSubmit={handleCredentialsSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label
                                htmlFor="signup-email"
                                className="font-mono text-xs text-brass tracking-widest uppercase flex items-center gap-2"
                              >
                                <Mail className="w-3.5 h-3.5 text-brass" />
                                EMAIL ADDRESS
                              </label>
                              <input
                                id="signup-email"
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
                                htmlFor="signup-password"
                                className="font-mono text-xs text-brass tracking-widest uppercase flex items-center gap-2"
                              >
                                <Lock className="w-3.5 h-3.5 text-brass" />
                                PASSWORD
                              </label>
                              <input
                                id="signup-password"
                                type="password"
                                required
                                minLength={8}
                                value={password}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="MINIMUM 8 CHARACTERS..."
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
                              {isLoading ? "FILING..." : "PROCEED TO AGENT TAG &rarr;"}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ROW 2: GOOGLE SIGN UP */}
                <button
                  type="button"
                  onMouseEnter={() => setHoveredOption("google")}
                  onMouseLeave={() => setHoveredOption(null)}
                  onClick={() => handleSocialSignUp("google")}
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
                        Google Sign Up
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs text-brass tracking-widest uppercase">
                    <span>CONTINUE WITH GOOGLE</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>

                {/* ROW 3: GITHUB SIGN UP */}
                <button
                  type="button"
                  onMouseEnter={() => setHoveredOption("github")}
                  onMouseLeave={() => setHoveredOption(null)}
                  onClick={() => handleSocialSignUp("github")}
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
                        GitHub Sign Up
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
                agentTag={agentTag || "???"}
                codename="RECRUIT"
                isPasswordFocused={isPasswordFocused}
                hoveredProvider={hoveredOption}
              />
            </div>
          </div>
        )}

        {/* STEP 1: CHOOSE AGENT TAG (Morphing layout, card shifts smoothly) */}
        {step === "agentTag" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
          >
            <div className="lg:col-span-8 flex flex-col justify-center text-left">
              <span className="font-mono text-xs uppercase tracking-[0.4em] text-brass block mb-3">
                STEP 01 {"//"} NUMERICAL DESIGNATION
              </span>
              <h2 className="font-valmist font-extrabold text-5xl sm:text-7xl md:text-8xl text-paper uppercase leading-tight">
                Choose Your <span className="text-brass">Agent Tag</span>
              </h2>
              <p className="mt-4 font-charlea text-xl sm:text-2xl text-paper-muted italic max-w-xl">
                Type your permanent 3-digit badge number. This code will seal your dossiers and
                appears live on your warrant badge.
              </p>

              <form onSubmit={handleConfirmTag} className="mt-8 space-y-6">
                <div className="relative inline-block w-full max-w-md">
                  <input
                    type="text"
                    maxLength={3}
                    value={agentTag}
                    onChange={handleTagInput}
                    placeholder="004"
                    className="w-full bg-transparent border-b-4 border-brass/60 focus:border-evidence-red text-left font-valmist font-extrabold text-7xl sm:text-9xl text-paper placeholder:text-smoke/30 outline-none tracking-widest py-3 transition-colors"
                  />
                  <span className="font-mono text-xs text-smoke block mt-2 uppercase tracking-widest">
                    [ EXACTLY THREE DIGITS — E.G. 004 ]
                  </span>
                </div>

                {tagError && (
                  <p className="font-mono text-xs text-evidence-red tracking-wider">{tagError}</p>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={agentTag.length !== 3 || isTagChecking}
                    className="px-10 py-4 bg-oxblood hover:bg-evidence-red border-2 border-evidence-red text-paper font-valmist font-bold text-lg uppercase tracking-widest shadow-xl transition-all cursor-pointer disabled:opacity-40"
                  >
                    {isTagChecking ? "VERIFYING BADGE..." : "CONFIRM DESIGNATION &rarr;"}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-4 flex items-center justify-center w-full">
              <DetectiveIDCard3D email={email} agentTag={agentTag || "004"} codename="RECRUIT" />
            </div>
          </motion.div>
        )}

        {/* STEP 2: USERNAME / CALLSIGN (Morphing card layout) */}
        {step === "username" && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
          >
            <div className="lg:col-span-8 flex flex-col justify-center text-left">
              <span className="font-mono text-xs uppercase tracking-[0.4em] text-brass block mb-3">
                STEP 02 {"//"} CALLSIGN ENGRAVING
              </span>
              <h2 className="font-valmist font-extrabold text-5xl sm:text-7xl md:text-8xl text-paper uppercase leading-tight">
                What should <span className="text-brass">I call you?</span>
              </h2>
              <p className="mt-4 font-charlea text-xl sm:text-2xl text-paper-muted italic max-w-xl">
                Enter your detective moniker or investigative callsign. This will be engraved onto
                your warrant badge.
              </p>

              <form onSubmit={handleConfirmUsername} className="mt-8 space-y-6">
                <div className="relative inline-block w-full max-w-lg">
                  <input
                    type="text"
                    maxLength={30}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setUsernameError(null);
                    }}
                    placeholder="INSPECTOR VANCE"
                    className="w-full bg-transparent border-b-4 border-brass/60 focus:border-evidence-red text-left font-valmist font-bold text-3xl sm:text-5xl text-paper placeholder:text-smoke/30 outline-none tracking-wide py-3 transition-colors uppercase"
                  />
                </div>

                {usernameError && (
                  <p className="font-mono text-xs text-evidence-red tracking-wider">
                    {usernameError}
                  </p>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={username.trim().length < 2 || isUsernameChecking}
                    className="px-10 py-4 bg-oxblood hover:bg-evidence-red border-2 border-evidence-red text-paper font-valmist font-bold text-lg uppercase tracking-widest shadow-xl transition-all cursor-pointer disabled:opacity-40"
                  >
                    {isUsernameChecking ? "ENGRAVING WARRANT..." : "FINALIZE CREDENTIALS &rarr;"}
                  </button>
                </div>
              </form>
            </div>

            <div className="lg:col-span-4 flex items-center justify-center w-full">
              <DetectiveIDCard3D
                email={email}
                agentTag={agentTag}
                codename={username || "INSPECTOR"}
              />
            </div>
          </motion.div>
        )}

        {/* STEP 4: RULES PAGE & COMPLETE TRAINING STAMP */}
        {step === "rules" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto w-full py-4"
          >
            {/* Authentic Aged Paper / Legal Document */}
            <div className="bg-[#E7DDC8] text-[#120f0d] p-8 sm:p-12 md:p-16 border-4 border-brass shadow-2xl relative">
              {/* Paper Top Header */}
              <div className="flex items-center justify-between border-b-2 border-dashed border-[#120f0d]/30 pb-6 mb-8">
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#78716a] block">
                    DEPARTMENT OF UNRESOLVED INVESTIGATIONS {"//"} DOSSIER PROTOCOL
                  </span>
                  <h2 className="font-valmist font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-[#120f0d] mt-1">
                    Operative Directives & Rules
                  </h2>
                </div>
                <div className="text-right font-mono text-xs text-[#78716a]">
                  <div>WARRANT: NSS-{agentTag || "004"}-883</div>
                  <div>SECURITY CLASS: IV</div>
                </div>
              </div>

              {/* Rules List */}
              <div className="space-y-6 font-selnora text-lg sm:text-xl text-[#1c1714] leading-relaxed">
                <div className="border-l-4 border-oxblood pl-4">
                  <h3 className="font-valmist font-bold text-base sm:text-lg uppercase text-[#641b1b]">
                    1. Sequential Dossier Investigation
                  </h3>
                  <p className="mt-1">
                    Cold cases unfold across five numbered puzzle sections. Clues remain concealed
                    within crime scene envelopes until unlocked through deduction or authorized hint
                    consultation.
                  </p>
                </div>

                <div className="border-l-4 border-oxblood pl-4">
                  <h3 className="font-valmist font-bold text-base sm:text-lg uppercase text-[#641b1b]">
                    2. Chronological Evidence Pinboard
                  </h3>
                  <p className="mt-1">
                    Collected evidence cards must be arranged in exact temporal order upon the
                    corkboard. Erroneous timeline deductions will penalize final clearance scores.
                  </p>
                </div>

                <div className="border-l-4 border-oxblood pl-4">
                  <h3 className="font-valmist font-bold text-base sm:text-lg uppercase text-[#641b1b]">
                    3. Server-Authoritative Integrity
                  </h3>
                  <p className="mt-1">
                    Correct solutions are sealed within the departmental vault. Client-side
                    tampering or fraudulent deduction attempts invalidate the operative's active
                    warrant.
                  </p>
                </div>
              </div>

              {/* Legal Confirmations */}
              <div className="mt-10 pt-6 border-t-2 border-dashed border-[#120f0d]/30 space-y-3 font-mono text-xs text-[#2d241e]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOver13}
                    onChange={(e) => setIsOver13(e.target.checked)}
                    className="w-4 h-4 accent-oxblood"
                  />
                  <span>I confirm that I am at least 13 years of age.</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 accent-oxblood"
                  />
                  <span>
                    I agree to the Terms of Service for No Shit Sherlock field operatives.
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="w-4 h-4 accent-oxblood"
                  />
                  <span>
                    I acknowledge the Departmental Privacy Notice and data processing policies.
                  </span>
                </label>
              </div>

              {/* Rubber Stamp Target */}
              <div className="mt-12 pt-6 border-t border-[#120f0d]/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="font-mono text-xs text-[#78716a]">
                  Affix official rubber stamp below to certify readiness and unlock case dossiers.
                </div>

                <div className="relative">
                  {!isStamped ? (
                    <button
                      type="button"
                      onClick={handleStampTraining}
                      disabled={isLoading}
                      className="px-8 py-5 border-4 border-dashed border-evidence-red text-evidence-red hover:bg-evidence-red/10 font-valmist font-extrabold text-xl uppercase tracking-widest cursor-pointer transition-all active:scale-95 flex items-center gap-3 shadow-md"
                    >
                      <Stamp className="w-6 h-6 text-evidence-red" />
                      <span>[ STAMP: COMPLETE TRAINING ]</span>
                    </button>
                  ) : (
                    <motion.div
                      initial={{ scale: 2, opacity: 0, rotate: -15 }}
                      animate={{ scale: 1, opacity: 1, rotate: -6 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="border-8 border-evidence-red text-evidence-red p-4 font-stamp font-extrabold text-2xl uppercase tracking-widest text-center shadow-2xl bg-paper/60 backdrop-blur-xs select-none"
                    >
                      <div className="text-3xl font-extrabold">TRAINING COMPLETED</div>
                      <div className="text-xs font-mono tracking-normal mt-1">
                        NO SHIT SHERLOCK • CERTIFIED • {stampDate}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Dramatic Slide-in Welcome Animation between step 2 and step 4 */}
      <AnimatePresence>
        {step === "welcome" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink flex flex-col justify-center items-center px-6 overflow-hidden"
          >
            <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
              {/* Line 1: WELCOME, (Slides from Left) */}
              <motion.div
                initial={{ x: "-100vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="w-full text-7xl sm:text-9xl lg:text-[13rem] font-valmist font-extrabold uppercase tracking-tighter text-paper leading-none"
              >
                WELCOME,
              </motion.div>

              {/* Line 2: AGENT (Slides from Right) */}
              <motion.div
                initial={{ x: "100vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full text-7xl sm:text-9xl lg:text-[13rem] font-valmist font-extrabold uppercase tracking-tighter text-brass leading-none"
              >
                AGENT
              </motion.div>

              {/* Line 3: 004 (Slides from Left) */}
              <motion.div
                initial={{ x: "-100vw", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full text-7xl sm:text-9xl lg:text-[13rem] font-valmist font-extrabold uppercase tracking-tighter text-evidence-red leading-none"
              >
                {agentTag || "004"}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
