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
      <div className="w-full h-[460px] md:h-[540px] flex flex-col items-center justify-center border border-brass/20 bg-ink-raised/50 p-6">
        <div className="w-12 h-12 border-2 border-brass border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-mono text-xs text-brass uppercase tracking-widest">
          Generating Operative Dossier Identification...
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

  // Step 0: Initial Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<"email" | "google" | "github" | null>(null);
  const [selectedOption, setSelectedOption] = useState<"email" | "google" | "github">("email");

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
      setErrorMessage("Passcode must contain at least 8 characters.");
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
        setErrorMessage(res.error.message ?? "Registration rejected by Scotland Yard records.");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setStep("agentTag");
    } catch {
      setErrorMessage("Could not connect to Bureau registration server.");
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
      setErrorMessage(`Failed to initiate ${provider} identity clearance.`);
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
      setUsernameError("Callsign must be at least 2 characters.");
      return;
    }

    setIsUsernameChecking(true);
    setUsernameError(null);

    const check = await checkUsernameAvailableAction(cleanUsername);
    if (!check.success || !check.available) {
      setIsUsernameChecking(false);
      setUsernameError(check.error || `Callsign '${cleanUsername}' is already taken.`);
      return;
    }

    // Persist to DB
    const regRes = await registerAgentDetailsAction({
      agentTag,
      username: cleanUsername,
    });
    setIsUsernameChecking(false);

    if (!regRes.success) {
      setUsernameError(regRes.error || "Failed to issue operative warrant.");
      return;
    }

    // Trigger dramatic slide-in welcome
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
      new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
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
    <div className="relative w-full min-h-screen bg-ink text-paper flex flex-col justify-between overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-oxblood/15 via-ink to-ink pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-12 pb-6 flex-1 flex flex-col justify-center">
        {/* STEP 0: CREDENTIALS INTAKE */}
        {step === "credentials" && (
          <header className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="flex-1 text-left w-full">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block w-2.5 h-2.5 bg-brass rounded-full animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-[0.35em] text-brass">
                  SCOTLAND YARD {"//"} ENLISTMENT PROTOCOL
                </span>
              </div>

              <h1 className="font-valmist font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight text-paper uppercase leading-[0.88] select-none">
                Detective
                <br />
                <span className="text-evidence-red">Enlistment</span>
              </h1>

              <p className="mt-6 font-charlea text-lg sm:text-xl md:text-2xl text-paper-muted italic max-w-xl">
                Begin your official appointment to the Criminal Investigation Division. Every
                recruit is granted an encrypted warrant card and casebook.
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

            <div className="w-full lg:w-[480px] shrink-0">
              <DetectiveIDCard3D
                email={email}
                agentTag={agentTag || "???"}
                codename="RECRUIT"
                isPasswordFocused={isPasswordFocused}
              />
            </div>
          </header>
        )}

        {/* STEP 1: CHOOSE AGENT TAG (3 DIGITS) */}
        {step === "agentTag" && (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 max-w-6xl mx-auto w-full py-8">
            <div className="flex-1 w-full text-center lg:text-left">
              <span className="font-mono text-xs uppercase tracking-[0.4em] text-brass block mb-3">
                STEP 01 {"//"} NUMERICAL DESIGNATION
              </span>
              <h2 className="font-valmist font-extrabold text-4xl sm:text-6xl md:text-7xl text-paper uppercase leading-tight">
                Choose Your <span className="text-brass">Agent Tag</span>
              </h2>
              <p className="mt-4 font-charlea text-xl text-paper-muted italic">
                Enter your unique 3-digit operational number. This badge code will seal all closed
                dossiers.
              </p>

              <form onSubmit={handleConfirmTag} className="mt-8 space-y-6">
                <div className="relative inline-block w-full max-w-md">
                  <input
                    type="text"
                    maxLength={3}
                    value={agentTag}
                    onChange={handleTagInput}
                    placeholder="004"
                    className="w-full bg-transparent border-b-4 border-brass/60 focus:border-evidence-red text-center font-valmist font-extrabold text-7xl sm:text-9xl text-paper placeholder:text-smoke/30 outline-none tracking-widest py-4 transition-colors"
                  />
                  <span className="font-mono text-xs text-smoke block mt-3 uppercase tracking-widest">
                    [ THREE DIGITS ONLY — E.G. 004 ]
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

            <div className="w-full lg:w-[480px] shrink-0">
              <DetectiveIDCard3D email={email} agentTag={agentTag || "004"} codename="RECRUIT" />
            </div>
          </div>
        )}

        {/* STEP 2: USERNAME / CALLSIGN SELECTION */}
        {step === "username" && (
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 max-w-6xl mx-auto w-full py-8">
            <div className="flex-1 w-full text-center lg:text-left">
              <span className="font-mono text-xs uppercase tracking-[0.4em] text-brass block mb-3">
                STEP 02 {"//"} CALL SIGN REGISTRATION
              </span>
              <h2 className="font-valmist font-extrabold text-4xl sm:text-6xl md:text-7xl text-paper uppercase leading-tight">
                What should <span className="text-brass">I call you?</span>
              </h2>
              <p className="mt-4 font-charlea text-xl text-paper-muted italic">
                Enter your detective name or investigative pseudonym for the Bureau roster.
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
                    className="w-full bg-transparent border-b-4 border-brass/60 focus:border-evidence-red text-center lg:text-left font-valmist font-bold text-3xl sm:text-5xl text-paper placeholder:text-smoke/30 outline-none tracking-wide py-4 transition-colors uppercase"
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

            <div className="w-full lg:w-[480px] shrink-0">
              <DetectiveIDCard3D
                email={email}
                agentTag={agentTag}
                codename={username || "INSPECTOR"}
              />
            </div>
          </div>
        )}

        {/* STEP 4: RULES PAGE & COMPLETE TRAINING STAMP */}
        {step === "rules" && (
          <div className="max-w-4xl mx-auto w-full py-8">
            {/* Authentic Aged Paper / Legal Document */}
            <div className="bg-[#E7DDC8] text-[#120f0d] p-8 sm:p-12 md:p-16 border-4 border-brass shadow-2xl relative">
              {/* Paper Top Header */}
              <div className="flex items-center justify-between border-b-2 border-dashed border-[#120f0d]/30 pb-6 mb-8">
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#78716a] block">
                    SPECIAL BRANCH {"//"} SCOTLAND YARD, SW1
                  </span>
                  <h2 className="font-valmist font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-[#120f0d] mt-1">
                    Operative Directives & Code
                  </h2>
                </div>
                <div className="text-right font-mono text-xs text-[#78716a]">
                  <div>WARRANT NO: SY-{agentTag}-883</div>
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
                    Puzzles must be solved across five numbered sections. Unresolved enigmas yield
                    no clues until solved through intellect, observation, or authorized informants.
                  </p>
                </div>

                <div className="border-l-4 border-oxblood pl-4">
                  <h3 className="font-valmist font-bold text-base sm:text-lg uppercase text-[#641b1b]">
                    2. Chronological Evidence Pinboard
                  </h3>
                  <p className="mt-1">
                    Unlocked evidence cards must be arranged in exact temporal order upon the
                    corkboard. An incorrect sequence will penalize case resolution score.
                  </p>
                </div>

                <div className="border-l-4 border-oxblood pl-4">
                  <h3 className="font-valmist font-bold text-base sm:text-lg uppercase text-[#641b1b]">
                    3. Scotland Yard Vault Integrity
                  </h3>
                  <p className="mt-1">
                    Correct solutions are protected within the central ledger. Any client-side
                    manipulation or deceptive breach results in immediate warrant revocation.
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
                  <span>I agree to the Terms of Service for Scotland Yard Field Operatives.</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={privacyAccepted}
                    onChange={(e) => setPrivacyAccepted(e.target.checked)}
                    className="w-4 h-4 accent-oxblood"
                  />
                  <span>
                    I acknowledge the Departmental Privacy Notice and data processing terms.
                  </span>
                </label>
              </div>

              {/* Rubber Stamp Interactive Target */}
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
                        CERTIFIED BY SCOTLAND YARD • {stampDate}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM OPTIONS (Only shown on Step 0: credentials) */}
      {step === "credentials" && (
        <div className="relative z-10 w-full border-t border-brass/30 bg-ink-raised/90 backdrop-blur-md">
          <div className="w-full flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-brass/30 transition-all duration-500 ease-out">
            {/* OPTION 1: Email Enlistment */}
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
                    OPTION 01
                  </span>
                  <Mail
                    className={`w-5 h-5 transition-colors ${hoveredOption === "email" ? "text-brass" : "text-smoke"}`}
                  />
                </div>
                <h2 className="font-valmist text-2xl md:text-3xl text-paper uppercase font-bold tracking-tight">
                  Email Enlistment
                </h2>
                <p className="font-mono text-xs text-paper-muted mt-2">
                  Create warrant through telegraph and confidential passcode
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-brass font-mono text-xs tracking-wider uppercase">
                <span>{selectedOption === "email" ? "ACTIVE ENTRY" : "SELECT TO ENLIST"}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            {/* OPTION 2: Google Enlistment */}
            <button
              type="button"
              onMouseEnter={() => setHoveredOption("google")}
              onMouseLeave={() => setHoveredOption(null)}
              onClick={() => handleSocialSignUp("google")}
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
                    OPTION 02
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
                  Google Enlistment
                </h2>
                <p className="font-mono text-xs text-paper-muted mt-2">
                  Rapid recruitment via Google profile identity
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-brass font-mono text-xs tracking-wider uppercase">
                <span>ENLIST VIA GOOGLE</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            {/* OPTION 3: GitHub Enlistment */}
            <button
              type="button"
              onMouseEnter={() => setHoveredOption("github")}
              onMouseLeave={() => setHoveredOption(null)}
              onClick={() => handleSocialSignUp("github")}
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
                    OPTION 03
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
                  GitHub Enlistment
                </h2>
                <p className="font-mono text-xs text-paper-muted mt-2">
                  Technical recruitment via GitHub cryptographic key
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-brass font-mono text-xs tracking-wider uppercase">
                <span>ENLIST VIA GITHUB</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>

          {/* Form when Email Option is Active */}
          <AnimatePresence>
            {selectedOption === "email" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="border-t border-brass/40 bg-ink p-6 md:p-10"
              >
                <form onSubmit={handleCredentialsSubmit} className="max-w-4xl mx-auto space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label
                        htmlFor="signup-email"
                        className="font-mono text-xs text-brass tracking-[0.2em] uppercase flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4 text-brass" />
                        TELEGRAPH ADDRESS (EMAIL)
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ENTER YOUR OPERATIVE EMAIL..."
                        className="w-full bg-transparent border-b-2 border-brass/40 focus:border-brass py-3 font-valmist text-xl sm:text-2xl text-paper placeholder:text-smoke/50 outline-none transition-colors tracking-wide"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="signup-password"
                        className="font-mono text-xs text-brass tracking-[0.2em] uppercase flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4 text-brass" />
                        CONFIDENTIAL PASSCODE
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
                        className="w-full bg-transparent border-b-2 border-brass/40 focus:border-brass py-3 font-mono text-xl sm:text-2xl text-paper placeholder:text-smoke/50 outline-none transition-colors tracking-widest"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-brass/20">
                    <div className="font-mono text-xs text-paper-muted">
                      Already hold an active warrant?{" "}
                      <Link
                        href="/login"
                        className="text-brass hover:text-paper underline underline-offset-4 tracking-wider transition-colors"
                      >
                        SIGN IN &rarr;
                      </Link>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto px-10 py-4 bg-oxblood hover:bg-evidence-red text-paper border-2 border-evidence-red font-valmist text-lg font-bold uppercase tracking-widest shadow-xl transition-all cursor-pointer disabled:opacity-40"
                    >
                      {isLoading ? "FILING ENLISTMENT..." : "PROCEED TO BADGE ASSIGNMENT"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

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
