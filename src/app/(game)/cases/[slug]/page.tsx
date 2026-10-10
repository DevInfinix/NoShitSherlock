import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { DossierFolder } from "@/components/game/folder/DossierFolder";
import {
  GameSessionError,
  getSessionDossier,
  startOrResumeSession,
} from "@/server/services/game-session-service";
import { requireUser } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function CaseDossierPage({ params }: { params: Promise<{ slug: string }> }) {
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
    const dossier = await getSessionDossier(session.id, user.id);

    return (
      <main className="min-h-screen bg-ink text-paper py-8">
        <DossierFolder initialDossier={dossier} />
      </main>
    );
  } catch (error) {
    if (error instanceof GameSessionError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }
}
