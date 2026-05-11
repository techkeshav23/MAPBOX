"use client";

import { useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/format";
import { PageHeader } from "./page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { toast } from "sonner";

export function PayrollTable({ canEdit }: { canEdit: boolean }) {
  const db = useStore((s) => s.db);
  const ccy = db.settings.currency;
  const monthIso = new Date().toISOString().slice(0, 7);

  const rows = db.labour.map((l) => {
    const recs = db.attendance.filter((a) => a.laborId === l.id && a.date.startsWith(monthIso));
    const present = recs.filter((r) => r.status === "present").length;
    const half = recs.filter((r) => r.status === "half").length;
    const ot = recs.reduce((s, r) => s + r.hoursOt, 0);
    const base = l.dailyWage ?? 0;
    const wages = present * base + (half * base) / 2;
    const otPay = ot * (base / 8) * 1.5;
    return { ...l, present, half, ot, wages, otPay, total: wages + otPay };
  });
  const totalPay = rows.reduce((s, r) => s + r.total, 0);
  const monthName = new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Payroll · ${monthName}`}
        sub={`${db.labour.length} workers · gross liability ${fmtMoney(totalPay, ccy)}${canEdit ? "" : " · view only"}`}
        actions={
          canEdit ? (
            <Button variant="outline" onClick={() => toast.success("Export queued")}>
              <Download className="w-4 h-4" /> Export
            </Button>
          ) : null
        }
      />
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker</TableHead><TableHead>Role</TableHead>
              <TableHead>Present</TableHead><TableHead>Half</TableHead>
              <TableHead>OT hrs</TableHead><TableHead>Base wage</TableHead>
              <TableHead>OT pay</TableHead><TableHead>Total</TableHead>
              {canEdit && <TableHead />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.phone}</div>
                </TableCell>
                <TableCell>{r.role}</TableCell>
                <TableCell>{r.present}</TableCell>
                <TableCell>{r.half}</TableCell>
                <TableCell>{r.ot}</TableCell>
                <TableCell>{fmtMoney(r.wages, ccy)}</TableCell>
                <TableCell>{fmtMoney(r.otPay, ccy)}</TableCell>
                <TableCell className="font-bold">{fmtMoney(r.total, ccy)}</TableCell>
                {canEdit && (
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => toast.success(`Disbursed to ${r.name}`)}>
                      Pay
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            <TableRow className="bg-muted/50">
              <TableCell colSpan={7} className="text-right font-semibold">Gross total</TableCell>
              <TableCell className="font-bold text-lg">{fmtMoney(totalPay, ccy)}</TableCell>
              {canEdit && <TableCell />}
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
