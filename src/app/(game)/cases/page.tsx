import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ResendVerificationBanner } from "@/components/auth/ResendVerificationBanner";
import { PinboardLibraryContainer } from "@/components/game/pinboard-library/PinboardLibraryContainer";
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
    activeCases = await getActiveCases(user?.id);
  } catch (error) {
    console.error("Failed to load active cases from database:", error);
  }

  const isEmailUnverified = dbUser && !dbUser.emailVerified;

  return (
    <main className="min-h-screen bg-[#0A0806] text-[#E7DDC8] py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Interactive Unverified Email Banner with Rate-Limited Resend */}
        {isEmailUnverified && dbUser && <ResendVerificationBanner email={dbUser.email} />}

        {/* Archive Title Header */}
        <header className="border-b border-[#A9874A]/30 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#A9874A] block">
              SCOTLAND YARD {"//"} HOMICIDE & COLD CASE PINBOARD
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#E7DDC8] font-bold mt-1">
              Active Investigation Archives
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="font-mono text-xs text-[#B8AD98] border border-[#A9874A]/40 px-3 py-1.5 bg-[#15110F]/90">
                DETECTIVE:{" "}
                <span className="text-[#E7DDC8] font-semibold">{user.name ?? user.email}</span>
                {dbUser?.agentTag && (
                  <span className="ml-2 text-[#A7192D] font-bold">[{dbUser.agentTag}]</span>
                )}
              </div>
            )}
            <Link
              href="/leaderboard"
              className="border border-[#A9874A]/40 bg-[#15110F] px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-[#A9874A] hover:bg-[#A9874A]/10 transition-colors"
            >
              Clearance Registry &rarr;
            </Link>
          </div>
        </header>

        {/* 3D Cinematic Evidence Pinboard */}
        <PinboardLibraryContainer cases={activeCases} />
      </div>
    </main>
  );
}
