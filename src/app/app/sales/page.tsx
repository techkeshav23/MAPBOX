"use client";

import { useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { DataStrip } from "@/components/shared/data-strip";
import { Section } from "@/components/shared/section";
import { StatusDot } from "@/components/shared/status-dot";

export default function SalesDashboard() {
  const db = useStore((s) => s.db);
  const ccy = db.settings.currency;
  const open = db.orders.filter((o) => o.status !== "fulfilled");
  const fulfilled = db.orders.filter((o) => o.status === "fulfilled");
  const revenue = db.orders.reduce((s, o) => s + o.cft * o.ratePerCft, 0);
  const outstanding = db.customers.reduce((s, c) => s + c.balance, 0);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div>
      <PageHeader
        meta={`sales · ${today}`}
        title="Sales desk"
        sub={`${open.length} open · ${fulfilled.length} fulfilled this month.`}
      />

      <DataStrip
        facts={[
          { label: "Open orders", value: open.length, sub: `of ${db.orders.length}` },
          { label: "Order value (mo.)", value: fmtMoney(revenue, ccy), sub: "+12% MoM", trend: "up" },
          { label: "Customers", value: db.customers.length, sub: `${db.customers.filter((c) => c.balance > 0).length} with balance` },
          { label: "Outstanding AR", value: fmtMoney(outstanding, ccy), sub: "across customers" },
        ]}
      />

      <Section title="Order pipeline" sub="latest first" className="mt-8">
        <table className="w-full text-sm border-t border-border">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              <th className="text-left py-2 pr-3 font-semibold">Order</th>
              <th className="text-left py-2 pr-3 font-semibold">Customer</th>
              <th className="text-left py-2 pr-3 font-semibold">Species</th>
              <th className="text-right py-2 pr-3 font-semibold">CFT</th>
              <th className="text-right py-2 pr-3 font-semibold">Value</th>
              <th className="text-right py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {db.orders.map((o) => {
              const c = db.customers.find((x) => x.id === o.customerId)!;
              return (
                <tr key={o.id} className="border-t border-border">
                  <td className="py-2 pr-3 mono text-xs">{o.id}</td>
                  <td className="py-2 pr-3">
                    <div className="font-medium leading-tight">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">{c.city}</div>
                  </td>
                  <td className="py-2 pr-3">{o.species}</td>
                  <td className="py-2 pr-3 text-right mono">{o.cft}</td>
                  <td className="py-2 pr-3 text-right mono font-semibold">{fmtMoney(o.cft * o.ratePerCft, ccy)}</td>
                  <td className="py-2 text-right"><StatusDot value={o.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
