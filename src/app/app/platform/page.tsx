"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { fmtMoney, fmtCompact, timeAgo, fmtDateTime, initials } from "@/lib/format";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

const mrrSeries = [
  { m: "Dec", v: 9800 },
  { m: "Jan", v: 11000 },
  { m: "Feb", v: 13500 },
  { m: "Mar", v: 14200 },
  { m: "Apr", v: 14999 },
  { m: "May", v: 16996 },
];

export default function PlatformOverviewPage() {
  const db = useStore((s) => s.db);
  const tenants = db.tenants;
  const active = tenants.filter((t) => t.status === "active").length;
  const trialing = tenants.filter((t) => t.status === "trialing").length;
  const pastDue = tenants.filter((t) => t.status === "past_due").length;
  const mrr = tenants
    .filter((t) => t.status === "active")
    .reduce((s, t) => s + t.mrr, 0);
  const totalUsers = tenants.reduce((s, t) => s + t.users, 0);
  const logsTotal = tenants.reduce((s, t) => s + t.logsThisMonth, 0);

  const acts = [
    { who: "Sharma Sawmill", what: "Mahesh ji opened a support thread", when: db.supportThreads[0].updatedAt, color: "bg-wood-100 text-wood-800" },
    { who: "Patel Timber Works", what: "Requested new log species", when: db.supportThreads[1].updatedAt, color: "bg-amber-100 text-amber-800" },
    { who: "GKS Industrial Mills", what: "Started 14-day trial", when: "2026-04-29T09:00:00Z", color: "bg-violet-100 text-violet-800" },
    { who: "Verma Wood Co.", what: "Onboarding session booked", when: db.supportThreads[2].updatedAt, color: "bg-emerald-100 text-emerald-800" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="p-6 bg-gradient-to-br from-wood-700 to-wood-900 text-wood-50 border-0 gap-0">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-wood-200/80">
              Platform health
            </div>
            <h2 className="text-2xl font-bold mt-1">Sab tenants healthy hain.</h2>
            <p className="text-sm text-wood-100/90 mt-1">
              {active} active · {trialing} on trial · {pastDue} past due. MRR {fmtMoney(mrr)}.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/app/platform/tenants"
              className={cn(buttonVariants({ variant: "outline" }), "bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white")}
            >
              View tenants
            </Link>
            <Link
              href="/app/platform/support"
              className={cn(buttonVariants(), "bg-wood-50 text-wood-800 hover:bg-white")}
            >
              Open inbox
            </Link>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active tenants" value={active} delta="+1 this month" trend="up" />
        <StatCard label="MRR" value={fmtMoney(mrr)} delta="+8.4%" trend="up" />
        <StatCard label="Total users" value={totalUsers} delta="+3" trend="up" />
        <StatCard label="Logs processed" value={fmtCompact(logsTotal)} delta="this month" trend="flat" />
      </div>

      {/* Chart + tenants */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2 gap-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">MRR trend</div>
              <div className="text-xs text-muted-foreground">Last 6 months</div>
            </div>
            <div className="text-xs text-muted-foreground">in ₹</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mrrSeries}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-wood-700)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-wood-700)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => fmtMoney(v)} contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }} />
                <Area type="monotone" dataKey="v" stroke="var(--color-wood-700)" strokeWidth={2.5} fill="url(#mrrGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-0 gap-0">
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <div className="text-sm font-semibold">Top tenants</div>
            <Link href="/app/platform/tenants" className="text-xs text-wood-700 font-semibold hover:underline">
              View all →
            </Link>
          </div>
          <div className="px-2 pb-2">
            {tenants.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-muted rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-wood-100 text-wood-700 grid place-items-center font-bold">
                    {initials(t.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{t.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {t.city} · {t.users} users
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{fmtMoney(t.mrr)}</div>
                  <StatusBadge value={t.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity */}
      <Card className="p-0 gap-0">
        <div className="px-5 pt-4 pb-2">
          <div className="text-sm font-semibold">Recent activity</div>
        </div>
        <div className="divide-y divide-border">
          {acts.map((a, i) => (
            <div key={i} className="px-5 py-3 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold ${a.color}`}>
                {initials(a.who)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-semibold">{a.who}</span> · {a.what}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {timeAgo(a.when)} · {fmtDateTime(a.when)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
