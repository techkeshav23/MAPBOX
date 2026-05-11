"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { fmtMoney } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { DataStrip } from "@/components/shared/data-strip";
import { Section } from "@/components/shared/section";
import { StatusDot } from "@/components/shared/status-dot";
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
  const todayLabel = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div>
      <PageHeader
        meta={`workforce · ${todayLabel}`}
        title="Workforce today"
        sub={`${present} present · ${half} half-day · ${absent} absent. Wage liability for today: ${fmtMoney(wages, ccy)}.`}
      />

      <DataStrip
        facts={[
          { label: "On roll", value: db.labour.length },
          { label: "Present", value: `${present}/${db.labour.length}`, sub: absent === 0 ? "full strength" : `${absent} absent`, trend: absent === 0 ? "up" : "down" },
          { label: "OT hours", value: ot, sub: "today" },
          { label: "Today wages", value: fmtMoney(wages, ccy), sub: "estimate" },
        ]}
      />

      <Section title="Quick actions" className="mt-8">
        <div className="grid sm:grid-cols-2 gap-px bg-border">
          <Link href="/app/workforce/attendance" className="bg-background hover:bg-muted/50 p-4 flex items-center gap-3">
            <ClipboardCheck className="w-4 h-4 text-wood-700" />
            <div>
              <div className="font-medium text-sm">Mark attendance</div>
              <div className="text-[11px] mono text-muted-foreground">→ /workforce/attendance</div>
            </div>
          </Link>
          <Link href="/app/workforce/labour" className="bg-background hover:bg-muted/50 p-4 flex items-center gap-3">
            <Users className="w-4 h-4 text-wood-700" />
            <div>
              <div className="font-medium text-sm">Worker directory</div>
              <div className="text-[11px] mono text-muted-foreground">{db.labour.length} entries</div>
            </div>
          </Link>
        </div>
      </Section>

      <Section
        title={`Today's roster · ${todayLabel}`}
        right={<Link href="/app/workforce/attendance" className="text-xs text-wood-700 font-semibold hover:underline mono">mark →</Link>}
        className="mt-8"
      >
        <table className="w-full text-sm border-t border-border">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              <th className="text-left py-2 pr-3 font-semibold">Worker</th>
              <th className="text-left py-2 pr-3 font-semibold">Role</th>
              <th className="text-left py-2 pr-3 font-semibold">Status</th>
              <th className="text-right py-2 font-semibold">OT</th>
            </tr>
          </thead>
          <tbody>
            {db.labour.map((l) => {
              const a = todayMarks.find((x) => x.laborId === l.id);
              return (
                <tr key={l.id} className="border-t border-border">
                  <td className="py-2 pr-3">
                    <div className="font-medium leading-tight">{l.name}</div>
                    <div className="text-[11px] mono text-muted-foreground">{l.phone}</div>
                  </td>
                  <td className="py-2 pr-3">{l.role}</td>
                  <td className="py-2 pr-3"><StatusDot value={a?.status ?? "absent"} /></td>
                  <td className="py-2 text-right mono">{a?.hoursOt ? `${a.hoursOt} hr` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>
    </div>
  );
}
