"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PERSONAS } from "@/lib/seed";
import { signIn, useStore } from "@/lib/store";
import { defaultRouteFor } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Building2 } from "lucide-react";

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
    <div className="min-h-screen grid lg:grid-cols-2 bg-wood-50">
      {/* Brand pane */}
      <section className="relative hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-wood-800 via-wood-700 to-wood-900 text-wood-50 overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 24px), repeating-linear-gradient(-45deg, #fff 0 1px, transparent 1px 24px)",
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-wood-50 text-wood-800 grid place-items-center font-extrabold text-xl shadow-lg">
              S
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight">SawmillOS</div>
              <div className="text-xs text-wood-200/80 uppercase tracking-widest">
                Mill management, end to end
              </div>
            </div>
          </div>

          <div className="mt-16 max-w-md">
            <h1 className="text-4xl font-extrabold leading-tight">
              From log to ledger — one platform.
            </h1>
            <p className="mt-4 text-wood-100/90 leading-relaxed">
              Manage procurement, sawing, yield, labour, sales and accounts across your
              entire mill. Built for shared computers, weak Wi-Fi, and trust by design.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 max-w-md">
            {[
              ["5+", "Role-based access"],
              ["Offline", "First sync"],
              ["Vault", "Admin-only data"],
              ["Sheets", "Live, foldered"],
            ].map(([big, small]) => (
              <div
                key={big}
                className="rounded-lg bg-white/5 ring-1 ring-white/10 p-3 backdrop-blur-sm"
              >
                <div className="text-2xl font-bold">{big}</div>
                <div className="text-xs text-wood-200/80">{small}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-wood-200/70">
          Demo build · v0.1 · Single tenant active (Sharma Sawmill)
        </div>
      </section>

      {/* Login pane */}
      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-lg bg-wood-700 text-wood-50 grid place-items-center font-extrabold">
              S
            </div>
            <span className="font-bold text-lg">SawmillOS</span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a persona to enter the demo. No password needed.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Workspace
              </label>
              <Card className="mt-1 flex-row items-center gap-2 px-3 py-2.5 flex">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <input
                  value="sharma-sawmill"
                  disabled
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  ACTIVE
                </Badge>
              </Card>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Sign in as
              </label>
              <div className="mt-2 space-y-2">
                {PERSONAS.map((p) => {
                  const active = picked === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPicked(p.id)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 transition text-left",
                        active
                          ? "border-wood-500 bg-wood-50 ring-2 ring-wood-200"
                          : "border-border hover:border-wood-300 hover:bg-wood-50/40",
                      )}
                    >
                      <Avatar className={cn("w-9 h-9", p.color)}>
                        <AvatarFallback className="bg-transparent text-current font-bold text-sm">
                          {p.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {p.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {p.roleLabel}
                          {p.scope ? ` · ${p.scope}` : ""}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {p.tier}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              className="w-full bg-wood-700 hover:bg-wood-800 text-white"
              size="lg"
              onClick={continueIn}
              disabled={!picked}
            >
              Continue
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              Demo data persists locally in your browser.{" "}
              <button
                onClick={() => {
                  if (confirm("Reset all demo data to factory defaults?")) {
                    resetDb();
                    alert("Demo data reset. Sign in again.");
                  }
                }}
                className="underline hover:text-foreground"
              >
                Reset demo
              </button>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
