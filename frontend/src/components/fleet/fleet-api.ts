import type { CheckReport, Organization, Referral, Vehicle } from "@/lib/types";

export const TOKEN_KEY = "igc_token";

export interface VehicleRow {
  vehicle: Vehicle;
  last_report_code: string | null;
}

export interface ReferralRow {
  referral: Referral;
  plate: string | null;
  report_code: string | null;
}

export interface LoginResponse {
  token: string;
  org: Organization;
}

export class Unauthorized extends Error {}

export async function fleetFetch<T>(
  path: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
  if (res.status === 401) throw new Unauthorized();
  if (!res.ok) throw new Error(String(res.status));
  return res.json() as Promise<T>;
}

export const fleetReports = (token: string) =>
  fleetFetch<CheckReport[]>("/api/fleet/reports", token);
