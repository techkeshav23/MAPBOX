"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { fmtMoney, fmtCompact, fmtDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Download } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const db = useStore((s) => s.db);
  const ccy = db.settings.currency;
  const [mode, setMode] = useState<"daily" | "monthly">("daily");
  const today = new Date().toISOString().slice(0, 10);
  const monthIso = today.slice(0, 7);

  function exportReport() {
    const wb = XLSX.utils.book_new();
    if (mode === "daily") {
      const todayMarks = db.attendance.filter((a) => a.date === today);
      const att = [["Worker", "Role", "Status", "OT"]].concat(
        db.labour.map((l) => {
          const a = todayMarks.find((x) => x.laborId === l.id);
          return [l.name, l.role, a?.status ?? "unmarked", String(a?.hoursOt ?? 0)];
        }),
      );
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(att), "Attendance");
      const orders = [["Order", "Customer", "Species", "CFT", "Value", "Status"]].concat(
        db.orders.filter((o) => o.date === today).map((o) => {
          const c = db.customers.find((x) => x.id === o.customerId)!;
          return [o.id, c.name, o.species, String(o.cft), String(o.cft * o.ratePerCft), o.status];
        }),
      );
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(orders), "Orders");
      XLSX.writeFile(wb, `Daily report ${today}.xlsx`);
    } else {
      const monthAtt = db.attendance.filter((a) => a.date.startsWith(monthIso));
      const hr = [["Worker", "Role", "Present", "Half", "OT hrs", "Wages"]].concat(
        db.labour.map((l) => {
          const recs = monthAtt.filter((a) => a.laborId === l.id);
          const p = recs.filter((r) => r.status === "present").length;
          const h = recs.filter((r) => r.status === "half").length;
          const ot = recs.reduce((s, r) => s + r.hoursOt, 0);
          const base = l.dailyWage ?? 0;
          return [l.name, l.role, String(p), String(h), String(ot), String(p * base + (h * base) / 2)];
        }),
      );
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(hr), "HR");
      const inv = [["Invoice", "Customer", "Date", "Total", "Paid", "Status"]].concat(
        db.invoices.map((i) => {
          const c = db.customers.find((x) => x.id === i.customerId)!;
          return [i.id, c.name, i.date, String(i.total), String(i.paid), i.status];
        }),
      );
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(inv), "Invoices");
      const bills = [["Bill", "Vendor", "Date", "Amount", "Paid", "Status"]].concat(
        db.bills.map((b) => [b.id, b.vendor, b.date, String(b.amount), String(b.paid), b.status]),
      );
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(bills), "Bills");
      XLSX.writeFile(wb, `Monthly report ${monthIso}.xlsx`);
    }
    toast.success("Report downloaded");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        sub="Live snapshot from your operating data"
        actions={
          <div className="flex items-center gap-2">
            <Tabs value={mode} onValueChange={(v) => setMode(v as "daily" | "monthly")}>
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" onClick={exportReport}>
              <Download className="w-4 h-4" /> Export Excel
            </Button>
          </div>
        }
      />

      {mode === "daily" ? <DailyReport /> : <MonthlyReport />}
    </div>
  );
}

function DailyReport() {
  const db = useStore((s) => s.db);
  const ccy = db.settings.currency;
  const today = new Date().toISOString().slice(0, 10);
  const todayMarks = db.attendance.filter((a) => a.date === today);
  const present = todayMarks.filter((a) => a.status === "present").length;
  const ot = todayMarks.reduce((s, a) => s + a.hoursOt, 0);
  const wages = todayMarks.reduce((s, a) => {
    const lab = db.labour.find((l) => l.id === a.laborId);
    const base = lab?.dailyWage ?? 0;
    return s + (a.status === "present" ? base : a.status === "half" ? base / 2 : 0);
  }, 0);
  const todayLogs = db.logs.filter((l) => l.received === today);
  const todayOrders = db.orders.filter((o) => o.date === today);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Date" value={fmtDate(today)} />
        <StatCard label="Present" value={`${present}/${db.labour.length}`} />
        <StatCard label="OT hours" value={ot} />
        <StatCard label="Wage liability" value={fmtMoney(wages, ccy)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <SimpleTable
          title="Attendance"
          headers={["Worker", "Role", "Status", "OT"]}
          rows={db.labour.map((l) => {
            const a = todayMarks.find((x) => x.laborId === l.id);
            return [l.name, l.role, a?.status ?? "unmarked", a?.hoursOt ?? 0];
          })}
        />
        <SimpleTable
          title="Inbound logs today"
          headers={["Lot", "Species", "Supplier", "Pcs", "CFT"]}
          rows={
            todayLogs.length
              ? todayLogs.map((l) => [l.id, l.species, l.supplier, l.pieces, l.gradedCft])
              : [["—", "no inbound today", "—", "—", "—"]]
          }
        />
      </div>

      <SimpleTable
        title="Today's orders"
        headers={["Order", "Customer", "Species", "CFT", "Value", "Status"]}
        rows={
          todayOrders.length
            ? todayOrders.map((o) => {
                const c = db.customers.find((x) => x.id === o.customerId)!;
                return [o.id, c.name, o.species, o.cft, fmtMoney(o.cft * o.ratePerCft, ccy), o.status];
              })
            : [["—", "no orders booked today", "—", "—", "—", "—"]]
        }
      />
    </>
  );
}

