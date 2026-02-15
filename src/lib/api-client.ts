export type ApiEnvelope<T> = {
  data: T;
};

export type ApiErrorEnvelope = {
  error?: {
    code: string;
    message: string;
    details: unknown;
  };
};

export async function apiGet<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, method: "GET" });
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Server error (${response.status}). API returned non-JSON response.`);
  }

  const payload = (await response.json()) as ApiEnvelope<T> & ApiErrorEnvelope;

  if (!response.ok || !payload.data) {
    throw new Error(payload.error?.message ?? "Request failed");
  }

  return payload.data;
}

export async function apiPost<T>(url: string, body: unknown, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Server error (${response.status}). API returned non-JSON response.`);
  }

  const payload = (await response.json()) as ApiEnvelope<T> & ApiErrorEnvelope;

  if (!response.ok || !payload.data) {
    throw new Error(payload.error?.message ?? "Request failed");
  }

  return payload.data;
}

export async function apiDelete<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Server error (${response.status}). API returned non-JSON response.`);
  }

  const payload = (await response.json()) as ApiEnvelope<T> & ApiErrorEnvelope;

  if (!response.ok || !payload.data) {
    throw new Error(payload.error?.message ?? "Request failed");
  }

  return payload.data;
}

export async function apiPatch<T>(url: string, body: unknown, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(`Server error (${response.status}). API returned non-JSON response.`);
  }

  const payload = (await response.json()) as ApiEnvelope<T> & ApiErrorEnvelope;

  if (!response.ok || !payload.data) {
    throw new Error(payload.error?.message ?? "Request failed");
  }

  return payload.data;
}

export function formatCurrency(value: string | number, currency = "MYR"): string {
  const number = typeof value === "string" ? Number.parseFloat(value) : value;
  if (Number.isNaN(number)) {
    return `${currency} 0.00`;
  }

  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

// Helper to get a UTC date object from various inputs
function toUtcDate(input: string | Date): Date {
  if (input instanceof Date) return input;

  // If it's a string, we need to ensure it's treated as UTC
  // If it looks like an ISO string but doesn't have a timezone indicator, assume UTC
  let dateStr = input;
  if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
    dateStr += 'Z';
  }
  return new Date(dateStr);
}

export function timeAgo(input: string | Date): string {
  const date = toUtcDate(input);
  const now = new Date(); // Browser's current time (local)
  const diff = now.getTime() - date.getTime(); // Difference in milliseconds
  const seconds = Math.floor(Math.abs(diff) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
