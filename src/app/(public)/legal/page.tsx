import { ArrowLeft, FileText, Home, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { NoirButton } from "@/components/ui/noir-button";

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#100D0D] text-[#E8DCC8] py-16 px-4 sm:px-6 lg:px-8 selection:bg-[#A7192D] selection:text-[#E8DCC8]">
      <div className="max-w-4xl mx-auto border-2 border-[#79604A]/60 bg-[#181414] p-8 md:p-14 shadow-2xl space-y-12 relative overflow-hidden">
        {/* Top Header Badge */}
        <header className="border-b border-[#79604A]/30 pb-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#A7192D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#A7192D]" />
              STATUTORY COMPLIANCE {"//"} CENTRAL OPERATIVE REGISTRY
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#A69A8C] hover:text-[#E8DCC8] transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Home</span>
            </Link>
          </div>
          <h1 className="font-valmist text-3xl sm:text-5xl text-[#E8DCC8] font-bold uppercase tracking-tight">
            Statutory Directives, Terms of Service & Privacy Protocol
          </h1>
          <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-[#79604A]">
            <span>DOCUMENT VERSION: 2026.2</span>
            <span>&bull;</span>
            <span>EFFECTIVE DATE: OCTOBER 2026</span>
            <span>&bull;</span>
            <span className="text-[#A7192D]">JURISDICTION: GLOBAL STANDARDS & GDPR/COPPA</span>
          </div>

          {/* Table of Contents Quick Nav */}
          <nav className="mt-6 flex flex-wrap gap-3 border-t border-[#79604A]/20 pt-4">
            <a
              href="#terms"
              className="border border-[#79604A]/40 bg-[#100D0D] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#E8DCC8] hover:border-[#A7192D] transition-colors"
            >
              1. Terms of Service
            </a>
            <a
              href="#privacy"
              className="border border-[#79604A]/40 bg-[#100D0D] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#E8DCC8] hover:border-[#A7192D] transition-colors"
            >
              2. Privacy Policy
            </a>
            <a
              href="#data-processing"
              className="border border-[#79604A]/40 bg-[#100D0D] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#E8DCC8] hover:border-[#A7192D] transition-colors"
            >
              3. Data Processing Policy
            </a>
            <a
              href="#fair-play"
              className="border border-[#79604A]/40 bg-[#100D0D] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#E8DCC8] hover:border-[#A7192D] transition-colors"
            >
              4. Fair Play & Scoring
            </a>
          </nav>
        </header>

        {/* =========================================================================
            SECTION 1: TERMS OF SERVICE
           ========================================================================= */}
        <section id="terms" className="space-y-6 scroll-mt-12">
          <div className="border-b border-[#79604A]/30 pb-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#A7192D]">
              PROTOCOL CLAUSE 01
            </span>
            <h2 className="font-valmist text-2xl sm:text-3xl text-[#E8DCC8] font-bold uppercase tracking-wide">
              1. Terms of Service & Operative Agreement
            </h2>
          </div>

          <div className="space-y-4 font-serif text-sm text-[#C8BDAA] leading-relaxed">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#E8DCC8] font-bold">
              1.1 Acceptance of Terms
            </h3>
            <p>
              By enrolling as an operative, creating an investigation account, participating in
              multiplayer syndicates, or accessing the NoShitSherlock platform (&quot;the
              Service&quot;), you enter into a legally binding contract governed by these Terms of
              Service. If you do not agree with all provisions stated herein, you must not access or
              use the platform.
            </p>

            <h3 className="font-mono text-xs uppercase tracking-wider text-[#E8DCC8] font-bold">
              1.2 Age Eligibility & Statutory Capacity
            </h3>
            <p>
              The Service is designed strictly for individuals aged 13 years and older. In
              compliance with the Children&apos;s Online Privacy Protection Act (COPPA), the UK
              GDPR, and corresponding international regulations, minors under 13 years of age are
              expressly prohibited from registering an account or transmitting personal identifying
              information. By confirming enrollment, you represent and warrant under penalty of
              perjury that you have reached at least 13 years of age.
            </p>

            <h3 className="font-mono text-xs uppercase tracking-wider text-[#E8DCC8] font-bold">
              1.3 Account Responsibilities & Operative Credentials
            </h3>
            <p>
              Operatives are solely responsible for maintaining the confidentiality of their account
              credentials, including email, passwords, authentication tokens, and unique 3-digit
              Agent Tags. Any activity, deduction submission, or leaderboard event occurring under
              your registered identity is deemed your own. You agree to notify administrators
              immediately of any unauthorized access or security breach.
            </p>

            <h3 className="font-mono text-xs uppercase tracking-wider text-[#E8DCC8] font-bold">
              1.4 Service Availability & Modifications
            </h3>
            <p>
              NoShitSherlock reserves the right to modify, suspend, or discontinue any case file,
              leaderboard feature, or technical interface at any time without prior liability.
              Periodic database resets during pre-release and beta testing phases may clear runtime
              session progress while preserving your account identity.
            </p>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: PRIVACY POLICY
           ========================================================================= */}
        <section id="privacy" className="space-y-6 border-t border-[#79604A]/30 pt-8 scroll-mt-12">
          <div className="border-b border-[#79604A]/30 pb-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#A7192D]">
              PROTOCOL CLAUSE 02
            </span>
            <h2 className="font-valmist text-2xl sm:text-3xl text-[#E8DCC8] font-bold uppercase tracking-wide">
              2. Privacy Policy & Information Disclosure
            </h2>
          </div>

          <div className="space-y-4 font-serif text-sm text-[#C8BDAA] leading-relaxed">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#E8DCC8] font-bold">
              2.1 Information We Collect
            </h3>
            <p>
              We collect only the minimum required information necessary to provide an authentic,
              competitive, and authenticated investigation experience:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 font-mono text-xs text-[#B8AD98]">
              <li>
                <strong>Identity Credentials:</strong> Email address, display callsign (username),
                and assigned 3-digit Agent Tag.
              </li>
              <li>
                <strong>Third-Party OAuth Data:</strong> When authenticating via Google or GitHub,
                we receive your verified profile email, account ID, and verified status. We never
                access your contacts or external repositories.
              </li>
              <li>
                <strong>Investigation Runtime Records:</strong> Case progression, deduction
                timestamps, score tallies, hint consultations, and pinboard sequence placements.
              </li>
              <li>
                <strong>Technical Telemetry:</strong> Anonymized session tokens, browser client
                user-agents, and IP addresses utilized strictly for fraud prevention, rate-limiting,
                and session validation.
              </li>
            </ul>

            <h3 className="font-mono text-xs uppercase tracking-wider text-[#E8DCC8] font-bold">
              2.2 How We Use Your Information
            </h3>
            <p>Your data is utilized strictly to:</p>
            <ul className="list-disc pl-5 space-y-1.5 font-mono text-xs text-[#B8AD98]">
              <li>
                Authenticate your identity across devices and preserve your active case files.
              </li>
              <li>Compute authoritative leaderboard scores and team syndicate achievements.</li>
              <li>Enforce anti-bruteforce safeguards and prevent automated solution spamming.</li>
              <li>
                Deliver case file dispatches, game releases, and operational updates when you have
                expressly opted into our mailing announcements.
              </li>
            </ul>

            <h3 className="font-mono text-xs uppercase tracking-wider text-[#E8DCC8] font-bold">
              2.3 Non-Sale of Personal Data
            </h3>
            <p>
              NoShitSherlock does not sell, rent, monetize, or trade operative personal data, email
              addresses, or gameplay habits to third-party advertisers or data brokers under any
              circumstances.
            </p>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: DATA PROCESSING & RETENTION POLICY
           ========================================================================= */}
        <section
          id="data-processing"
          className="space-y-6 border-t border-[#79604A]/30 pt-8 scroll-mt-12"
        >
          <div className="border-b border-[#79604A]/30 pb-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#A7192D]">
              PROTOCOL CLAUSE 03
            </span>
            <h2 className="font-valmist text-2xl sm:text-3xl text-[#E8DCC8] font-bold uppercase tracking-wide">
              3. Data Processing & Retention Policy
            </h2>
          </div>

          <div className="space-y-4 font-serif text-sm text-[#C8BDAA] leading-relaxed">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#E8DCC8] font-bold">
              3.1 Data Controller & Infrastructure
            </h3>
            <p>
              User records, authentication credentials, and game state are stored within encrypted
              PostgreSQL 17 databases hosted on Neon Serverless Cloud architecture. Communication
              between your browser and our servers occurs exclusively over TLS 1.3 encrypted HTTPS
              tunnels.
            </p>

            <h3 className="font-mono text-xs uppercase tracking-wider text-[#E8DCC8] font-bold">
              3.2 Data Retention & Right to Erasure (GDPR Art. 17)
            </h3>
            <p>
              Your operative records are maintained for as long as your account remains active. You
              possess the unconditional statutory right to request full account erasure. Upon
              written request or automated account deletion, your user entity, session records, team
              memberships, and personal gameplay progress are permanently wiped via atomic database
              cascade deletion.
            </p>

            <h3 className="font-mono text-xs uppercase tracking-wider text-[#E8DCC8] font-bold">
              3.3 Cookie Protocol & Session Management
            </h3>
            <p>
              We utilize strictly necessary HTTP-only authentication cookies
              (&quot;better-auth.session_token&quot;) to authenticate requests and protect against
              Cross-Site Request Forgery (CSRF). We do not employ third-party tracking cookies,
              marketing pixels, or invasive surveillance scripts.
            </p>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: FAIR PLAY & SCORING INTEGRITY
           ========================================================================= */}
        <section
          id="fair-play"
          className="space-y-6 border-t border-[#79604A]/30 pt-8 scroll-mt-12"
        >
          <div className="border-b border-[#79604A]/30 pb-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-[#A7192D]">
              PROTOCOL CLAUSE 04
            </span>
            <h2 className="font-valmist text-2xl sm:text-3xl text-[#E8DCC8] font-bold uppercase tracking-wide">
              4. Investigation Rules & Anti-Tampering Protocol
            </h2>
          </div>

          <div className="space-y-4 font-serif text-sm text-[#C8BDAA] leading-relaxed">
            <p>
              To maintain the integrity of our Central Clearance Registry and competitive
              leaderboards:
            </p>
            <ul className="list-disc pl-5 space-y-2 font-mono text-xs text-[#B8AD98]">
              <li>
                <strong>Server-Authoritative Validation:</strong> All deduction outcomes, correct
                answers, and clue sequences reside solely within our departmental backend. Correct
                answers never transit to the browser prior to verification.
              </li>
              <li>
                <strong>Prohibition on Automated Solvers:</strong> The deployment of scraping tools,
                headless bot runners, artificial rate-limit bypasses, or scripted brute-force
                dictionary attacks is strictly prohibited.
              </li>
              <li>
                <strong>Team Syndicate Synchronization:</strong> Squad sessions reflect shared
                investigative progress. Concerted cheating or coordinated abuse will lead to team
                disqualification and revocation of operative credentials.
              </li>
            </ul>
          </div>
        </section>

        {/* Action Controls & Navigation */}
        <footer className="pt-8 border-t border-[#79604A]/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-[#79604A]/50 bg-[#100D0D] px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-[#E8DCC8] hover:border-[#E8DCC8] hover:bg-[#181414] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <NoirButton href="/login" variant="outline" size="sm">
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </NoirButton>
            <NoirButton href="/signup" variant="primary" size="sm" withBeam>
              <FileText className="w-3.5 h-3.5" />
              <span>Register Operative</span>
            </NoirButton>
          </div>
        </footer>
      </div>
    </main>
  );
}
