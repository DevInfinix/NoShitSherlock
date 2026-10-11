import Link from "next/link";
import { getActiveCases } from "@/server/services/game-session-service";
import {
  getIndividualLeaderboard,
  getTeamLeaderboard,
} from "@/server/services/leaderboard-service";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; case?: string }>;
}) {
  const { type = "individual", case: selectedCaseSlug } = await searchParams;
  const isTeam = type === "team";

  const allCases = await getActiveCases();
  const individualData = !isTeam ? await getIndividualLeaderboard(selectedCaseSlug) : [];
  const teamData = isTeam ? await getTeamLeaderboard(selectedCaseSlug) : [];

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem.toString().padStart(2, "0")}s`;
  };

  return (
    <div className="min-h-screen bg-[#0C0907] text-[#E7DDC8] px-4 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#A9874A]/30 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/cases"
                className="font-mono text-xs uppercase text-[#A9874A] hover:underline"
              >
                &larr; Back to Case Archive
              </Link>
            </div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#A9874A] block mt-2">
              SCOTLAND YARD {"//"} CENTRAL CLEARANCE REGISTRY
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#E7DDC8] font-bold mt-1">
              Hall of Exceptional Deductions
            </h1>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border border-[#A9874A]/40 bg-[#15110F]">
            <Link
              href={`/leaderboard?type=individual${selectedCaseSlug ? `&case=${selectedCaseSlug}` : ""}`}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                !isTeam
                  ? "bg-[#641B1B] text-[#E7DDC8] font-bold"
                  : "text-[#B8AD98] hover:text-[#E7DDC8]"
              }`}
            >
              Solo Detectives
            </Link>
            <Link
              href={`/leaderboard?type=team${selectedCaseSlug ? `&case=${selectedCaseSlug}` : ""}`}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                isTeam
                  ? "bg-[#641B1B] text-[#E7DDC8] font-bold"
                  : "text-[#B8AD98] hover:text-[#E7DDC8]"
              }`}
            >
              Squad Syndicates
            </Link>
          </div>
        </div>

        {/* Case Filter Tabs */}
        <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-none pb-2">
          <Link
            href={`/leaderboard?type=${type}`}
            className={`px-3 py-1.5 font-mono text-xs tracking-wider uppercase border transition-colors ${
              !selectedCaseSlug
                ? "border-[#A9874A] bg-[#A9874A]/20 text-[#E7DDC8] font-bold"
                : "border-[#A9874A]/30 bg-[#15110F] text-[#B8AD98] hover:border-[#A9874A]"
            }`}
          >
            All Active Cases
          </Link>
          {allCases.map((c) => {
            const isSelected = selectedCaseSlug === c.slug;
            return (
              <Link
                key={c.slug}
                href={`/leaderboard?type=${type}&case=${c.slug}`}
                className={`px-3 py-1.5 font-mono text-xs tracking-wider uppercase border transition-colors ${
                  isSelected
                    ? "border-[#A9874A] bg-[#A9874A]/20 text-[#E7DDC8] font-bold"
                    : "border-[#A9874A]/30 bg-[#15110F] text-[#B8AD98] hover:border-[#A9874A]"
                }`}
              >
                {c.title}
              </Link>
            );
          })}
        </div>

        {/* Leaderboard Table */}
        <div className="border-2 border-[#A9874A]/40 bg-[#15110F]/90 shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#A9874A]/30 bg-[#211812] font-mono text-[11px] uppercase tracking-wider text-[#A9874A]">
                  <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4">{isTeam ? "Squad Syndicate" : "Detective"}</th>
                  <th className="py-3.5 px-4">Case File</th>
                  <th className="py-3.5 px-4 text-right">Score</th>
                  <th className="py-3.5 px-4 text-right">Clearance Time</th>
                  <th className="py-3.5 px-4 text-right">Date Solved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#A9874A]/15 font-serif text-sm">
                {!isTeam &&
                  individualData.length > 0 &&
                  individualData.map((entry) => (
                    <tr key={entry.sessionId} className="hover:bg-[#251B14]/60 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {entry.rank === 1 ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[#A9874A] text-[#15110F] text-xs">
                            #1
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[#C0C0C0] text-[#15110F] text-xs">
                            #2
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[#CD7F32] text-[#15110F] text-xs">
                            #3
                          </span>
                        ) : (
                          <span className="text-[#78716A]">#{entry.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#E7DDC8]">
                        {entry.detectiveName}
                      </td>
                      <td className="py-3.5 px-4 text-[#B8AD98] font-mono text-xs">
                        {entry.caseTitle}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#E7DDC8]">
                        {entry.score} PTS
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-[#A9874A]">
                        {formatTime(entry.totalTimeSeconds)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-[#78716A]">
                        {entry.completedAt
                          ? new Date(entry.completedAt).toLocaleDateString("en-GB")
                          : "ARCHIVED"}
                      </td>
                    </tr>
                  ))}

                {isTeam &&
                  teamData.length > 0 &&
                  teamData.map((entry) => (
                    <tr key={entry.sessionId} className="hover:bg-[#251B14]/60 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono font-bold">
                        {entry.rank === 1 ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[#A9874A] text-[#15110F] text-xs">
                            #1
                          </span>
                        ) : entry.rank === 2 ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[#C0C0C0] text-[#15110F] text-xs">
                            #2
                          </span>
                        ) : entry.rank === 3 ? (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[#CD7F32] text-[#15110F] text-xs">
                            #3
                          </span>
                        ) : (
                          <span className="text-[#78716A]">#{entry.rank}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#E7DDC8]">{entry.teamName}</td>
                      <td className="py-3.5 px-4 text-[#B8AD98] font-mono text-xs">
                        {entry.caseTitle}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#E7DDC8]">
                        {entry.score} PTS
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-[#A9874A]">
                        {formatTime(entry.totalTimeSeconds)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[11px] text-[#78716A]">
                        {entry.completedAt
                          ? new Date(entry.completedAt).toLocaleDateString("en-GB")
                          : "ARCHIVED"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {((!isTeam && individualData.length === 0) || (isTeam && teamData.length === 0)) && (
            <div className="py-16 text-center border-t border-[#A9874A]/20 p-6">
              <span className="font-mono text-xs uppercase tracking-widest text-[#A9874A] block mb-2 font-bold">
                NO VERIFIED CLEARANCES ON RECORD
              </span>
              <p className="font-serif text-[#B8AD98] text-sm max-w-md mx-auto">
                No detective or squad has officially solved this case and submitted a verified
                timeline. Be the first to crack the case and seal your record in the Central
                Registry.
              </p>
              <div className="mt-6">
                <Link
                  href="/cases"
                  className="inline-block border-2 border-[#A92A28] bg-[#641B1B] text-[#E7DDC8] px-6 py-2.5 font-mono text-xs uppercase tracking-wider font-bold hover:bg-[#A92A28] transition-colors"
                >
                  Enter Active Cases &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
