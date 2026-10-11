import { headers } from "next/headers";
import { notFound } from "next/navigation";
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
    notFound();
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
    if (error instanceof GameSessionError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }
}
