import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { getServerSession } from "@/src/server/auth/server-session";
import { LandingScreen } from "@/src/components/LandingScreen";

export default async function Home() {
  const session = await getServerSession();

  if (session?.user) {
    redirect("/home");
  }

  const cookieStore = await cookies();
  const visited = cookieStore.get("grocery_index_visited");

  if (!visited) {
    redirect("/onboarding");
  }

  return <LandingScreen />;
}
