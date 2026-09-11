"use client";

import { motion, useReducedMotion } from "motion/react";
import { Building2, LogOut } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { formatDate, formatToman } from "@/lib/format";
import type { Dict, Locale } from "@/lib/i18n";
import type { CheckReport, FleetOverview, Organization } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  fleetFetch,
  TOKEN_KEY,
  Unauthorized,
  type LoginResponse,
  type ReferralRow,
  type VehicleRow,
} from "./fleet-api";
import { LoginCard } from "./login-card";
import { OverviewTab } from "./overview-tab";
import { ReferralsTab } from "./referrals-tab";
import { ReportsTab } from "./reports-tab";
import { VehiclesTab } from "./vehicles-tab";

type TabKey = "overview" | "vehicles" | "reports" | "referrals";

export function PanelClient({ dict, locale }: { dict: Dict; locale: Locale }) {
  const fa = locale === "fa";
  const reduced = useReducedMotion();
  const [token, setToken] = useState<string | null>(null);
  const [booted, setBooted] = useState(false);
  const [org, setOrg] = useState<Organization | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");
  const [overview, setOverview] = useState<FleetOverview | null>(null);
  const [vehicles, setVehicles] = useState<VehicleRow[] | null>(null);
  const [reports, setReports] = useState<CheckReport[] | null>(null);
  const [referrals, setReferrals] = useState<ReferralRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setToken(window.localStorage.getItem(TOKEN_KEY));
    setBooted(true);
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setOrg(null);
    setOverview(null);
    setVehicles(null);
    setReports(null);
    setReferrals(null);
    setTab("overview");
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!overview) {
          const data = await fleetFetch<FleetOverview>("/api/fleet/overview", token);
          if (cancelled) return;
          setOverview(data);
          setOrg(data.org);
        }
        if (tab === "vehicles" && !vehicles) {
          const data = await fleetFetch<VehicleRow[]>("/api/fleet/vehicles", token);
          if (!cancelled) setVehicles(data);
        }
        if (tab === "reports" && !reports) {
          const data = await fleetFetch<CheckReport[]>("/api/fleet/reports", token);
          if (!cancelled) setReports(data);
        }
        if (tab === "referrals" && !referrals) {
          const data = await fleetFetch<ReferralRow[]>("/api/fleet/referrals", token);
          if (!cancelled) setReferrals(data);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof Unauthorized) signOut();
        else setError(dict.common.apiOffline);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [token, tab, overview, vehicles, reports, referrals, dict, signOut]);

  const onLogin = (result: LoginResponse) => {
    window.localStorage.setItem(TOKEN_KEY, result.token);
    setOrg(result.org);
    setToken(result.token);
  };

  if (!booted) {
    return (
      <div className="shell py-24 text-center text-[0.85rem] text-subtle">{dict.common.loading}</div>
    );
  }

  if (!token) {
    return (
      <div className="shell">
        <LoginCard dict={dict} onSuccess={onLogin} />
      </div>
    );
  }

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: dict.panel.tabs.overview },
    { key: "vehicles", label: dict.panel.tabs.vehicles },
    { key: "reports", label: dict.panel.tabs.reports },
    { key: "referrals", label: dict.panel.tabs.referrals },
  ];

  const ready =
    (tab === "overview" && overview) ||
    (tab === "vehicles" && vehicles) ||
    (tab === "reports" && reports) ||
    (tab === "referrals" && referrals);

  return (
    <div className="shell py-10 sm:py-14">
      {/* ------------------------------ header ------------------------------ */}
      <Reveal>
        <div className="glass edge-light flex flex-wrap items-center justify-between gap-5 rounded-lg p-5">
          <div className="flex items-center gap-4">
            <span className="accent-gradient grid size-12 shrink-0 place-items-center rounded-full text-xl font-semibold text-white">
              {org?.logo_seed ?? <Building2 className="size-5" />}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-[0.72rem] text-subtle">{dict.panel.welcome}</span>
              <span className="text-lg font-semibold">
                {org ? (fa ? org.name_fa : org.name_en) : dict.panel.title}
              </span>
              {org && (
                <span className="text-[0.74rem] text-muted">
                  {fa ? org.industry_fa : org.industry_en}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {org?.contract_start && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] text-subtle">{dict.panel.contract}</span>
                <span className="text-[0.82rem] font-medium">
                  {formatDate(org.contract_start, locale)}
                </span>
              </div>
            )}
            {org && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.7rem] text-subtle">{dict.panel.monthlyFee}</span>
                <span className="text-[0.82rem] font-medium tabular-nums">
                  {formatToman(org.monthly_fee_per_vehicle, locale)}
                </span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="size-3.5" strokeWidth={1.9} />
              {dict.actions.logout}
            </Button>
          </div>
        </div>
      </Reveal>

      {/* ------------------------------- tabs ------------------------------- */}
      <div className="mt-6 overflow-x-auto pb-1">
        <div className="glass inline-flex items-center gap-1 rounded-full p-1" role="tablist">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              onClick={() => setTab(item.key)}
              className={cn(
                "press relative h-9 rounded-full px-4 text-[0.82rem] whitespace-nowrap transition-colors",
                tab === item.key ? "text-white" : "text-muted hover:text-fg",
              )}
            >
              {tab === item.key && (
                <motion.span
                  layoutId="panel-tab"
                  className="accent-gradient absolute inset-0 rounded-full"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", bounce: 0, duration: 0.4 }
                  }
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ------------------------------ content ----------------------------- */}
      <div className="mt-6">
        {error && (
          <div className="panel-card mb-4 flex items-center justify-between gap-4 rounded-md p-4">
            <div className="flex flex-col gap-1">
              <span className="text-[0.85rem] font-medium text-crit">{error}</span>
              <span className="text-[0.75rem] text-subtle">{dict.common.apiOfflineHint}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setError(null);
                setOverview(null);
              }}
            >
              {dict.actions.retry}
            </Button>
          </div>
        )}

        {!ready && loading && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                className="h-24 animate-pulse rounded-md bg-[color-mix(in_oklab,var(--fg)_6%,transparent)]"
              />
            ))}
          </div>
        )}

        {tab === "overview" && overview && (
          <OverviewTab data={overview} dict={dict} locale={locale} />
        )}
        {tab === "vehicles" && vehicles && (
          <VehiclesTab rows={vehicles} dict={dict} locale={locale} />
        )}
        {tab === "reports" && reports && (
          <ReportsTab reports={reports} dict={dict} locale={locale} />
        )}
        {tab === "referrals" && referrals && (
          <ReferralsTab
            rows={referrals}
            dict={dict}
            locale={locale}
            token={token}
            onUnauthorized={signOut}
          />
        )}
      </div>
    </div>
  );
}
