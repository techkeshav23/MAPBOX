"use client";

import { useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/format";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";

export default function AccountsDashboard() {
  const db = useStore((s) => s.db);
  const ccy = db.settings.currency;
  const ar = db.invoices.reduce((s, i) => s + i.total - i.paid, 0);
  const ap = db.bills.reduce((s, b) => s + b.amount - b.paid, 0);
  const overdue = db.invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + i.total - i.paid, 0);
  const gstCollected = db.invoices.reduce((s, i) => s + i.gst, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Books snapshot</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Net cash position {fmtMoney(ar - ap, ccy)} · GST collected {fmtMoney(gstCollected, ccy)} this period
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Receivable" value={fmtMoney(ar, ccy)} delta={`${db.invoices.filter((i) => i.status !== "paid").length} open`} />
        <StatCard label="Payable" value={fmtMoney(ap, ccy)} delta={`${db.bills.filter((b) => b.status !== "paid").length} open`} trend="down" />
        <StatCard label="Overdue" value={fmtMoney(overdue, ccy)} delta="follow up" trend={overdue ? "down" : "flat"} />
        <StatCard label="GST liability" value={fmtMoney(gstCollected, ccy)} delta="this period" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <AgingCard
          title="AR aging"
          sub="Money owed to us"
          items={db.invoices.map((i) => ({ date: i.date, remain: i.total - i.paid }))}
          tone="emerald"
        />
        <AgingCard
          title="AP aging"
          sub="Money we owe"
          items={db.bills.map((b) => ({ date: b.date, remain: b.amount - b.paid }))}
          tone="rose"
        />
      </div>
    </div>
  );
}

function AgingCard({
  title, sub, items, tone,
}: {
  title: string;
  sub: string;
  items: { date: string; remain: number }[];
  tone: "emerald" | "rose";
}) {
  const buckets = { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
  items.forEach((it) => {
    if (it.remain <= 0) return;
    const days = Math.floor((Date.now() - new Date(it.date).getTime()) / 86400000);
    if (days <= 30) buckets["0-30"] += it.remain;
    else if (days <= 60) buckets["31-60"] += it.remain;
    else if (days <= 90) buckets["61-90"] += it.remain;
    else buckets["90+"] += it.remain;
  });
  const max = Math.max(...Object.values(buckets), 1);
  const barColor = tone === "emerald" ? "bg-emerald-500" : "bg-rose-500";

  return (
    <Card className="p-5 gap-4">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <div className="space-y-3">
        {Object.entries(buckets).map(([range, amt]) => {
          const pct = (amt / max) * 100;
          return (
            <div key={range}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium">{range} days</span>
                <span className="font-semibold">{fmtMoney(amt)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
