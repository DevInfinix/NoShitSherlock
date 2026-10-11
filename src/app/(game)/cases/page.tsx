import { eq } from "drizzle-orm";
import { headers } from "next/headers";
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
    <main className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#0A0806] text-[#E7DDC8]">
      {/* Interactive Unverified Email Banner with Rate-Limited Resend */}
      {isEmailUnverified && dbUser && (
        <div className="absolute top-16 inset-x-4 sm:inset-x-8 z-30 pointer-events-auto">
          <ResendVerificationBanner email={dbUser.email} />
        </div>
      )}

      {/* 3D Full-Viewport Cinematic Evidence Pinboard */}
      <PinboardLibraryContainer
        cases={activeCases}
        currentUser={user}
        agentTag={dbUser?.agentTag}
      />
    </main>
  );
}
