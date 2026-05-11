"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { fmtCompact, fmtDateTime } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { DataStrip } from "@/components/shared/data-strip";
import { Section } from "@/components/shared/section";
import { StatusDot } from "@/components/shared/status-dot";
import { Logs, Hammer, FileSpreadsheet } from "lucide-react";

export default function ProductionDashboardPage() {
  const db = useStore((s) => s.db);
  const cftIn = db.logs.reduce((s, l) => s + l.gradedCft, 0);
  const cftOut = db.sawJobs.reduce((s, j) => s + j.outputCft, 0);
  const cftWaste = db.sawJobs.reduce((s, j) => s + j.wastageCft, 0);
  const yieldPct = cftOut + cftWaste > 0 ? (cftOut / (cftOut + cftWaste)) * 100 : 0;
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div>
      <PageHeader
        meta={`production · ${today}`}
        title="Floor status"
        sub={`${db.logs.filter((l) => l.status === "pending").length} logs awaiting grading · ${db.sawJobs.filter((j) => j.status === "in_progress").length} jobs running.`}
      />

      <DataStrip
        facts={[
          { label: "Lots in inventory", value: db.logs.length, sub: `${db.logs.filter((l) => l.status === "graded").length} graded` },
          { label: "CFT received", value: fmtCompact(cftIn), sub: "this month" },
          { label: "CFT output", value: fmtCompact(cftOut), sub: "this month" },
          { label: "Yield ratio", value: `${yieldPct.toFixed(1)}%`, sub: yieldPct > 80 ? "healthy" : "monitor", trend: yieldPct > 80 ? "up" : "down" },
        ]}
      />

      <Section title="Quick actions" className="mt-8">
        <div className="grid sm:grid-cols-3 gap-px bg-border">
          {[
            { href: "/app/production/logs", icon: Logs, title: "Record inbound truck", sub: "→ /production/logs" },
            { href: "/app/production/sawing", icon: Hammer, title: "Start sawing job", sub: "→ /production/sawing" },
            { href: "/app/sheets", icon: FileSpreadsheet, title: "Open yield log", sub: "→ /sheets" },
          ].map((q) => (
            <Link key={q.href} href={q.href} className="bg-background hover:bg-muted/50 p-4 flex items-center gap-3 transition-colors">
              <q.icon className="w-4 h-4 text-wood-700" />
              <div>
                <div className="font-medium text-sm">{q.title}</div>
                <div className="text-[11px] mono text-muted-foreground">{q.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Active sawing jobs" sub="latest first" className="mt-8">
        <table className="w-full text-sm border-t border-border">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              <th className="text-left py-2 pr-3 font-semibold">Job</th>
              <th className="text-left py-2 pr-3 font-semibold">Log</th>
              <th className="text-left py-2 pr-3 font-semibold">Mistri</th>
              <th className="text-left py-2 pr-3 font-semibold">Started</th>
              <th className="text-right py-2 pr-3 font-semibold">In</th>
              <th className="text-right py-2 pr-3 font-semibold">Out</th>
              <th className="text-right py-2 pr-3 font-semibold">Yield</th>
              <th className="text-right py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {db.sawJobs.map((j) => {
              const lab = db.labour.find((l) => l.id === j.mistriId);
              const yp = j.inputCft > 0 ? ((j.outputCft / j.inputCft) * 100).toFixed(1) : "—";
              return (
                <tr key={j.id} className="border-t border-border">
                  <td className="py-2 pr-3 mono text-xs">{j.id}</td>
                  <td className="py-2 pr-3 mono text-xs">{j.logId}</td>
                  <td className="py-2 pr-3">{lab?.name ?? "—"}</td>
                  <td className="py-2 pr-3 mono text-[11px] text-muted-foreground">{fmtDateTime(j.startedAt)}</td>
                  <td className="py-2 pr-3 text-right mono">{j.inputCft}</td>
                  <td className="py-2 pr-3 text-right mono">{j.outputCft || "—"}</td>
                  <td className="py-2 pr-3 text-right mono font-semibold">{j.outputCft ? `${yp}%` : "—"}</td>
                  <td className="py-2 text-right"><StatusDot value={j.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
