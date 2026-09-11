"use client";

import { motion, useReducedMotion } from "motion/react";
import { KeyRound, LogIn, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, Eyebrow } from "@/components/ui/primitives";
import type { Dict } from "@/lib/i18n";
import type { LoginResponse } from "./fleet-api";

const DEMO = { email: "fleet@sepehr.ir", password: "demo1234" };

export function LoginCard({
  dict,
  onSuccess,
}: {
  dict: Dict;
  onSuccess: (result: LoginResponse) => void;
}) {
  const reduced = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (credentials: { email: string; password: string }) => {
    if (!credentials.email.trim() || !credentials.password.trim()) {
      setError(dict.panel.login.empty);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/fleet/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (res.status === 401) {
        setError(dict.panel.login.wrong);
        return;
      }
      if (!res.ok) {
        setError(dict.form.error);
        return;
      }
      onSuccess((await res.json()) as LoginResponse);
    } catch {
      setError(dict.common.apiOffline);
    } finally {
      setPending(false);
    }
  };

  const fillDemo = () => {
    setEmail(DEMO.email);
    setPassword(DEMO.password);
    void submit(DEMO);
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 py-10">
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.5 }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <Eyebrow>{dict.panel.title}</Eyebrow>
        <h1 className="text-2xl font-semibold sm:text-3xl">{dict.panel.login.title}</h1>
        <p className="text-[0.9rem] text-muted">{dict.panel.login.lead}</p>
      </motion.div>

      <motion.div
        className="w-full"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", bounce: 0, duration: 0.55, delay: 0.06 }}
      >
        <Card className="flex flex-col gap-4">
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submit({ email, password });
            }}
          >
            <label className="flex flex-col gap-1.5">
              <span className="text-[0.78rem] font-medium text-muted">
                {dict.panel.login.email}
              </span>
              <span className="relative flex items-center">
                <Mail
                  className="pointer-events-none absolute start-3 size-4 text-subtle"
                  strokeWidth={1.8}
                  aria-hidden
                />
                <input
                  type="email"
                  dir="ltr"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="fleet@example.ir"
                  className="h-11 w-full rounded-full border border-line bg-[color-mix(in_oklab,var(--panel)_70%,transparent)] ps-10 pe-4 text-[0.88rem] outline-none transition-colors placeholder:text-subtle focus:border-accent"
                />
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[0.78rem] font-medium text-muted">
                {dict.panel.login.password}
              </span>
              <span className="relative flex items-center">
                <KeyRound
                  className="pointer-events-none absolute start-3 size-4 text-subtle"
                  strokeWidth={1.8}
                  aria-hidden
                />
                <input
                  type="password"
                  dir="ltr"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-full border border-line bg-[color-mix(in_oklab,var(--panel)_70%,transparent)] ps-10 pe-4 text-[0.88rem] outline-none transition-colors placeholder:text-subtle focus:border-accent"
                />
              </span>
            </label>

            {error && (
              <motion.p
                initial={reduced ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-md border border-[color-mix(in_oklab,var(--crit)_35%,transparent)] bg-crit-soft px-3 py-2 text-[0.78rem] text-crit"
                role="alert"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" disabled={pending} className="w-full">
              {pending ? dict.form.sending : dict.panel.login.submit}
              {!pending && <LogIn className="size-4" strokeWidth={1.9} />}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[0.7rem] text-subtle">{dict.common.of}</span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <Button type="button" variant="glass" onClick={fillDemo} disabled={pending}>
            <Sparkles className="size-4 text-accent" strokeWidth={1.9} />
            {dict.panel.login.demo}
          </Button>
          <p className="text-center text-[0.72rem] text-subtle">{dict.panel.login.demoHint}</p>
        </Card>
      </motion.div>
    </div>
  );
}
