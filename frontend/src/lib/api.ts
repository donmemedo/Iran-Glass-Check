import type {
  Center,
  Checkpoint,
  Service,
  Stats,
} from "./types";

/** Server components talk to FastAPI directly; the browser goes through the /api rewrite. */
const SERVER_BASE = process.env.API_URL ?? "http://127.0.0.1:8000";

export const apiBase = () => (typeof window === "undefined" ? SERVER_BASE : "");

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit & { revalidate?: number }): Promise<T> {
  const { revalidate, ...rest } = init ?? {};
  const res = await fetch(`${apiBase()}${path}`, {
    ...rest,
    headers: { "Content-Type": "application/json", ...(rest.headers ?? {}) },
    ...(typeof window === "undefined"
      ? { next: { revalidate: revalidate ?? 30 } }
      : { cache: "no-store" }),
  });
  if (!res.ok) {
    throw new ApiError(await res.text().catch(() => res.statusText), res.status);
  }
  return res.json() as Promise<T>;
}

/** Marketing pages must still render when the API is down, so reads fall back. */
export async function safeApi<T>(path: string, fallback: T, revalidate = 60): Promise<T> {
  try {
    return await api<T>(path, { revalidate });
  } catch {
    return fallback;
  }
}

export const getServices = () => safeApi<Service[]>("/api/catalog/services", []);
export const getCenters = () => safeApi<Center[]>("/api/catalog/centers", []);
export const getCheckpoints = () => safeApi<Checkpoint[]>("/api/catalog/checkpoints", []);
export const getStats = () =>
  safeApi<Stats | null>("/api/catalog/stats", null);
