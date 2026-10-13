import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { CaseFolder } from "@/components/game/folder/CaseFolder";
import {
  GameSessionError,
  getSessionCaseFile,
  startOrResumeSession,
} from "@/server/services/game-session-service";
import { requireUser } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function CaseFilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const headerList = await headers();

  let user: { id: string };
  try {
    user = await requireUser(headerList);
  } catch {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/cases/${slug}`)}`);
  }

  try {
    const { session } = await startOrResumeSession(user.id, slug);
    const caseFile = await getSessionCaseFile(session.id, user.id);

    return (
      <main className="min-h-screen bg-[#0C0907] text-[#E7DDC8]">
        <CaseFolder initialCaseFile={caseFile} />
      </main>
    );
  } catch (error) {
    if (error instanceof GameSessionError) {
      if (error.statusCode === 404) {
        notFound();
      }
      if (error.statusCode === 403) {
        // Unverified email or incomplete onboarding - redirect to appropriate stage
        if (error.message.includes("onboarding incomplete")) {
          redirect("/signup");
        }
        redirect("/cases");
      }
    }
    throw error;
  }
}
