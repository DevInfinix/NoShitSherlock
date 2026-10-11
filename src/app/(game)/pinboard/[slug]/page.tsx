import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PinboardCorkboard } from "@/components/game/pinboard/PinboardCorkboard";
import { startOrResumeSession } from "@/server/services/game-session-service";
import { getPinboardCaseFile, PinboardError } from "@/server/services/pinboard-service";
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
    const caseFile = await getPinboardCaseFile(session.id, user.id);

    return (
      <main className="min-h-screen bg-[#0C0907] text-[#E7DDC8] py-8">
        <PinboardCorkboard initialCaseFile={caseFile} />
      </main>
    );
  } catch (error) {
    if (error instanceof PinboardError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }
}
