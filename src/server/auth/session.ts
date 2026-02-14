import { NextRequest } from "next/server";

import { auth } from "@/src/server/auth";

export async function getRequestSession(request: NextRequest) {
  return auth.api.getSession({
    headers: request.headers,
  });
}
