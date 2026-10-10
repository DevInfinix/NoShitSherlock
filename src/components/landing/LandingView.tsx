"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AudioControlHud } from "@/components/landing/AudioControlHud";
import { LandingFrameScrubber } from "@/components/landing/LandingFrameScrubber";
import { ScrollProgressHud } from "@/components/landing/ScrollProgressHud";
import { SmoothScrollProvider } from "@/components/landing/SmoothScrollProvider";
import { BlobatarAvatar } from "@/components/ui/blobatar-avatar";
import { BooksShowcase, type CaseDossierCfg } from "@/components/ui/books-showcase";
import { BorderBeam } from "@/components/ui/border-beam";
import { CylinderCarousel, type EvidenceExhibit } from "@/components/ui/cylinder-carousel";
import { Particles } from "@/components/ui/particles";
import { PerspectiveMarquee } from "@/components/ui/perspective-marquee";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { RadarRipple } from "@/components/ui/radar-ripple";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { SpotlightCursor } from "@/components/ui/spotlight-cursor";
import { TextMorph } from "@/components/ui/text-morph";
import { TextScramble } from "@/components/ui/text-scramble";
import { TextShimmer } from "@/components/ui/text-shimmer";
import { soundEngine } from "@/lib/audio/sound-engine";

interface LandingViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    agentTag?: string | null;
    username?: string | null;
  } | null;
}

const ACTIVE_CASES: CaseDossierCfg[] = [
  {
    id: "case-01",
    code: "CASE-1928-BW",
    title: "The Blackwood Protocol",
    difficulty: "HARD",
    year: "1928",
    summary:
      "A locked railway carriage arrives in Edinburgh carrying a deceased diplomat and an empty steel briefcase. Five suspects with conflicting timetables. Decode wiretap ciphers and pinpoint the killer.",
    classification: "TOP SECRET",
    sectionsCount: 5,
    cluesCount: 12,
  },
  {
    id: "case-02",
    code: "CASE-1934-WW",
    title: "The Whispering Wire",
    difficulty: "MEDIUM",
    year: "1934",
    summary:
      "Intercepted telegraph communications reveal an espionage cell operating inside the General Post Office. Decrypt the wiretap ciphers, analyze Morse recordings, and intercept the courier.",
    classification: "RESTRICTED",
    sectionsCount: 5,
    cluesCount: 10,
  },
  {
    id: "case-03",
    code: "CASE-1941-CL",
    title: "The Crimson Ledger",
    difficulty: "LETHAL",
    year: "1941",
    summary:
      "Counterfeit wartime bonds and a midnight explosion in the harbor treasury. Sift forensic ash, examine torn bills, and reconstruct the conspirators' chronology on the evidence pinboard.",
    classification: "EYES ONLY",
    sectionsCount: 5,
    cluesCount: 15,
  },
];

const EXHIBIT_ARTIFACTS: EvidenceExhibit[] = [
  {
    id: "ex-1",
    tag: "EXHIBIT A",
    title: "Torn Train Ticket",
    type: "PHYSICAL DOCUMENT",
    notes: "Stamped at King's Cross 23:14. Smudged thumbprint in graphite on reverse margin.",
  },
  {
    id: "ex-2",
    tag: "EXHIBIT B",
    title: "Brass Pocket Watch",
    type: "MECHANICAL ARTIFACT",
    notes: "Hands frozen at 03:42. Internal escapement jammed with seawater silt.",
  },
  {
    id: "ex-3",
    tag: "EXHIBIT C",
    title: "Encoded Telegraph Tape",
    type: "CIPHER TEXT",
    notes: "Baudot code sequence repeating every 16 characters. Addressed to 'Nightingale'.",
  },
  {
    id: "ex-4",
    tag: "EXHIBIT D",
    title: "Cyanide Residue Vial",
    type: "TOXICOLOGY",
    notes: "Apothecary label scraped clean. Traces of bitter almond and paraffin wax.",
  },
  {
    id: "ex-5",
    tag: "EXHIBIT E",
    title: "Smudged Ledger Carbon",
    type: "FINANCIAL",
    notes: "Payment voucher totaling £4,500 transferred to a Swiss numbered vault.",
  },
];

