"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { fmtMoney, fmtCompact, fmtDate, timeAgo } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { DataStrip } from "@/components/shared/data-strip";
import { Section } from "@/components/shared/section";
import { StatusDot } from "@/components/shared/status-dot";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const dailyOutput = [120, 140, 95, 165, 180, 0, 220, 198, 175, 210, 188, 230, 245, 184].map((v, i) => ({
  d: `${14 - i}`,
  v,
}));

const speciesPalette = ["#1B1410", "#79482C", "#C8945A", "#D9B57F", "#E8D2AE"];

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
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div>
      <PageHeader
        meta={`${db.settings.organisation} · ${today}`}
        title="Day at a glance"
        sub={`${labourCount} workers on roll · ${openOrders} open orders · ${
          overdueAR ? `${fmtMoney(overdueAR, ccy)} overdue` : "no overdue receivables"
        }.`}
        actions={
          <>
            <Link href="/app/reports" className={cn(buttonVariants({ variant: "outline" }), "rounded-sm")}>
              Reports
            </Link>
            <Link href="/app/sheets" className={cn(buttonVariants(), "rounded-sm")}>
              Sheets
            </Link>
          </>
        }
      />

      <DataStrip
        facts={[
          { label: "Inventory", value: `${fmtCompact(totalCftIn)} CFT`, sub: "+12% w/w", trend: "up" },
          { label: "Collected", value: fmtMoney(monthlyRev, ccy), sub: "this month" },
          { label: "Spent", value: fmtMoney(monthlyCost, ccy), sub: "this month" },
          { label: "Open orders", value: openOrders, sub: `of ${db.orders.length}` },
          { label: "Overdue AR", value: fmtMoney(overdueAR, ccy), sub: overdueAR ? "follow up" : "—", trend: overdueAR ? "down" : undefined },
        ]}
      />

      {/* Output + species mix */}
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8 mt-8">
        <Section
          title="Daily output · last 14 days"
          sub="CFT processed across all species"
          right={<span className="mono text-xs text-muted-foreground">avg 168.6 / day</span>}
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={dailyOutput} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#E5E0D6" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="d" stroke="#6B5E51" tick={{ fontSize: 10, fontFamily: "var(--font-plex-mono)" }} axisLine={{ stroke: "#1B1410" }} tickLine={false} />
                <YAxis stroke="#6B5E51" tick={{ fontSize: 10, fontFamily: "var(--font-plex-mono)" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={{ borderRadius: 2, border: "1px solid #1B1410", fontSize: 11, fontFamily: "var(--font-plex-mono)" }} />
                <Bar dataKey="v" fill="#79482C" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Inventory mix" sub="by CFT, all species">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie data={speciesData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={72} paddingAngle={1} stroke="#fff" strokeWidth={1}>
                  {speciesData.map((_, i) => (
                    <Cell key={i} fill={speciesPalette[i % speciesPalette.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-plex-mono)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* Orders + cash, ledger style */}
      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        <Section
          title="Recent orders"
          right={<Link href="/app/sales/orders" className="text-xs text-wood-700 font-semibold hover:underline mono">all →</Link>}
        >
          <table className="w-full text-sm">
            <tbody>
              {db.orders.slice(0, 5).map((o) => {
                const c = db.customers.find((x) => x.id === o.customerId)!;
                return (
                  <tr key={o.id} className="border-t border-border first:border-t-0">
                    <td className="py-2 pr-2 mono text-[11px] text-muted-foreground w-20">{o.id}</td>
                    <td className="py-2 pr-2">
                      <div className="font-medium leading-tight">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">{o.species} · {o.cft} CFT</div>
                    </td>
                    <td className="py-2 pr-2 text-right mono font-semibold">{fmtMoney(o.cft * o.ratePerCft, ccy)}</td>
                    <td className="py-2 text-right"><StatusDot value={o.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Section>

        <Section title="Cash position" sub="snapshot · in ₹">
          <table className="w-full text-sm border-t border-border">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-3 pr-2">
                  <div className="font-medium">Receivable</div>
                  <div className="text-[11px] text-muted-foreground">
                    {db.invoices.filter((i) => i.status !== "paid").length} open invoices
                  </div>
                </td>
                <td className="py-3 text-right mono text-lg font-semibold text-emerald-700">+ {fmtMoney(recv, ccy)}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-3 pr-2">
                  <div className="font-medium">Payable</div>
                  <div className="text-[11px] text-muted-foreground">
                    {db.bills.filter((b) => b.status !== "paid").length} open bills
                  </div>
                </td>
                <td className="py-3 text-right mono text-lg font-semibold text-rose-700">− {fmtMoney(owed, ccy)}</td>
              </tr>
              <tr>
                <td className="py-3 pr-2 font-semibold">Net</td>
                <td className="py-3 text-right mono text-lg font-bold">{fmtMoney(recv - owed, ccy)}</td>
              </tr>
            </tbody>
          </table>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Link href="/app/accounts/ar" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full rounded-sm")}>View AR</Link>
            <Link href="/app/accounts/ap" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full rounded-sm")}>View AP</Link>
          </div>
        </Section>
      </div>

      {/* Floor feed */}
      <Section
        title="From the floor"
        right={<Link href="/app/feed" className="text-xs text-wood-700 font-semibold hover:underline mono">all →</Link>}
        className="mt-8"
      >
        <div className="grid sm:grid-cols-3 gap-4 pt-2">
          {db.dailyReports.slice(0, 3).map((r) => (
            <div key={r.id} className="border border-border">
              <div className="pic-tile" style={{ backgroundImage: `url(${r.pic})` }}>
                <div className="pic-cap">{timeAgo(r.at)}</div>
              </div>
              <div className="p-3">
                <p className="text-sm leading-snug">{r.text}</p>
                <p className="text-[11px] text-muted-foreground mt-1 mono">{fmtDate(r.at)}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
