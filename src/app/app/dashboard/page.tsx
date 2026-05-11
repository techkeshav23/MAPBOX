"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { fmtMoney, fmtCompact, timeAgo } from "@/lib/format";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend,
} from "recharts";

const dailyOutput = [
  120, 140, 95, 165, 180, 0, 220, 198, 175, 210, 188, 230, 245, 184,
].map((v, i) => ({ d: `${14 - i}`, v }));

const speciesPalette = ["#79482C", "#C8945A", "#965E36", "#D9B57F", "#5A3621"];

export default function OwnerDashboard() {
  const db = useStore((s) => s.db);
  const ccy = db.settings.currency;
  const totalCftIn = db.logs.reduce((s, l) => s + l.gradedCft, 0);
  const monthlyRev = db.invoices.reduce((s, i) => s + i.paid, 0);
  const monthlyCost = db.bills.reduce((s, b) => s + b.amount, 0);
  const labourCount = db.labour.length;
  const openOrders = db.orders.filter((o) => o.status !== "fulfilled").length;
  const overdueAR = db.invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + i.total - i.paid, 0);

  const speciesAgg = db.logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.species] = (acc[l.species] ?? 0) + l.gradedCft;
    return acc;
  }, {});
  const speciesData = Object.entries(speciesAgg).map(([name, value]) => ({ name, value }));

  const recv = db.invoices.reduce((s, i) => s + i.total - i.paid, 0);
  const owed = db.bills.reduce((s, b) => s + b.amount - b.paid, 0);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-wood-700">
            {db.settings.organisation}
          </div>
          <h2 className="text-2xl font-bold mt-1">{greet}, Mahesh ji 👋</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {labourCount} workers on roll · {openOrders} open orders ·{" "}
            {overdueAR ? `${fmtMoney(overdueAR, ccy)} overdue` : "all invoices on track"}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/reports" className={buttonVariants({ variant: "outline" })}>Monthly report</Link>
          <Link href="/app/sheets" className={buttonVariants({ variant: "default" })}>Open Sheets</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Inventory (CFT)" value={fmtCompact(totalCftIn)} delta="+12% vs last week" trend="up" />
        <StatCard label="Revenue collected" value={fmtMoney(monthlyRev, ccy)} delta="this month" trend="flat" />
        <StatCard label="Procurement spend" value={fmtMoney(monthlyCost, ccy)} delta="this month" trend="flat" />
        <StatCard label="Open orders" value={openOrders} delta={`${db.orders.length} total`} trend="flat" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2 gap-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-semibold">Daily output (CFT)</div>
              <div className="text-xs text-muted-foreground">Last 14 days · all species</div>
            </div>
            <StatusBadge value="+8.2%" tone="emerald" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyOutput}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="d" stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)" }} />
                <Bar dataKey="v" fill="var(--color-wood-400)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 gap-2">
          <div className="text-sm font-semibold">Inventory mix</div>
          <div className="text-xs text-muted-foreground">By CFT</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={speciesData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>
                  {speciesData.map((_, i) => <Cell key={i} fill={speciesPalette[i % speciesPalette.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-0 gap-0">
          <div className="px-5 pt-4 pb-2 flex items-center justify-between">
            <div className="text-sm font-semibold">Recent orders</div>
            <Link href="/app/sales/orders" className="text-xs text-wood-700 font-semibold hover:underline">All orders →</Link>
          </div>
          <div className="px-5 pb-4 divide-y divide-border">
            {db.orders.slice(0, 4).map((o) => {
              const c = db.customers.find((x) => x.id === o.customerId)!;
              return (
                <div key={o.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-semibold text-sm">{o.id} · {c.name}</div>
                    <div className="text-xs text-muted-foreground">{o.species} · {o.cft} CFT</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm">{fmtMoney(o.cft * o.ratePerCft, ccy)}</div>
                    <StatusBadge value={o.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 gap-3">
          <div>
            <div className="text-sm font-semibold">Cash position</div>
            <div className="text-xs text-muted-foreground">Snapshot</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4">
              <div className="text-xs font-semibold text-emerald-700">Receivable</div>
              <div className="text-2xl font-bold text-emerald-900 mt-1">{fmtMoney(recv, ccy)}</div>
              <div className="text-[11px] text-emerald-700 mt-1">
                {db.invoices.filter((i) => i.status !== "paid").length} open invoices
              </div>
            </div>
            <div className="rounded-lg bg-rose-50 border border-rose-100 p-4">
              <div className="text-xs font-semibold text-rose-700">Payable</div>
              <div className="text-2xl font-bold text-rose-900 mt-1">{fmtMoney(owed, ccy)}</div>
              <div className="text-[11px] text-rose-700 mt-1">
                {db.bills.filter((b) => b.status !== "paid").length} open bills
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-3 text-xs">
            Net position: <span className="font-bold text-foreground">{fmtMoney(recv - owed, ccy)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/app/accounts/ar" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}>View AR</Link>
            <Link href="/app/accounts/ap" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}>View AP</Link>
          </div>
        </Card>
      </div>

      <Card className="p-0 gap-0">
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <div className="text-sm font-semibold">From the floor</div>
          <Link href="/app/feed" className="text-xs text-wood-700 font-semibold hover:underline">All updates →</Link>
        </div>
        <div className="px-5 pb-4 grid sm:grid-cols-3 gap-3">
          {db.dailyReports.slice(0, 3).map((r) => (
            <div key={r.id}>
              <div
                className="pic-tile rounded-lg"
                style={{ backgroundImage: `url(${r.pic})` }}
              >
                <div className="pic-cap">{timeAgo(r.at)}</div>
              </div>
              <div className="text-xs mt-2 line-clamp-2">{r.text}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
