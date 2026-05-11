"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/format";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ClipboardCheck, Users } from "lucide-react";

export default function HrDashboard() {
  const db = useStore((s) => s.db);
  const ccy = db.settings.currency;
  const today = new Date().toISOString().slice(0, 10);
  const todayMarks = db.attendance.filter((a) => a.date === today);
  const present = todayMarks.filter((a) => a.status === "present").length;
  const half = todayMarks.filter((a) => a.status === "half").length;
  const absent = todayMarks.filter((a) => a.status === "absent").length;
  const ot = todayMarks.reduce((s, a) => s + a.hoursOt, 0);
  const wages = todayMarks.reduce((s, a) => {
    const lab = db.labour.find((l) => l.id === a.laborId);
    const base = lab?.dailyWage ?? 0;
    return s + (a.status === "present" ? base : a.status === "half" ? base / 2 : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Workforce today</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {present} present · {half} half-day · {absent} absent. Today&apos;s wage liability: {fmtMoney(wages, ccy)}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total workers" value={db.labour.length} delta="on roll" />
        <StatCard label="Present today" value={present} delta={`${db.labour.length - absent}/${db.labour.length}`} trend={absent === 0 ? "up" : "flat"} />
        <StatCard label="OT hours" value={ot} delta="today" />
        <StatCard label="Today wages" value={fmtMoney(wages, ccy)} delta="estimate" />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          href="/app/workforce/attendance"
          className="rounded-lg border border-border hover:border-wood-400 transition p-5 flex items-center gap-3 bg-card"
        >
          <div className="w-10 h-10 rounded-lg bg-wood-100 text-wood-700 grid place-items-center">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-sm">Mark attendance</div>
            <div className="text-xs text-muted-foreground">Today&apos;s marking sheet</div>
          </div>
        </Link>
        <Link
          href="/app/workforce/labour"
          className="rounded-lg border border-border hover:border-wood-400 transition p-5 flex items-center gap-3 bg-card"
        >
          <div className="w-10 h-10 rounded-lg bg-wood-100 text-wood-700 grid place-items-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-sm">Worker directory</div>
            <div className="text-xs text-muted-foreground">{db.labour.length} entries</div>
          </div>
        </Link>
      </div>

      <Card className="p-0 gap-0 overflow-hidden">
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <div className="text-sm font-semibold">Today&apos;s roster</div>
          <Link href="/app/workforce/attendance" className="text-xs text-wood-700 font-semibold hover:underline">
            Mark attendance →
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker</TableHead><TableHead>Role</TableHead>
              <TableHead>Status</TableHead><TableHead>OT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {db.labour.map((l) => {
              const a = todayMarks.find((x) => x.laborId === l.id);
              return (
                <TableRow key={l.id}>
                  <TableCell>
                    <div className="font-semibold">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.phone}</div>
                  </TableCell>
                  <TableCell>{l.role}</TableCell>
                  <TableCell><StatusBadge value={a?.status ?? "absent"} /></TableCell>
                  <TableCell>{a?.hoursOt ? `${a.hoursOt} hr` : "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