const DISCIPLINE_CARDS = [
  {
    num: "01",
    title: "Fill-in-the-Blank Ciphers",
    desc: "Recover missing words from torn coroner reports and charred witness statements.",
  },
  {
    num: "02",
    title: "Forensic MCQ Deduction",
    desc: "Weigh conflicting ballistic trajectories and cross-examine suspect alibis.",
  },
  {
    num: "03",
    title: "Testimony Verification",
    desc: "Toggle assertion switches to separate genuine testimony from fabricated cover stories.",
  },
  {
    num: "04",
    title: "Cryptic Manuscripts",
    desc: "Crack substitution codes, book ciphers, and mirrored secret society emblems.",
  },
  {
    num: "05",
    title: "Wiretap Surveillance",
    desc: "Listen to vintage wiretaps, calibrate frequency filters, and read synced transcripts.",
  },
  {
    num: "06",
    title: "Chronological Pinboard",
    desc: "Pin gathered clues with red yarn. One correct chronological sequence breaks the case.",
  },
];

const NOIR_MOTTOS = [
  "TRUTH LEAVES A TRAIL",
  "EVERY CLUE SPEAKS",
  "SEAL THE DOSSIER",
  "NO DETAIL ESCAPES",
];

export function LandingView({ user }: LandingViewProps) {
  const [mottoIndex, setMottoIndex] = useState(0);

  // Cycle mottos for TextMorph
  useEffect(() => {
    const timer = setInterval(() => {
      setMottoIndex((prev) => (prev + 1) % NOIR_MOTTOS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const activeMotto = NOIR_MOTTOS[mottoIndex] ?? "TRUTH LEAVES A TRAIL";

  return (
    <SmoothScrollProvider>
      <div className="relative min-h-screen w-full bg-[var(--color-ink)] text-[var(--color-paper)] selection:bg-[var(--color-evidence-red)] selection:text-[var(--color-paper)]">
        {/* Interactive Custom Spotlight Cursor */}
        <SpotlightCursor />

        {/* Ambient Audio Toggle */}
        <AudioControlHud />

        {/* Vertical Scroll Level Progress HUD */}
        <ScrollProgressHud />

        {/* Floating Particles Atmosphere */}
        <Particles quantity={35} color="#A9874A" className="z-10" />

        {/* Persistent Top Hairline Navigation Bar */}
        <header className="fixed top-0 inset-x-0 z-30 flex items-center justify-between border-b border-[var(--color-brass)]/20 bg-[var(--color-ink)]/80 px-6 py-4 backdrop-blur-md">
          <Link
            href="/"
            onClick={() => soundEngine.playPaper()}
            className="group flex items-center gap-3"
          >
            <div className="flex h-7 w-7 items-center justify-center border border-[var(--color-brass)] bg-[var(--color-ink-raised)]">
              <span className="font-serif text-sm font-bold text-[var(--color-evidence-red)]">
                N
              </span>
            </div>
            <div>
              <span className="font-serif text-sm tracking-wider uppercase text-[var(--color-paper)] group-hover:text-[var(--color-brass)] transition-colors">
                NoShitSherlock
              </span>
              <span className="hidden font-mono text-[9px] tracking-widest text-[var(--color-paper-muted)] sm:inline-block ml-2 border-l border-[var(--color-brass)]/30 pl-2">
                COLD CASE UNIT
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 font-mono text-xs uppercase tracking-wider text-[var(--color-paper-muted)] md:flex">
            <Link
              href="/cases"
              onClick={() => soundEngine.playPaper()}
              className="hover:text-[var(--color-paper)] transition-colors"
            >
              Cases
            </Link>
            <a href="#mechanics" className="hover:text-[var(--color-paper)] transition-colors">
              Investigation
            </a>
            <a href="#enlist" className="hover:text-[var(--color-paper)] transition-colors">
              Clearance
            </a>
            <Link
              href="/legal"
              onClick={() => soundEngine.playPaper()}
              className="hover:text-[var(--color-paper)] transition-colors"
            >
              Directives
            </Link>
          </nav>

          <div className="flex items-center gap-3 mr-24 sm:mr-28">
            {user ? (
              <Link
                href="/cases"
                onClick={() => soundEngine.playStamp()}
                className="group relative flex items-center gap-2 border border-[var(--color-evidence-red)] bg-[var(--color-evidence-red)]/10 px-3.5 py-1.5 font-mono text-xs uppercase text-[var(--color-paper)] transition-all hover:bg-[var(--color-evidence-red)]"
              >
                <BlobatarAvatar
                  name={user.agentTag || user.name}
                  size={20}
                  className="border-[var(--color-paper)]/40"
                />
                <span>AGENT [{user.agentTag || user.name.slice(0, 3).toUpperCase()}]</span>
              </Link>
            ) : (
              <Link
                href="/signup"
                onClick={() => soundEngine.playStamp()}
                className="relative overflow-hidden border border-[var(--color-brass)] bg-[var(--color-brass)]/10 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-[var(--color-paper)] transition-all hover:bg-[var(--color-brass)] hover:text-[var(--color-ink)]"
              >
                <BorderBeam size={80} duration={8} />
                <span>ENLIST</span>
              </Link>
            )}
          </div>
        </header>

        {/* Pinned 350vh GSAP Frame-Scrubber Track */}
        <LandingFrameScrubber />

        {/* Progressive Blur Masks on Top/Bottom */}
        <ProgressiveBlur direction="top" className="top-0 h-24 z-20" />
        <ProgressiveBlur direction="bottom" className="bottom-0 h-32 z-20" />

        {/* Narrative Scroll Overlays Across Sections */}
        <div className="relative z-20 -mt-[350vh]">
          {/* SECTION 1: THE COLD OPEN (0vh - 100vh) */}
          <section
            id="sector-1"
            className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center"
          >
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 border border-[var(--color-brass)]/40 bg-[var(--color-ink-raised)]/90 px-4 py-1 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-evidence-red)] animate-ping" />
                <TextScramble
                  className="font-mono text-[11px] tracking-[0.25em] uppercase text-[var(--color-paper-muted)]"
                  duration={1.2}
                >
                  {"DEPARTMENT OF UNRESOLVED INVESTIGATIONS // ARCHIVE 1928"}
                </TextScramble>
              </div>

              <h1 className="font-serif text-5xl font-bold tracking-tight text-[var(--color-paper)] sm:text-7xl md:text-8xl">
                SOME TRUTHS <br />
                <TextShimmer className="text-[var(--color-brass)]">
                  REFUSE TO REMAIN BURIED.
                </TextShimmer>
              </h1>

              <p className="mx-auto max-w-2xl font-serif text-base leading-relaxed text-[var(--color-paper-muted)] sm:text-xl">
                An episodic noir detective web game. Open the worn evidence folder, interrogate
                wiretaps, decode cryptic manuscripts, and reconstruct the murder board in
                chronological order.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link
                  href={user ? "/cases" : "/signup"}
                  onClick={() => soundEngine.playStamp()}
                  className="group relative flex items-center gap-3 overflow-hidden border border-[var(--color-evidence-red)] bg-[var(--color-evidence-red)] px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-[var(--color-paper)] shadow-2xl transition-all duration-300 hover:bg-[#861f1e]"
                >
                  <BorderBeam size={140} duration={6} />
                  <span>{user ? "RESUME ACTIVE CASE" : "ENLIST & CLAIM WARRANT"}</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </Link>

                <Link
                  href="/cases"
                  onClick={() => soundEngine.playPaper()}
                  className="border border-[var(--color-brass)]/50 bg-[var(--color-ink-raised)]/80 px-6 py-3 font-mono text-xs uppercase tracking-wider text-[var(--color-paper-muted)] backdrop-blur-md transition-all duration-300 hover:border-[var(--color-brass)] hover:text-[var(--color-paper)]"
                >
                  BROWSE CASE ARCHIVES
                </Link>
              </div>

              {/* Scroll down indicator */}
              <div className="pt-12 text-center">
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--color-smoke)]">
                  SCROLL TO ACCESS EVIDENCE
                </span>
                <div className="mx-auto mt-2 h-6 w-[1px] bg-[var(--color-brass)]/40 animate-pulse" />
              </div>
            </div>
          </section>

          {/* PERSPECTIVE MARQUEE OF CLASSIFIED DISPATCHES */}
          <div className="my-8">
            <PerspectiveMarquee speed={24} rotateDeg={-1.5}>
              <span className="font-mono text-xs text-[var(--color-evidence-red)]">
                DISPATCH 23:42 {"//"} TORN TICKET FOUND AT KING'S CROSS
              </span>
              <span className="text-[var(--color-brass)]">&bull;</span>
              <span className="font-mono text-xs text-[var(--color-paper-muted)]">
                AUTOPSY: POTASSIUM CYANIDE RESIDUE DETECTED
              </span>
              <span className="text-[var(--color-brass)]">&bull;</span>
              <span className="font-mono text-xs text-[var(--color-brass)]">
                WIRETAP INTERCEPT {"//"} EMBASSY FREQUENCY JAMMED
              </span>
              <span className="text-[var(--color-brass)]">&bull;</span>
              <span className="font-mono text-xs text-[var(--color-evidence-red)]">
                WARNING: TIME LIMIT ENFORCED ON SECTION 3
              </span>
              <span className="text-[var(--color-brass)]">&bull;</span>
            </PerspectiveMarquee>
          </div>

          {/* SECTION 2: THE INVESTIGATION ENGINE & 3D DOSSIER VAULT (100vh - 220vh) */}
          <section id="mechanics" className="relative min-h-screen px-6 py-24">
            <div className="mx-auto max-w-6xl">
              <div className="text-center space-y-4 mb-16">
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--color-evidence-red)]">
                  SECTOR II {"//"} THE DEDUCTION ENGINE
                </span>
                <h2 className="font-serif text-3xl font-bold tracking-tight text-[var(--color-paper)] md:text-5xl">
                  5 Forensic Disciplines. One Unforgiving Timeline.
                </h2>
                <p className="mx-auto max-w-2xl font-serif text-sm text-[var(--color-paper-muted)] md:text-base">
                  Every case contains five sections of cryptographic, forensic, and testimonial
                  puzzles. The database is authoritative — your deductions are locked in stone.
                </p>
              </div>

              {/* 6 Disciplines Spotlight Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {DISCIPLINE_CARDS.map((card) => (
                  <SpotlightCard key={card.num} className="p-6">
                    <div className="flex items-center justify-between border-b border-[var(--color-brass)]/20 pb-3">
                      <span className="font-mono text-xs font-bold text-[var(--color-evidence-red)]">
                        {card.num}
                      </span>
                      <span className="font-mono text-[10px] uppercase text-[var(--color-paper-muted)]">
                        VERIFIED DISCIPLINE
                      </span>
                    </div>
                    <h3 className="mt-4 font-serif text-lg font-bold text-[var(--color-paper)]">
                      {card.title}
                    </h3>
                    <p className="mt-2 font-serif text-xs leading-relaxed text-[var(--color-paper-muted)]">
                      {card.desc}
                    </p>
                  </SpotlightCard>
                ))}
              </div>

              {/* Vengeance UI 3D Books/Dossiers Showcase */}
              <div className="mt-24">
                <BooksShowcase cases={ACTIVE_CASES} />
              </div>

              {/* Vengeance UI Cylinder Carousel */}
              <div className="mt-16">
                <CylinderCarousel exhibits={EXHIBIT_ARTIFACTS} />
              </div>
            </div>
          </section>

          {/* SECTION 3: THE ENLISTMENT & EXECUTION GATE (220vh - 350vh) */}
          <section
            id="enlist"
            className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24 text-center"
          >
            {/* Background Radar Pulse */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <RadarRipple size={420} count={3} />
            </div>

            <div className="relative z-10 max-w-3xl space-y-8 border border-[var(--color-brass)]/40 bg-[var(--color-ink-raised)]/95 p-8 shadow-2xl backdrop-blur-md md:p-14">
              <div className="inline-block border border-[var(--color-evidence-red)] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-[var(--color-evidence-red)]">
                SECURITY CLEARANCE ADMISSION
              </div>

              <h2 className="font-serif text-3xl font-bold tracking-tight text-[var(--color-paper)] md:text-5xl">
                {user ? "REPORT BACK TO HEADQUARTERS" : "CLAIM YOUR DETECTIVE WARRANT"}
              </h2>

              <p className="font-serif text-sm leading-relaxed text-[var(--color-paper-muted)] md:text-base">
                {user
                  ? `Welcome back, Agent ${user.agentTag || user.name}. Cold cases are waiting in the central archives. Re-open your dossier or challenge your squad to beat your solving speed.`
                  : "All operatives are issued a numbered 3-letter agent tag and a physical 3D warrant badge. Your credentials, hint balances, and solve records sync across every device."}
              </p>

              {/* Dynamic Operative Preview */}
              <div className="flex flex-col items-center justify-center gap-4 py-4">
                <BlobatarAvatar
                  name={user ? user.agentTag || user.name : "rookie-detective"}
                  size={64}
                  className="border-[var(--color-brass)] shadow-xl"
                />
                <div className="font-mono text-xs text-[var(--color-paper-muted)]">
                  {user ? (
                    <span>
                      REGISTERED: <span className="text-[var(--color-brass)]">{user.email}</span>
                    </span>
                  ) : (
                    <span>
                      STATUS:{" "}
                      <TextMorph text={activeMotto} className="text-[var(--color-evidence-red)]" />
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                {user ? (
                  <Link
                    href="/cases"
                    onClick={() => soundEngine.playStamp()}
                    className="relative overflow-hidden border border-[var(--color-evidence-red)] bg-[var(--color-evidence-red)] px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-paper)] shadow-2xl transition-all duration-300 hover:bg-[#861f1e]"
                  >
                    <BorderBeam size={160} duration={5} />
                    <span>OPEN ACTIVE DOSSIER &rarr;</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      onClick={() => soundEngine.playStamp()}
                      className="relative overflow-hidden border border-[var(--color-evidence-red)] bg-[var(--color-evidence-red)] px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-paper)] shadow-2xl transition-all duration-300 hover:bg-[#861f1e]"
                    >
                      <BorderBeam size={160} duration={5} />
                      <span>ENLIST AS DETECTIVE &rarr;</span>
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => soundEngine.playPaper()}
                      className="border border-[var(--color-brass)]/50 bg-[var(--color-ink)] px-6 py-3.5 font-mono text-xs uppercase tracking-widest text-[var(--color-paper-muted)] transition-all duration-300 hover:border-[var(--color-brass)] hover:text-[var(--color-paper)]"
                    >
                      ENTER HQ WITH CREDENTIALS
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Minimal Noir Footer */}
            <footer className="mt-20 w-full max-w-5xl border-t border-[var(--color-brass)]/20 pt-8 pb-12">
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[var(--color-paper-muted)]">
                <div>
                  <span className="text-[var(--color-brass)]">
                    &copy; 1928–2026 NoShitSherlock.
                  </span>{" "}
                  All Rights Reserved.
                </div>
                <div className="flex items-center gap-6">
                  <Link
                    href="/legal"
                    onClick={() => soundEngine.playPaper()}
                    className="hover:text-[var(--color-paper)] transition-colors"
                  >
                    Terms & Privacy
                  </Link>
                  <a
                    href="https://github.com/DevInfinix/noshitsherlock"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[var(--color-paper)] transition-colors"
                  >
                    GitHub Source
                  </a>
                  <Link
                    href="/not-found"
                    onClick={() => soundEngine.playPaper()}
                    className="text-[var(--color-smoke)] hover:text-[var(--color-evidence-red)] transition-colors"
                  >
                    Classified 404
                  </Link>
                </div>
              </div>
            </footer>
          </section>
        </div>
      </div>
    </SmoothScrollProvider>
  );
}
