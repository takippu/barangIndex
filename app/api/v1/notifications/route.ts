import { and, desc, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

import { fail, ok } from "@/src/server/api/http";
import { getRequestSession } from "@/src/server/auth/session";
import { db } from "@/src/server/db/client";
import { notifications, users } from "@/src/server/db/schema";
import { resolveAppUserId } from "@/src/server/auth/app-user";

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  const userNotifications = await db
    .select({
      id: notifications.id,
      type: notifications.type,
      title: notifications.title,
      message: notifications.message,
      metadata: notifications.metadata,
      isRead: notifications.isRead,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)
    .offset(offset);

  const unreadCountResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return ok({
    notifications: userNotifications,
    unreadCount: unreadCountResult[0]?.count || 0,
    pagination: { limit, offset },
  });
}

export async function PATCH(request: NextRequest) {
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

  // Mark all notifications as read for this user
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

  return ok({ success: true });
}
