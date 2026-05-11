"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PERSONAS } from "@/lib/seed";
import { signIn, useStore } from "@/lib/store";
import { defaultRouteFor } from "@/lib/nav";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [picked, setPicked] = useState<string | null>(null);
  const resetDb = useStore((s) => s.resetDb);

  function continueIn() {
    if (!picked) return;
    const persona = PERSONAS.find((p) => p.id === picked)!;
    signIn(persona.id);
    router.push(defaultRouteFor(persona.role));
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-background">
      {/* Brand pane — flat, ledger-feel, no gradients */}
      <section className="relative hidden lg:flex flex-col justify-between p-12 bg-wood-50 wood-grain border-r border-ink/10">
        <div className="relative z-10">
          <div className="flex items-baseline gap-3">
            <div className="font-serif text-3xl font-bold text-wood-900 tracking-tight">SawmillOS</div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-wood-700/70 font-semibold">
              v0.1 · single-tenant
            </span>
          </div>

          <div className="mt-12 max-w-md">
            <h1 className="font-serif text-[42px] leading-[1.05] tracking-tight text-wood-900">
              Procurement.<br />Sawing.<br />Sales. <span className="text-wood-500">Books.</span>
            </h1>
            <p className="mt-5 text-[15px] text-wood-800/85 leading-relaxed max-w-sm">
              One workspace for the mill — built for shared computers,
              weak Wi-Fi, and the way you actually run the day.
            </p>
          </div>

          {/* Newspaper info-strip on the brand pane */}
          <div className="mt-12 max-w-md">
            <div className="border-t border-b border-wood-900/30">
              <dl className="grid grid-cols-2 divide-x divide-wood-900/10">
                {[
                  ["TENANT", "Sharma Sawmill"],
                  ["LOCATION", "Yamunanagar, HR"],
                  ["WORKERS", "6 on roll"],
                  ["LOTS THIS MO.", "1,240"],
                ].map(([k, v]) => (
                  <div key={k} className="py-3 px-4">
                    <dt className="text-[10px] uppercase tracking-[0.12em] text-wood-700/70 font-semibold">{k}</dt>
                    <dd className="mono text-[15px] font-semibold text-wood-900 mt-0.5">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-[11px] text-wood-700/60 mono">
          BUILD 0.1.0 · {new Date().toISOString().slice(0, 10)} · SHARMA SAWMILL ACTIVE
        </div>
      </section>

      {/* Login pane */}
      <section className="flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden mb-10">
            <div className="font-serif text-2xl font-bold text-wood-900">SawmillOS</div>
          </div>

          <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            sign in
          </div>
          <h2 className="text-[24px] font-semibold tracking-tight mt-1">Pick a workstation user</h2>
          <p className="text-sm text-muted-foreground mt-2">
            No password — this is the demo. Each user sees the screens for their role.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">
              <span>Workspace</span>
              <span><span className="dot dot-emerald" />active</span>
            </div>
            <div className="rule-thin pt-3 mono text-[13px]">
              sharma-sawmill · Yamunanagar
            </div>

            <div className="rule pt-3 mt-6">
              <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold mb-2">
                Sign in as
              </div>
              <div className="divide-y divide-border border-t border-border">
                {PERSONAS.map((p) => {
                  const active = picked === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPicked(p.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-2 py-2.5 text-left transition-colors",
                        active ? "bg-wood-50" : "hover:bg-muted/50",
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 grid place-items-center text-[11px] font-semibold mono",
                          active ? "bg-wood-700 text-wood-50" : "bg-muted text-foreground",
                        )}
                      >
                        {p.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{p.roleLabel}</div>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.1em] font-semibold text-muted-foreground">
                        {p.tier === "Platform" ? "platform" : "tenant"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <Button
                className="flex-1 bg-wood-800 hover:bg-wood-900 text-wood-50 rounded-sm h-10 font-semibold tracking-wide"
                onClick={continueIn}
                disabled={!picked}
              >
                Continue →
              </Button>
              <button
                onClick={() => {
                  if (confirm("Reset all demo data to factory defaults?")) {
                    resetDb();
                    alert("Demo data reset. Sign in again.");
                  }
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-4 px-2 mono"
              >
                reset
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