function MonthlyReport() {
  const db = useStore((s) => s.db);
  const ccy = db.settings.currency;
  const monthIso = new Date().toISOString().slice(0, 7);
  const monthName = new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });
  const monthLogs = db.logs.filter((l) => l.received.startsWith(monthIso));
  const monthAtt = db.attendance.filter((a) => a.date.startsWith(monthIso));
  const monthInv = db.invoices.filter((i) => i.date.startsWith(monthIso));
  const monthBills = db.bills.filter((b) => b.date.startsWith(monthIso));

  const cftIn = monthLogs.reduce((s, l) => s + l.gradedCft, 0);
  const revenue = monthInv.reduce((s, i) => s + i.total, 0);
  const expense = monthBills.reduce((s, b) => s + b.amount, 0);

  const custMap: Record<string, number> = {};
  db.orders.filter((o) => o.date.startsWith(monthIso)).forEach((o) => {
    const c = db.customers.find((x) => x.id === o.customerId);
    if (!c) return;
    custMap[c.name] = (custMap[c.name] ?? 0) + o.cft * o.ratePerCft;
  });

  const vendMap: Record<string, number> = {};
  monthBills.forEach((b) => { vendMap[b.vendor] = (vendMap[b.vendor] ?? 0) + b.amount; });

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Period" value={monthName} />
        <StatCard label="Inbound CFT" value={fmtCompact(cftIn)} />
        <StatCard label="Revenue billed" value={fmtMoney(revenue, ccy)} />
        <StatCard label="Spend" value={fmtMoney(expense, ccy)} />
      </div>

      <section className="rule-thin pt-3">
        <div className="text-[13px] font-semibold uppercase tracking-wide mb-3">Revenue vs spend · this month</div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              data={[
                { wk: "Wk 1", Revenue: 85000, Spend: 62000 },
                { wk: "Wk 2", Revenue: 120000, Spend: 95000 },
                { wk: "Wk 3", Revenue: 96000, Spend: 71000 },
                { wk: "Wk 4", Revenue: 142000, Spend: 110000 },
              ]}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#E5E0D6" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="wk" stroke="#6B5E51" tick={{ fontSize: 11, fontFamily: "var(--font-plex-mono)" }} axisLine={{ stroke: "#1B1410" }} tickLine={false} />
              <YAxis stroke="#6B5E51" tick={{ fontSize: 11, fontFamily: "var(--font-plex-mono)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={36} />
              <Tooltip formatter={(v) => fmtMoney(Number(v))} contentStyle={{ borderRadius: 2, border: "1px solid #1B1410", fontSize: 11, fontFamily: "var(--font-plex-mono)" }} />
              <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-plex-mono)" }} />
              <Bar dataKey="Revenue" fill="#1B1410" />
              <Bar dataKey="Spend" fill="#C8945A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-4">
        <SimpleTable
          title="Top customers (this month)"
          headers={["Customer", "Order value"]}
          rows={Object.entries(custMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, v]) => [n, fmtMoney(v, ccy)])}
        />
        <SimpleTable
          title="Top vendors (this month)"
          headers={["Vendor", "Spend"]}
          rows={Object.entries(vendMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n, v]) => [n, fmtMoney(v, ccy)])}
        />
      </div>

      <SimpleTable
        title="HR roll-up"
        headers={["Worker", "Role", "Present", "Half", "OT", "Wages"]}
        rows={db.labour.map((l) => {
          const recs = monthAtt.filter((a) => a.laborId === l.id);
          const p = recs.filter((r) => r.status === "present").length;
          const h = recs.filter((r) => r.status === "half").length;
          const ot = recs.reduce((s, r) => s + r.hoursOt, 0);
          const base = l.dailyWage ?? 0;
          return [l.name, l.role, p, h, ot, fmtMoney(p * base + (h * base) / 2, ccy)];
        })}
      />
    </>
  );
}

function SimpleTable({
  title, headers, rows,
}: { title: string; headers: string[]; rows: (string | number)[][] }) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-5 pt-4 pb-2 text-sm font-semibold">{title}</div>
      <Table>
        <TableHeader>
          <TableRow>{headers.map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>{r.map((c, j) => <TableCell key={j}>{c}</TableCell>)}</TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
