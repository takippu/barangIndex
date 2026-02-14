import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { HomeScreen } from "@/src/components/HomeScreen";
import { requireServerSession } from "@/src/server/auth/server-session";
import { db } from "@/src/server/db/client";
import { users } from "@/src/server/db/schema";
import { resolveAppUserId } from "@/src/server/auth/app-user";

export default async function HomePage() {
  const session = await requireServerSession("/home");

  // Check if user has completed onboarding
  const appUserId = await resolveAppUserId({
    email: session.user.email,
    name: session.user.name,
  });

  if (appUserId) {
    const user = await db
      .select({ onboardingCompleted: users.onboardingCompleted })
      .from(users)
      .where(eq(users.id, appUserId))
      .limit(1);

    if (user[0] && !user[0].onboardingCompleted) {
      redirect("/onboarding");
    }
  }

  return <HomeScreen />;
}
