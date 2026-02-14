import { z } from "zod";

import { fail } from "@/src/server/api/http";

export function parseQuery<T extends z.ZodTypeAny>(schema: T, value: unknown) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    return {
      data: null,
      error: fail("BAD_REQUEST", "Invalid query parameters", 400, parsed.error.flatten()),
    };
  }

  return { data: parsed.data, error: null };
}

export async function parseJson<T extends z.ZodTypeAny>(schema: T, request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return {
      data: null,
      error: fail("BAD_REQUEST", "Request body must be valid JSON", 400),
    };
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return {
      data: null,
      error: fail("BAD_REQUEST", "Invalid request payload", 400, parsed.error.flatten()),
    };
  }

  return { data: parsed.data, error: null };
}
