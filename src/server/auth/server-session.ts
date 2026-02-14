import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/src/server/auth";

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireServerSession(redirectToPath: string) {
  const session = await getServerSession();

  if (!session?.user) {
    const loginUrl = `/login?redirect=${encodeURIComponent(redirectToPath)}`;
    redirect(loginUrl);
  }

  return session;
}
