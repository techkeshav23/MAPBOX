"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { fmtMoney, fmtCompact, timeAgo, fmtDateTime } from "@/lib/format";
import { DataStrip } from "@/components/shared/data-strip";
import { Section } from "@/components/shared/section";
import { StatusDot } from "@/components/shared/status-dot";
import { PageHeader } from "@/components/shared/page-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
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
  const mrr = tenants.filter((t) => t.status === "active").reduce((s, t) => s + t.mrr, 0);
  const totalUsers = tenants.reduce((s, t) => s + t.users, 0);
  const logsTotal = tenants.reduce((s, t) => s + t.logsThisMonth, 0);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div>
      <PageHeader
        meta={`platform · ${today}`}
        title="Operations summary"
        sub={`${active} active · ${trialing} on trial · ${pastDue} past due. ${tenants.length} tenants total.`}
        actions={
          <>
            <Link href="/app/platform/tenants" className={cn(buttonVariants({ variant: "outline" }), "rounded-sm")}>
              All tenants →
            </Link>
            <Link href="/app/platform/support" className={cn(buttonVariants(), "rounded-sm")}>
              Support inbox
            </Link>
          </>
        }
      />

      <DataStrip
        facts={[
          { label: "MRR", value: fmtMoney(mrr), sub: "+8.4% vs last mo.", trend: "up" },
          { label: "Active tenants", value: active, sub: "+1 this month", trend: "up" },
          { label: "Users on platform", value: totalUsers, sub: "+3 this month", trend: "up" },
          { label: "Logs processed", value: fmtCompact(logsTotal), sub: "across 5 mills" },
          { label: "Open tickets", value: db.supportThreads.filter((t) => t.unread).length, sub: "awaiting reply" },
        ]}
      />

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 mt-8">
        {/* MRR line chart — stark */}
        <Section
          title="MRR trend · 6 mo"
          right={<span className="mono text-xs text-muted-foreground">all amounts in ₹</span>}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <LineChart data={mrrSeries} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#E5E0D6" strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="m"
                  stroke="#6B5E51"
                  tick={{ fontSize: 11, fontFamily: "var(--font-plex-mono)" }}
                  axisLine={{ stroke: "#1B1410" }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6B5E51"
                  tick={{ fontSize: 11, fontFamily: "var(--font-plex-mono)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  width={36}
                />
                <Tooltip
                  formatter={(v) => fmtMoney(Number(v))}
                  contentStyle={{
                    borderRadius: 2,
                    border: "1px solid #1B1410",
                    fontSize: 11,
                    fontFamily: "var(--font-plex-mono)",
                  }}
                />
                <Line
                  type="linear"
                  dataKey="v"
                  stroke="#1B1410"
                  strokeWidth={1.5}
                  dot={{ r: 3, fill: "#1B1410", stroke: "none" }}
                  activeDot={{ r: 5, fill: "#79482C", stroke: "none" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        {/* Tenant ledger */}
        <Section
          title="Top tenants by MRR"
          right={
            <Link href="/app/platform/tenants" className="text-xs text-wood-700 font-semibold hover:underline mono">
              all →
            </Link>
          }
        >
          <table className="w-full text-sm">
            <tbody>
              {tenants.slice(0, 5).map((t, i) => (
                <tr key={t.id} className="border-t border-border first:border-t-0">
                  <td className="py-2 pr-2 mono text-xs text-muted-foreground w-6">{(i + 1).toString().padStart(2, "0")}</td>
                  <td className="py-2 pr-2">
                    <div className="font-medium leading-tight">{t.name}</div>
                    <div className="text-[11px] text-muted-foreground">{t.city}</div>
                  </td>
                  <td className="py-2 pr-2 text-right mono font-semibold">{fmtMoney(t.mrr)}</td>
                  <td className="py-2 text-right">
                    <StatusDot value={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>

      {/* Activity log — newspaper style */}
      <Section title="Activity log" sub="latest first" className="mt-8">
        <ul className="divide-y divide-border border-t border-border">
          {[
            { who: "Sharma Sawmill", what: "support thread reopened", when: db.supportThreads[0].updatedAt },
            { who: "Patel Timber Works", what: "requested log species: Burma Teak", when: db.supportThreads[1].updatedAt },
            { who: "GKS Industrial Mills", what: "started 14-day trial", when: "2026-04-29T09:00:00Z" },
            { who: "Verma Wood Co.", what: "onboarding session booked for Mon 11:00", when: db.supportThreads[2].updatedAt },
            { who: "Birla Lumber Co-op", what: "moved to past_due (3 invoice cycles)", when: "2026-04-22T14:00:00Z" },
          ].map((a, i) => (
            <li key={i} className="py-2.5 flex items-baseline gap-3">
              <span className="mono text-[11px] text-muted-foreground w-32 shrink-0">{fmtDateTime(a.when)}</span>
              <span className="font-medium">{a.who}</span>
              <span className="text-muted-foreground">— {a.what}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">{timeAgo(a.when)}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
