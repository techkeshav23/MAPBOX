"use client";

import { useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/format";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function SalesDashboard() {
  const db = useStore((s) => s.db);
  const ccy = db.settings.currency;
  const open = db.orders.filter((o) => o.status !== "fulfilled");
  const fulfilled = db.orders.filter((o) => o.status === "fulfilled");
  const revenue = db.orders.reduce((s, o) => s + o.cft * o.ratePerCft, 0);
  const outstanding = db.customers.reduce((s, c) => s + c.balance, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sales desk</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {open.length} open orders · {fulfilled.length} fulfilled this month
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Open orders" value={open.length} delta={`${db.orders.length} total`} />
        <StatCard label="Order value (mo.)" value={fmtMoney(revenue, ccy)} delta="+12% MoM" trend="up" />
        <StatCard label="Customers" value={db.customers.length} delta={`${db.customers.filter((c) => c.balance > 0).length} with balance`} />
        <StatCard label="Outstanding" value={fmtMoney(outstanding, ccy)} delta="across customers" />
      </div>

      <Card className="p-0 gap-0 overflow-hidden">
        <div className="px-5 pt-4 pb-2 text-sm font-semibold">Order pipeline</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead><TableHead>Customer</TableHead>
              <TableHead>Species</TableHead><TableHead>CFT</TableHead>
              <TableHead>Value</TableHead><TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {db.orders.map((o) => {
              const c = db.customers.find((x) => x.id === o.customerId)!;
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell><StatusBadge value={o.species} tone="wood" /></TableCell>
                  <TableCell>{o.cft}</TableCell>
                  <TableCell className="font-semibold">{fmtMoney(o.cft * o.ratePerCft, ccy)}</TableCell>
                  <TableCell><StatusBadge value={o.status} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
