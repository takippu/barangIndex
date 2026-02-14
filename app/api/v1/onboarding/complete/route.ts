import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { fail, ok } from "@/src/server/api/http";
import { getRequestSession } from "@/src/server/auth/session";
import { db } from "@/src/server/db/client";
import { users } from "@/src/server/db/schema";
import { resolveAppUserId } from "@/src/server/auth/app-user";

export async function POST(request: NextRequest) {
  const session = await getRequestSession(request);
  if (!session?.user) {
    return fail("UNAUTHENTICATED", "Authentication required", 401);
  }

  const appUserId = await resolveAppUserId({
    email: session.user.email,
    name: session.user.name,
  });

  if (!appUserId) {
    return fail("NOT_FOUND", "User not found", 404);
  }

  // Mark onboarding as completed
  await db
    .update(users)
    .set({ onboardingCompleted: true, updatedAt: new Date() })
    .where(eq(users.id, appUserId));

  return ok({ success: true });
}
