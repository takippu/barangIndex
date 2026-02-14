import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { getServerSession } from "@/src/server/auth/server-session";
import { LandingScreen } from "@/src/components/LandingScreen";

export default async function Home() {
  const session = await getServerSession();

  // Session check removed to allow landing page access
  // if (session?.user) {
  //   redirect("/home");
  // }

  // For non-logged in users, check if they've seen onboarding
  const cookieStore = await cookies();
  const visited = cookieStore.get("grocery_index_visited");

  const user = session?.user
    ? {
      name: session.user.name ?? null,
      email: session.user.email ?? "",
      image: session.user.image ?? undefined,
    }
    : null;

  // Show landing page - onboarding is optional and accessible via link
  return <LandingScreen showOnboardingLink={!visited} user={user} />;
}
