"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { fmtMoney, fmtDateTime, nextId } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import type { SawJob } from "@/lib/types";

export default function SawingPage() {
  const db = useStore((s) => s.db);
  const setDb = useStore((s) => s.setDb);
  const ccy = db.settings.currency;
  const [editing, setEditing] = useState<SawJob | "new" | null>(null);

  // Calculator state
  const [L, setL] = useState(96);
  const [W, setW] = useState(14);
  const [H, setH] = useState(6);
  const [P, setP] = useState(1);
  const [R, setR] = useState(db.settings.cftRate);
  const [M, setM] = useState(db.settings.mistriCommissionPct);
  const [O, setO] = useState(db.settings.ownerCommissionPct);

  const cft = (L * W * H * P) / 1728;
  const gross = cft * R;
  const mistri = (gross * M) / 100;
  const ownerReserve = (gross * O) / 100;
  const netOwner = gross - mistri - ownerReserve;

  function saveDefaults() {
    setDb((d) => {
      d.settings.cftRate = R;
      d.settings.mistriCommissionPct = M;
      d.settings.ownerCommissionPct = O;
    });
    toast.success("Defaults saved");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sawing"
        sub="Track jobs, calculate yield, and split commissions."
        actions={<Button onClick={() => setEditing("new")}><Plus className="w-4 h-4" /> New job</Button>}
      />

      {/* CFT Calculator */}
      <Card className="p-5 gap-4 bg-gradient-to-br from-wood-50 to-amber-50/40 border-wood-200/60">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-sm font-bold text-wood-900">Timber → CFT calculator</div>
            <div className="text-xs text-muted-foreground">L × W × H (in inches) ÷ 1728. Splits mistri & owner commission.</div>
          </div>
          <Badge className="bg-wood-100 text-wood-800 hover:bg-wood-100">Quick tool</Badge>
        </div>
        <div className="grid sm:grid-cols-4 gap-3">
          <Field label="Length (in)"><Input type="number" value={L} onChange={(e) => setL(+e.target.value || 0)} /></Field>
          <Field label="Width (in)"><Input type="number" value={W} onChange={(e) => setW(+e.target.value || 0)} /></Field>
          <Field label="Height (in)"><Input type="number" value={H} onChange={(e) => setH(+e.target.value || 0)} /></Field>
          <Field label="Pieces"><Input type="number" value={P} onChange={(e) => setP(+e.target.value || 0)} /></Field>
        </div>
        <div className="grid sm:grid-cols-4 gap-3">
          <Field label={`Sale rate / CFT (${ccy})`}><Input type="number" value={R} onChange={(e) => setR(+e.target.value || 0)} /></Field>
          <Field label="Mistri %"><Input type="number" value={M} onChange={(e) => setM(+e.target.value || 0)} /></Field>
          <Field label="Owner reserve %"><Input type="number" value={O} onChange={(e) => setO(+e.target.value || 0)} /></Field>
          <div className="flex items-end">
            <Button variant="outline" className="w-full" onClick={saveDefaults}>Save as default</Button>
          </div>
        </div>
        <div className="grid sm:grid-cols-4 gap-3">
          <ResultBox label="Total CFT" value={`${cft.toFixed(2)} CFT`} />
          <ResultBox label="Gross sale" value={fmtMoney(gross, ccy)} />
          <ResultBox label="Mistri commission" value={fmtMoney(mistri, ccy)} tone="amber" />
          <ResultBox label="Net to owner" value={fmtMoney(netOwner, ccy)} tone="emerald" />
        </div>
      </Card>

      {/* Jobs table */}
      <Card className="p-0 gap-0 overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Sawing jobs</div>
            <div className="text-xs text-muted-foreground">
              {db.sawJobs.filter((j) => j.status === "in_progress").length} in progress
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead><TableHead>Log</TableHead><TableHead>Mistri</TableHead>
              <TableHead>Started</TableHead><TableHead>Ended</TableHead>
              <TableHead>Input CFT</TableHead><TableHead>Output CFT</TableHead>
              <TableHead>Wastage</TableHead><TableHead>Yield</TableHead><TableHead>Status</TableHead><TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {db.sawJobs
              .slice()
              .sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt))
              .map((j) => {
                const lab = db.labour.find((l) => l.id === j.mistriId);
                const yp = j.inputCft > 0 ? (j.outputCft / j.inputCft) * 100 : 0;
                return (
                  <TableRow key={j.id}>
                    <TableCell className="font-mono text-xs">{j.id}</TableCell>
                    <TableCell className="font-mono text-xs">{j.logId}</TableCell>
                    <TableCell>{lab?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{fmtDateTime(j.startedAt)}</TableCell>
                    <TableCell className="text-muted-foreground">{j.endedAt ? fmtDateTime(j.endedAt) : "—"}</TableCell>
                    <TableCell>{j.inputCft}</TableCell>
                    <TableCell>{j.outputCft || "—"}</TableCell>
                    <TableCell>{j.wastageCft || "—"}</TableCell>
                    <TableCell>
                      {j.outputCft ? (
                        <span className={`font-semibold ${yp >= 80 ? "text-emerald-700" : "text-amber-700"}`}>
                          {yp.toFixed(1)}%
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell><StatusBadge value={j.status} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(j)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </Card>

      {editing && (
        <SawJobDialog
          existing={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            setDb((db) => {
              if (editing === "new") db.sawJobs.unshift(data);
              else {
                const idx = db.sawJobs.findIndex((x) => x.id === data.id);
                if (idx >= 0) db.sawJobs[idx] = data;
              }
            });
            setEditing(null);
            toast.success(editing === "new" ? "Job started" : "Job updated");
          }}
        />
      )}
    </div>
  );
}

function ResultBox({ label, value, tone }: { label: string; value: string; tone?: "amber" | "emerald" }) {
  const cls =
    tone === "amber" ? "bg-amber-50 border-amber-200 text-amber-900"
    : tone === "emerald" ? "bg-emerald-50 border-emerald-200 text-emerald-900"
    : "bg-card border-border";
  return (
    <div className={`rounded-lg border p-3 ${cls}`}>
      <div className="text-[11px] uppercase font-bold opacity-80">{label}</div>
      <div className="text-xl font-bold mt-0.5">{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-[11px] uppercase tracking-wide">{label}</Label>{children}</div>;
}

function SawJobDialog({
  existing, onClose, onSave,
}: { existing: SawJob | null; onClose: () => void; onSave: (j: SawJob) => void }) {
  const db = useStore((s) => s.db);
  const [form, setForm] = useState<SawJob>(
    existing ?? {
      id: nextId("SJ"),
      logId: db.logs[0]?.id ?? "",
      mistriId: db.labour.find((l) => l.role === "Mistri")?.id ?? "",
      startedAt: new Date().toISOString(),
      endedAt: null,
      inputCft: 0, outputCft: 0, wastageCft: 0,
      status: "in_progress",
    },
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>{existing ? "Edit sawing job" : "New sawing job"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Log lot">
              <Select value={form.logId} onValueChange={(v) => setForm({ ...form, logId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {db.logs.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.id} · {l.species} ({l.gradedCft} CFT)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Mistri">
              <Select value={form.mistriId} onValueChange={(v) => setForm({ ...form, mistriId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {db.labour.filter((l) => l.role === "Mistri").map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Input CFT"><Input type="number" step={0.1} value={form.inputCft} onChange={(e) => setForm({ ...form, inputCft: +e.target.value || 0 })} /></Field>
            <Field label="Output CFT"><Input type="number" step={0.1} value={form.outputCft} onChange={(e) => setForm({ ...form, outputCft: +e.target.value || 0 })} /></Field>
            <Field label="Wastage CFT"><Input type="number" step={0.1} value={form.wastageCft} onChange={(e) => setForm({ ...form, wastageCft: +e.target.value || 0 })} /></Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as SawJob["status"], endedAt: v === "completed" ? (form.endedAt ?? new Date().toISOString()) : null })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">in_progress</SelectItem>
                  <SelectItem value="completed">completed</SelectItem>
                  <SelectItem value="paused">paused</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)}>{existing ? "Save" : "Start job"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
