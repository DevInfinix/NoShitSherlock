import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PinboardCorkboard } from "@/components/game/pinboard/PinboardCorkboard";
import { startOrResumeSession } from "@/server/services/game-session-service";
import { getPinboardDossier, PinboardError } from "@/server/services/pinboard-service";
import { requireUser } from "@/server/session";

export const dynamic = "force-dynamic";

export default async function CasePinboardPage({ params }: { params: Promise<{ slug: string }> }) {
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
    const dossier = await getPinboardDossier(session.id, user.id);

    return (
      <main className="min-h-screen bg-ink text-paper py-8">
        <PinboardCorkboard initialDossier={dossier} />
      </main>
    );
  } catch (error) {
    if (error instanceof PinboardError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }
}
