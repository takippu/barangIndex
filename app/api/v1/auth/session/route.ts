import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/src/server/auth";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  return NextResponse.json({ data: session ?? null });
}
