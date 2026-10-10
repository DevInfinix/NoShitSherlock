"use client";

import Link from "next/link";

interface CaseSolvedScreenProps {
  caseTitle: string;
  finalScore: number;
  totalTimeSeconds: number;
  caseSlug: string;
}

export function CaseSolvedScreen({
  caseTitle,
  finalScore,
  totalTimeSeconds,
  caseSlug,
}: CaseSolvedScreenProps) {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder.toString().padStart(2, "0")}s`;
  };

  const getDetectiveRank = (score: number) => {
    if (score >= 800) {
      return {
        rank: "CHIEF INSPECTOR",
        clearance: "SPECIAL SPECIAL BRANCH // CLASS 1",
        description:
          "Flawless chronological deduction. The Yard recognizes your exemplary forensic judgment.",
      };
    }
    if (score >= 500) {
      return {
        rank: "SENIOR DETECTIVE",
        clearance: "CRIMINAL INVESTIGATION DEPT // CLASS 2",
        description:
          "Solid investigative reconstruction. The perpetrator's timeline has been shattered.",
      };
    }
    return {
      rank: "CONSTABLE INVESTIGATOR",
      clearance: "PROBATIONARY // CLASS 3",
      description:
        "Case closed, though multiple missteps and penalty inquiries occurred along the way.",
    };
  };

  const rankInfo = getDetectiveRank(finalScore);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="border-4 border-brass bg-ink-raised p-8 md:p-12 shadow-2xl relative text-center space-y-8">
        {/* Red Stamp of Case Closure */}
        <div className="inline-block border-4 border-evidence-red px-6 py-2 rotate-[-3deg] shadow-lg">
          <span className="font-mono text-xl md:text-2xl font-black uppercase tracking-widest text-evidence-red block">
            CASE SOLVED {"//"} FILE CLOSED
          </span>
        </div>

        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-brass block mb-1">
            FINAL INVESTIGATION REPORT
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-paper font-bold">{caseTitle}</h1>
        </div>

        {/* Score & Time Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-ink border border-brass/30">
          <div>
            <span className="font-mono text-xs text-smoke uppercase tracking-wider block">
              FINAL DEDUCTION SCORE
            </span>
            <span className="font-mono text-3xl md:text-4xl text-paper font-bold">
              {finalScore} PTS
            </span>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-brass/20 pt-4 md:pt-0">
            <span className="font-mono text-xs text-smoke uppercase tracking-wider block">
              TOTAL ELAPSED TIME
            </span>
            <span className="font-mono text-3xl md:text-4xl text-brass font-bold">
              {formatTime(totalTimeSeconds)}
            </span>
          </div>
        </div>

        {/* Detective Rank Commendation */}
        <div className="border-l-4 border-evidence-red bg-oxblood/20 p-6 text-left">
          <span className="font-mono text-[10px] text-smoke uppercase tracking-wider block mb-0.5">
            SCOTLAND YARD CLEARANCE ASSESSMENT
          </span>
          <h2 className="font-mono text-xl text-paper font-bold">{rankInfo.rank}</h2>
          <span className="font-mono text-xs text-brass block mb-2">{rankInfo.clearance}</span>
          <p className="font-serif text-paper-muted text-sm leading-relaxed italic">
            "{rankInfo.description}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-brass/30">
          <Link
            href="/cases"
            className="border-2 border-brass px-6 py-3 font-mono text-xs uppercase tracking-wider text-paper hover:bg-brass/20 transition-colors"
          >
            &larr; Return to Case Archive
          </Link>
          <Link
            href={`/cases/${caseSlug}`}
            className="border border-brass/40 px-6 py-3 font-mono text-xs uppercase tracking-wider text-paper-muted hover:border-brass hover:text-paper transition-colors"
          >
            Review Evidence Dossier
          </Link>
        </div>
      </div>
    </div>
  );
}
