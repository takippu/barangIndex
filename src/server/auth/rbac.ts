import { NextRequest, NextResponse } from "next/server";

import { getRequestSession } from "@/src/server/auth/session";

export async function requireAdmin(request: NextRequest) {
  const session = await getRequestSession(request);

  if (!session?.user) {
    return {
      session,
      error: NextResponse.json(
        {
          error: {
            code: "UNAUTHENTICATED",
            message: "Authentication required",
          },
        },
        { status: 401 },
      ),
    };
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    return {
      session,
      error: NextResponse.json(
        {
          error: {
            code: "FORBIDDEN",
            message: "Admin role required",
          },
        },
        { status: 403 },
      ),
    };
  }

  return { session, error: null };
}
