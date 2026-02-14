import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import { fail, ok } from "@/src/server/api/http";
import { getRequestSession } from "@/src/server/auth/session";
import { db } from "@/src/server/db/client";
import { notifications } from "@/src/server/db/schema";
import { resolveAppUserId } from "@/src/server/auth/app-user";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  const session = await getRequestSession(request);
  if (!session?.user) {
    return fail("UNAUTHENTICATED", "Authentication required", 401);
  }

  const userId = await resolveAppUserId({
    email: session.user.email,
    name: session.user.name,
  });

  if (!userId) {
    return fail("NOT_FOUND", "User not found", 404);
  }

  const { notificationId } = await params;
  const notificationIdNum = parseInt(notificationId, 10);

  if (isNaN(notificationIdNum)) {
    return fail("BAD_REQUEST", "Invalid notification ID", 400);
  }

  const updated = await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationIdNum), eq(notifications.userId, userId)))
    .returning({ id: notifications.id });

  if (!updated.length) {
    return fail("NOT_FOUND", "Notification not found", 404);
  }

  return ok({ success: true });
}
