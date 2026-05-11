"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { fmtDate } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Status = "present" | "half" | "absent";

export default function AttendancePage() {
  const labour = useStore((s) => s.db.labour);
  const attendance = useStore((s) => s.db.attendance);
  const setDb = useStore((s) => s.setDb);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const todayMarks = attendance.filter((a) => a.date === date);
  const counts = {
    present: todayMarks.filter((a) => a.status === "present").length,
    half: todayMarks.filter((a) => a.status === "half").length,
    absent: todayMarks.filter((a) => a.status === "absent").length,
  };

  function setStatus(laborId: string, status: Status) {
    setDb((db) => {
      const idx = db.attendance.findIndex((x) => x.date === date && x.laborId === laborId);
      if (idx === -1) db.attendance.push({ date, laborId, status, hoursOt: 0 });
      else db.attendance[idx].status = status;
    });
    toast.success("Saved");
  }
  function setOt(laborId: string, ot: number) {
    setDb((db) => {
      const idx = db.attendance.findIndex((x) => x.date === date && x.laborId === laborId);
      if (idx === -1) db.attendance.push({ date, laborId, status: "present", hoursOt: ot });
      else db.attendance[idx].hoursOt = ot;
    });
  }

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        sub="Mark per worker. Saves to payroll input automatically."
        actions={<Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="max-w-[12rem]" />}
      />

      <Card className="p-0 overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Mark sheet — {fmtDate(date)}</div>
            <div className="text-xs text-muted-foreground">Click P / ½ / A to set status.</div>
          </div>
          <div className="text-xs text-muted-foreground">
            {counts.present} present · {counts.half} half · {counts.absent} absent
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Worker</TableHead><TableHead>Role</TableHead>
              <TableHead>Status</TableHead><TableHead>OT (hrs)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {labour.map((l) => {
              const rec = todayMarks.find((x) => x.laborId === l.id) ?? { status: "absent" as Status, hoursOt: 0 };
              return (
                <TableRow key={l.id}>
                  <TableCell>
                    <div className="font-semibold">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.phone}</div>
                  </TableCell>
                  <TableCell>{l.role}</TableCell>
                  <TableCell>
                    <div className="inline-flex rounded-lg border border-border overflow-hidden">
                      <StatusBtn s="present" current={rec.status} onClick={() => setStatus(l.id, "present")}>P</StatusBtn>
                      <StatusBtn s="half" current={rec.status} onClick={() => setStatus(l.id, "half")}>½</StatusBtn>
                      <StatusBtn s="absent" current={rec.status} onClick={() => setStatus(l.id, "absent")}>A</StatusBtn>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={8}
                      value={rec.hoursOt}
                      onChange={(e) => setOt(l.id, +e.target.value || 0)}
                      className="max-w-[6rem]"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 pt-4 pb-2">
          <div className="text-sm font-semibold">Last 14 days</div>
          <div className="text-xs text-muted-foreground">P · ½ · A · — = no record</div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                {days.map((d) => (
                  <TableHead key={d} className="text-center">
                    {new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {labour.map((l) => (
                <TableRow key={l.id}>
                  <TableCell><div className="font-semibold text-sm">{l.name}</div></TableCell>
                  {days.map((d) => {
                    const r = attendance.find((x) => x.date === d && x.laborId === l.id);
                    if (!r) return <TableCell key={d} className="text-center text-muted-foreground/50">—</TableCell>;
                    const cls = r.status === "present" ? "text-emerald-700" : r.status === "half" ? "text-amber-700" : "text-rose-600";
                    const sym = r.status === "present" ? "P" : r.status === "half" ? "½" : "A";
                    return <TableCell key={d} className={`text-center font-bold ${cls}`}>{sym}</TableCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}

function StatusBtn({
  s, current, onClick, children,
}: { s: Status; current: Status; onClick: () => void; children: React.ReactNode }) {
  const active = s === current;
  const colors = {
    present: "bg-emerald-600 text-white",
    half: "bg-amber-500 text-white",
    absent: "bg-rose-600 text-white",
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 text-xs font-semibold border-l first:border-l-0 border-border",
        active ? colors[s] : "bg-background text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
