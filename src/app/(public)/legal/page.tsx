import Link from "next/link";

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-ink text-paper py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto border-2 border-brass/50 bg-ink-raised p-8 md:p-12 shadow-2xl space-y-8">
        <header className="border-b border-brass/30 pb-6">
          <span className="font-mono text-xs uppercase tracking-widest text-brass block">
            SCOTLAND YARD {"//"} STATUTORY COMPLIANCE
          </span>
          <h1 className="font-serif text-3xl text-paper font-bold mt-1">
            Terms of Service & Privacy Notice
          </h1>
          <span className="font-mono text-xs text-smoke block mt-1">
            DOCUMENT VERSION 1.0 {"//"} EFFECTIVE DATE: OCTOBER 1947 (2026 REVISION)
          </span>
        </header>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-brass font-semibold">
            1. Age Eligibility Gate (COPPA Compliance)
          </h2>
          <p className="font-sans text-paper-muted text-sm leading-relaxed">
            NoShitSherlock is intended exclusively for individuals aged 13 and older. By enrolling
            as a detective or participating in squad investigations, you warrant and represent that
            you are at least 13 years of age. Persons under 13 are prohibited from registering or
            submitting data.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-brass font-semibold">
            2. Rules of Investigation & Fair Play
          </h2>
          <p className="font-sans text-paper-muted text-sm leading-relaxed">
            All deduction evaluations, scores, hint penalties, and chronological pinboard
            submissions are server-authoritative. Automated scripts, brute-force sequencing, or
            unauthorized telemetry manipulation may result in dossier disqualification.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-serif text-xl text-brass font-semibold">3. Privacy & Telemetry</h2>
          <p className="font-sans text-paper-muted text-sm leading-relaxed">
            We store only your handle, email address for passwordless authentication, legal consent
            timestamp, and gameplay progress. We never sell detective data to commercial marketing
            third parties.
          </p>
        </section>

        <div className="pt-6 border-t border-brass/20 flex justify-between items-center">
          <Link
            href="/login"
            className="border border-brass/40 px-4 py-2 font-mono text-xs uppercase tracking-wider text-brass hover:border-brass hover:text-paper transition-colors"
          >
            &larr; Return to Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-oxblood hover:bg-evidence-red border border-evidence-red text-paper px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors"
          >
            Enlist as Detective &rarr;
          </Link>
        </div>
      </div>
    </main>
  );
}
