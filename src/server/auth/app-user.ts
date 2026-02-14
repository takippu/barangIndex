import { eq } from "drizzle-orm";

import { db } from "@/src/server/db/client";
import { users } from "@/src/server/db/schema";

export type SessionUserLike = {
  email?: string | null;
  name?: string | null;
};

export async function resolveAppUserId(user: SessionUserLike): Promise<number | null> {
  if (!user.email) {
    return null;
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, user.email))
    .limit(1);

  if (existing[0]) {
    return existing[0].id;
  }

  const inserted = await db
    .insert(users)
    .values({
      email: user.email,
      name: user.name ?? null,
    })
    .returning({ id: users.id });

  return inserted[0]?.id ?? null;
}
