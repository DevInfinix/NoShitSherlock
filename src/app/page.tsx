import { headers } from "next/headers";
import { LandingView } from "@/components/landing/LandingView";
import { getCurrentUser } from "@/server/session";

export default async function HomePage() {
  const reqHeaders = await headers();
  const user = await getCurrentUser(reqHeaders);

  return <LandingView user={user} />;
}
