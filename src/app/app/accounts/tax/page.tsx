"use client";

import { useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function TaxPage() {
  const db = useStore((s) => s.db);
  const ccy = db.settings.currency;
  const gstOut = db.invoices.reduce((s, i) => s + i.gst, 0);
  const gstIn = 24500;
  const tdsLiab = 8200;

  const filings = [
    ["GSTR-1", "April 2026", "2026-05-11", "due in 0 days", "amber"],
    ["GSTR-3B", "April 2026", "2026-05-20", "scheduled", "slate"],
    ["TDS — 26Q", "Q4 FY 2025-26", "2026-05-31", "scheduled", "slate"],
    ["PT (Haryana)", "April 2026", "2026-05-15", "scheduled", "slate"],
  ] as const;

  return (
    <div className="space-y-4">
      <PageHeader title="GST & Tax" sub="Compliance summary — current period" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="GST collected (output)" value={fmtMoney(gstOut, ccy)} delta="from sales" />
        <StatCard label="GST input credit" value={fmtMoney(gstIn, ccy)} delta="from purchases" />
        <StatCard label="Net GST payable" value={fmtMoney(gstOut - gstIn, ccy)} delta="this month" />
        <StatCard label="TDS liability" value={fmtMoney(tdsLiab, ccy)} delta="on contract pay" />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 pt-4 pb-2 text-sm font-semibold">Upcoming filings</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Form</TableHead><TableHead>Period</TableHead>
              <TableHead>Due date</TableHead><TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filings.map(([form, period, due, status, tone]) => (
              <TableRow key={form}>
                <TableCell>{form}</TableCell>
                <TableCell>{period}</TableCell>
                <TableCell>{due}</TableCell>
                <TableCell><StatusBadge value={status} tone={tone as "amber" | "slate"} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
