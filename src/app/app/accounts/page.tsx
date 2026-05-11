"use client";

import { useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { DataStrip } from "@/components/shared/data-strip";
import { Section } from "@/components/shared/section";
import { cn } from "@/lib/utils";

export default function AccountsDashboard() {
  const db = useStore((s) => s.db);
  const ccy = db.settings.currency;
  const ar = db.invoices.reduce((s, i) => s + i.total - i.paid, 0);
  const ap = db.bills.reduce((s, b) => s + b.amount - b.paid, 0);
  const overdue = db.invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total - i.paid, 0);
  const gstCollected = db.invoices.reduce((s, i) => s + i.gst, 0);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div>
      <PageHeader
        meta={`books · ${today}`}
        title="Books snapshot"
        sub={`Net ${fmtMoney(ar - ap, ccy)} · GST collected ${fmtMoney(gstCollected, ccy)} this period.`}
      />

      <DataStrip
        facts={[
          { label: "Receivable", value: fmtMoney(ar, ccy), sub: `${db.invoices.filter((i) => i.status !== "paid").length} open` },
          { label: "Payable", value: fmtMoney(ap, ccy), sub: `${db.bills.filter((b) => b.status !== "paid").length} open`, trend: "down" },
          { label: "Overdue", value: fmtMoney(overdue, ccy), sub: overdue ? "follow up" : "—", trend: overdue ? "down" : undefined },
          { label: "GST liability", value: fmtMoney(gstCollected, ccy), sub: "this period" },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        <AgingCard
          title="AR aging"
          sub="Money owed to us"
          items={db.invoices.map((i) => ({ date: i.date, remain: i.total - i.paid }))}
          color="emerald"
        />
        <AgingCard
          title="AP aging"
          sub="Money we owe"
          items={db.bills.map((b) => ({ date: b.date, remain: b.amount - b.paid }))}
          color="rose"
        />
      </div>
    </div>
  );
}

function AgingCard({
  title, sub, items, color,
}: { title: string; sub: string; items: { date: string; remain: number }[]; color: "emerald" | "rose" }) {
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

  return (
    <Section title={title} sub={sub}>
      <div className="border-t border-border">
        {Object.entries(buckets).map(([range, amt]) => {
          const pct = (amt / max) * 100;
          return (
            <div key={range} className="border-b border-border py-2.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{range} days</span>
                <span className="mono font-semibold">{fmtMoney(amt)}</span>
              </div>
              <div className="h-1 bg-muted mt-2">
                <div className={cn("h-full", color === "emerald" ? "bg-emerald-700" : "bg-rose-700")} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
