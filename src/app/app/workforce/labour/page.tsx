"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { fmtMoney, fmtDate, nextId, initials } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Lock } from "lucide-react";
import { toast } from "sonner";
import type { Worker } from "@/lib/types";

const ROLES = ["All", "Mistri", "Helper", "Loader"];

export default function LabourPage() {
  const labour = useStore((s) => s.db.labour);
  const ccy = useStore((s) => s.db.settings.currency);
  const setDb = useStore((s) => s.setDb);
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState<Worker | "new" | null>(null);

  const list = labour.filter((l) => filter === "All" || l.role === filter);

  function remove(id: string, name: string) {
    if (!confirm(`Remove ${name}?`)) return;
    setDb((db) => { db.labour = db.labour.filter((x) => x.id !== id); });
    toast.success("Worker removed");
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Labour directory"
        sub={`${labour.length} workers · IDs vault-linked, only Admin can read full proofs`}
        actions={<Button onClick={() => setEditing("new")}><Plus className="w-4 h-4" /> Add worker</Button>}
      />

      <div className="flex items-center gap-2 flex-wrap">
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              filter === r ? "bg-wood-100 text-wood-800" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((l) => {
          const wage = l.wageType === "daily"
            ? `${fmtMoney(l.dailyWage ?? 0, ccy)}/day`
            : `${fmtMoney(l.pieceRate ?? 0, ccy)}/piece`;
          return (
            <Card key={l.id} className="p-5 gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full grid place-items-center text-sm font-bold bg-wood-100 text-wood-700">
                    {initials(l.name)}
                  </div>
                  <div>
                    <div className="font-semibold">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.role} · joined {fmtDate(l.joined)}</div>
                  </div>
                </div>
                <Badge variant="secondary">{l.id}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Tile label="Wage" value={wage} />
                <Tile label="Phone" value={l.phone} mono />
              </div>
              <div className="rounded bg-amber-50 border border-amber-100 p-2 text-[11px] text-amber-800 flex items-center gap-1.5">
                <Lock className="w-3 h-3" /> {l.idProof} · view full in Vault (Admin only)
              </div>
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing(l)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => remove(l.id, l.name)} className="text-rose-600 hover:text-rose-700">
                  Delete
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {editing && (
        <WorkerDialog
          existing={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(w) => {
            setDb((db) => {
              if (editing === "new") db.labour.push(w);
              else {
                const idx = db.labour.findIndex((x) => x.id === w.id);
                if (idx >= 0) db.labour[idx] = w;
              }
            });
            setEditing(null);
            toast.success(editing === "new" ? "Worker added" : "Worker updated");
          }}
        />
      )}
    </div>
  );
}

function Tile({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded bg-muted p-2">
      <div className="text-[10px] uppercase font-bold text-muted-foreground">{label}</div>
      <div className={`font-semibold mt-0.5 ${mono ? "font-mono text-xs" : ""}`}>{value}</div>
    </div>
  );
}

function WorkerDialog({
  existing, onClose, onSave,
}: { existing: Worker | null; onClose: () => void; onSave: (w: Worker) => void }) {
  const ccy = useStore((s) => s.db.settings.currency);
  const [form, setForm] = useState<Worker>(
    existing ?? {
      id: nextId("lab"), name: "", role: "Mistri", phone: "",
      wageType: "daily", dailyWage: 0, joined: new Date().toISOString().slice(0, 10),
      idProof: "AADHAAR ****",
    },
  );
  const rate = form.wageType === "daily" ? (form.dailyWage ?? 0) : (form.pieceRate ?? 0);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>{existing ? "Edit worker" : "Add worker"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Role">
              <Select value={form.role} onValueChange={(v) => v && setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Mistri", "Helper", "Loader", "Driver", "Munshi"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="Joined on"><Input type="date" value={form.joined} onChange={(e) => setForm({ ...form, joined: e.target.value })} /></Field>
            <Field label="Wage type">
              <Select value={form.wageType} onValueChange={(v) => v && setForm({ ...form, wageType: v as Worker["wageType"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="piece">Piece-rate</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={`Rate (${ccy})`}>
              <Input
                type="number"
                value={rate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [form.wageType === "daily" ? "dailyWage" : "pieceRate"]: +e.target.value || 0,
                  } as Worker)
                }
              />
            </Field>
          </div>
          <Field label="ID proof reference">
            <Input value={form.idProof} onChange={(e) => setForm({ ...form, idProof: e.target.value })} />
            <div className="text-[11px] text-muted-foreground mt-1">Full proof scans go to the Secure Vault (Admin only).</div>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            if (!form.name) return toast.error("Name required");
            onSave(form);
          }}>{existing ? "Save" : "Add worker"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-[11px] uppercase tracking-wide">{label}</Label>{children}</div>;
}
