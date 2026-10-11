import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResendVerificationBanner } from "@/components/auth/ResendVerificationBanner";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { type ActiveCaseListing, getActiveCases } from "@/server/services/game-session-service";
import { getCurrentUser } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function CaseLibraryPage() {
  const headerList = await headers();
  const user = await getCurrentUser(headerList);

  let dbUser: typeof users.$inferSelect | null = null;
  if (user) {
    const [found] = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
    dbUser = found ?? null;

    // Strict onboarding gate: if user skipped or quit onboarding, redirect to complete it
    if (dbUser && (!dbUser.trainingCompleted || !dbUser.username || !dbUser.agentTag)) {
      redirect("/signup");
    }
  }

  let activeCases: ActiveCaseListing[] = [];
  try {
    activeCases = await Promise.race([
      getActiveCases(user?.id),
      new Promise<ActiveCaseListing[]>((_, reject) =>
        setTimeout(() => reject(new Error("DB Timeout")), 1200),
      ),
    ]);
  } catch {
    activeCases = [
      {
        id: 1,
        slug: "case-01-missing-ledger",
        title: "The Missing Ledger",
        description:
          "An embezzlement audit turns into a homicide investigation when chief accountant Harold Finch is found dead at the Blackwood Exchange.",
        difficulty: 3,
        maxScore: 1000,
        activeSessionId: null,
        activeSessionStatus: null,
        activeSessionScore: null,
      },
    ];
  }

  const isEmailUnverified = dbUser && !dbUser.emailVerified;

  return (
    <main className="min-h-screen bg-ink text-paper py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Interactive Unverified Email Banner with Rate-Limited Resend */}
        {isEmailUnverified && dbUser && <ResendVerificationBanner email={dbUser.email} />}

        {/* Archive Title Header */}
        <header className="border-b border-brass/40 pb-6 mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-brass block">
                DEPARTMENT ARCHIVES {"//"} ACTIVE COLD FILES
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-paper font-bold mt-1">
                Active Investigations
              </h1>
            </div>
            {user && (
              <div className="font-mono text-xs text-paper-muted border border-brass/30 px-3 py-1.5 bg-ink-raised">
                DETECTIVE ON DUTY:{" "}
                <span className="text-paper font-semibold">{user.name ?? user.email}</span>
              </div>
            )}
          </div>
          <p className="font-serif text-paper-muted mt-3 max-w-2xl text-sm leading-relaxed">
            Select a cold case to examine its field case file, examine evidence items, verify
            witness testimonies, and reconstruct chronological timeline clues.
          </p>
        </header>

        {/* Case Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {activeCases.map((caseItem) => {
            const hasActiveSession = !!caseItem.activeSessionId;

            return (
              <div
                key={caseItem.id}
                className="border-2 border-brass/40 bg-ink-raised/80 p-6 flex flex-col justify-between relative shadow-lg hover:border-brass/80 transition-all"
              >
                {/* Case Badge & Difficulty */}
                <div>
                  <div className="flex items-center justify-between border-b border-brass/20 pb-3 mb-4">
                    <span className="font-mono text-xs text-brass uppercase tracking-widest">
                      FILE #{caseItem.id.toString().padStart(3, "0")}
                    </span>
                    <div
                      className="flex items-center gap-1.5"
                      title={`Difficulty: ${caseItem.difficulty}/5`}
                    >
                      <span className="font-mono text-xs text-smoke mr-1">DIFFICULTY:</span>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span
                          key={`diff-${caseItem.id}-${idx}`}
                          className={`w-2.5 h-2.5 rounded-full ${
                            idx < caseItem.difficulty ? "bg-evidence-red" : "bg-smoke/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <h2 className="font-serif text-2xl text-paper font-bold mb-3">
                    {caseItem.title}
                  </h2>
                  <p className="font-sans text-paper-muted text-sm leading-relaxed mb-6">
                    {caseItem.description}
                  </p>
                </div>

                {/* Score & Action Row */}
                <div className="pt-4 border-t border-brass/20 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-smoke block">MAX SCORE</span>
                    <span className="font-mono text-sm text-paper font-semibold">
                      {caseItem.maxScore} PTS
                    </span>
                  </div>

                  <Link
                    href={`/cases/${caseItem.slug}`}
                    className={`font-mono text-xs uppercase tracking-wider px-5 py-2.5 border transition-colors cursor-pointer ${
                      hasActiveSession
                        ? "border-evidence-red bg-oxblood text-paper hover:bg-evidence-red"
                        : "border-brass/60 bg-ink text-brass hover:border-brass hover:text-paper"
                    }`}
                  >
                    {hasActiveSession ? "Continue Investigation" : "Open Case File"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
