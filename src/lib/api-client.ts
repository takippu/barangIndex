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

export function timeAgo(input: string | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
