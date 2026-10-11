import { ArrowLeft, Home, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { NoirButton } from "@/components/ui/noir-button";

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-[#100D0D] text-[#E8DCC8] py-16 px-4 sm:px-6 lg:px-8 selection:bg-[#A7192D] selection:text-[#E8DCC8]">
      <div className="max-w-3xl mx-auto border-2 border-[#79604A]/60 bg-[#181414] p-8 md:p-12 shadow-2xl space-y-10 relative overflow-hidden">
        {/* Top Header Badge */}
        <header className="border-b border-[#79604A]/30 pb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#A7192D] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#A7192D]" />
              LEGAL PROTOCOL {"//"} COMPLIANCE & PRIVACY
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[#A69A8C] hover:text-[#E8DCC8] transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to Home</span>
            </Link>
          </div>
          <h1 className="font-valmist text-3xl sm:text-4xl text-[#E8DCC8] font-bold uppercase tracking-tight">
            Terms of Service & Privacy Policy
          </h1>
          <span className="font-mono text-xs text-[#79604A] block">
            VERSION 2026.1 {"//"} EFFECTIVE DATE: OCTOBER 2026
          </span>
        </header>

        {/* Section 1: Age Eligibility */}
        <section className="space-y-3">
          <h2 className="font-valmist text-xl text-[#E8DCC8] font-bold uppercase tracking-wide">
            1. Age Eligibility Gate (COPPA Compliance)
          </h2>
          <p className="font-selnora text-sm text-[#A69A8C] leading-relaxed">
            NoShitSherlock is intended exclusively for individuals aged 13 and older. By enrolling
            as a detective or participating in multiplayer case investigations, you warrant and
            represent that you are at least 13 years of age. Persons under the age of 13 are
            strictly prohibited from registering an account or transmitting personal information
            through our services.
          </p>
        </section>

        {/* Section 2: Fair Play & Integrity */}
        <section className="space-y-3">
          <h2 className="font-valmist text-xl text-[#E8DCC8] font-bold uppercase tracking-wide">
            2. Rules of Investigation & Fair Play
          </h2>
          <p className="font-selnora text-sm text-[#A69A8C] leading-relaxed">
            All deduction evaluations, scores, hint penalties, and chronological pinboard
            submissions are strictly server-authoritative. Users agree not to employ automated bots,
            scripts, brute-force solvers, or reverse-engineer API endpoints to artificially inflate
            leaderboard standings. Violations may result in immediate account termination and
            permanent score forfeiture.
          </p>
        </section>

        {/* Section 3: Intellectual Property */}
        <section className="space-y-3">
          <h2 className="font-valmist text-xl text-[#E8DCC8] font-bold uppercase tracking-wide">
            3. Intellectual Property & Open Source Licensing
          </h2>
          <p className="font-selnora text-sm text-[#A69A8C] leading-relaxed">
            The underlying web application and game engine are open-source software licensed under
            the Apache License 2.0. However, all game narratives, crime case files, custom audio
            recordings, illustrations, trademarks, and branding are proprietary intellectual
            property with all rights reserved, unless explicitly stated otherwise in case source
            materials.
          </p>
        </section>

        {/* Section 4: Privacy & Data Protection */}
        <section className="space-y-3">
          <h2 className="font-valmist text-xl text-[#E8DCC8] font-bold uppercase tracking-wide">
            4. Privacy, Data Collection & Storage
          </h2>
          <p className="font-selnora text-sm text-[#A69A8C] leading-relaxed">
            We collect and retain only the minimal operational data required to deliver gameplay:
            your chosen detective handle, email address for account authentication, timestamps of
            legal acknowledgment, and in-game progression records. We never sell, monetize, or
            disclose your personal data to third-party advertisers. Users may request full account
            deletion at any time.
          </p>
        </section>

        {/* Section 5: Limitation of Liability */}
        <section className="space-y-3">
          <h2 className="font-valmist text-xl text-[#E8DCC8] font-bold uppercase tracking-wide">
            5. Disclaimer of Warranties & Limitation of Liability
          </h2>
          <p className="font-selnora text-sm text-[#A69A8C] leading-relaxed">
            NoShitSherlock is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
            basis for recreational and entertainment purposes. To the maximum extent permitted by
            applicable law, the developers and maintainers disclaim all warranties, express or
            implied, and shall not be held liable for any direct, indirect, incidental, or
            consequential damages resulting from downtime or loss of saved game sessions.
          </p>
        </section>

        {/* Action Controls & Navigation */}
        <div className="pt-8 border-t border-[#79604A]/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-[#79604A]/50 bg-[#100D0D] px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-[#E8DCC8] hover:border-[#E8DCC8] hover:bg-[#181414] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <NoirButton href="/login" variant="outline" size="sm">
              Sign In
            </NoirButton>
            <NoirButton href="/signup" variant="primary" size="sm" withBeam>
              Sign Up as Detective
            </NoirButton>
          </div>
        </div>
      </div>
    </main>
  );
}
