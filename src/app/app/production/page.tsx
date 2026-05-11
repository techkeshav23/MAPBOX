"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { fmtCompact } from "@/lib/format";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Logs, Hammer, FileSpreadsheet } from "lucide-react";

export default function ProductionDashboardPage() {
  const db = useStore((s) => s.db);
  const cftIn = db.logs.reduce((s, l) => s + l.gradedCft, 0);
  const cftOut = db.sawJobs.reduce((s, j) => s + j.outputCft, 0);
  const cftWaste = db.sawJobs.reduce((s, j) => s + j.wastageCft, 0);
  const yieldPct = cftOut + cftWaste > 0 ? (cftOut / (cftOut + cftWaste)) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Production floor</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {db.logs.filter((l) => l.status === "pending").length} logs awaiting grading ·{" "}
            {db.sawJobs.filter((j) => j.status === "in_progress").length} jobs in progress
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Logs in inventory" value={db.logs.length} delta={`${db.logs.filter((l) => l.status === "graded").length} graded`} trend="flat" />
        <StatCard label="CFT received" value={fmtCompact(cftIn)} delta="this month" trend="flat" />
        <StatCard label="CFT output" value={fmtCompact(cftOut)} delta="this month" trend="flat" />
        <StatCard label="Yield" value={`${yieldPct.toFixed(1)}%`} delta={yieldPct > 80 ? "healthy" : "monitor"} trend={yieldPct > 80 ? "up" : "down"} />
      </div>

      <Card className="p-5 gap-3">
        <div className="text-sm font-semibold">Quick actions</div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { href: "/app/production/logs", icon: Logs, title: "New log entry", sub: "Record inbound truck" },
            { href: "/app/production/sawing", icon: Hammer, title: "Start sawing job", sub: "Assign mistri to a log" },
            { href: "/app/sheets", icon: FileSpreadsheet, title: "Yield log", sub: "Open in Sheets" },
          ].map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="rounded-lg border border-border hover:border-wood-400 hover:bg-wood-50/40 p-3 flex items-center gap-3 transition"
            >
              <div className="w-10 h-10 rounded-lg bg-wood-100 text-wood-700 grid place-items-center">
                <q.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">{q.title}</div>
                <div className="text-xs text-muted-foreground">{q.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="p-0 gap-0 overflow-hidden">
        <div className="px-5 pt-4 pb-2 text-sm font-semibold">Active sawing jobs</div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead><TableHead>Log</TableHead><TableHead>Mistri</TableHead>
              <TableHead>Input CFT</TableHead><TableHead>Output CFT</TableHead><TableHead>Yield</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {db.sawJobs.map((j) => {
              const lab = db.labour.find((l) => l.id === j.mistriId);
              const yp = j.inputCft > 0 ? ((j.outputCft / j.inputCft) * 100).toFixed(1) : "—";
              return (
                <TableRow key={j.id}>
                  <TableCell className="font-mono text-xs">{j.id}</TableCell>
                  <TableCell className="font-mono text-xs">{j.logId}</TableCell>
                  <TableCell>{lab?.name ?? "—"}</TableCell>
                  <TableCell>{j.inputCft}</TableCell>
                  <TableCell>{j.outputCft || "—"}</TableCell>
                  <TableCell>{j.outputCft ? `${yp}%` : "—"}</TableCell>
                  <TableCell><StatusBadge value={j.status} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
