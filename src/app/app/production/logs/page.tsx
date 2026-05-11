"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { fmtMoney, fmtDate, nextId } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { LogLot } from "@/lib/types";

export default function LogsPage() {
  const logs = useStore((s) => s.db.logs);
  const ccy = useStore((s) => s.db.settings.currency);
  const setDb = useStore((s) => s.setDb);
  const [search, setSearch] = useState("");
  const [species, setSpecies] = useState("all");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<LogLot | "new" | null>(null);

  const speciesOpts = ["all", ...Array.from(new Set(logs.map((l) => l.species)))];
  const totalValue = logs.reduce((s, l) => s + l.gradedCft * l.ratePerCft, 0);
  const pending = logs.filter((l) => l.status === "pending").length;

  const rows = logs.filter((l) => {
    if (search && !`${l.id} ${l.supplier} ${l.truck}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (species !== "all" && l.species !== species) return false;
    if (status !== "all" && l.status !== status) return false;
    return true;
  }).sort((a, b) => +new Date(b.received) - +new Date(a.received));

  function remove(id: string) {
    if (!confirm("Delete this log lot?")) return;
    setDb((db) => { db.logs = db.logs.filter((x) => x.id !== id); });
    toast.success("Log deleted");
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Log procurement"
        sub={`${logs.length} lots · ${logs.reduce((s, l) => s + l.gradedCft, 0).toFixed(1)} CFT graded`}
        actions={<Button onClick={() => setEditing("new")}><Plus className="w-4 h-4" /> New log entry</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Lots" value={logs.length} />
        <StatCard label="Total pieces" value={logs.reduce((s, l) => s + l.pieces, 0)} />
        <StatCard label="Graded CFT" value={logs.reduce((s, l) => s + l.gradedCft, 0).toFixed(1)} />
        <StatCard label="Inventory value" value={fmtMoney(totalValue, ccy)} />
      </div>

      <Card className="p-3 flex flex-row items-center gap-2 flex-wrap">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ID, supplier, truck…" className="max-w-xs" />
        <Select value={species} onValueChange={setSpecies}>
          <SelectTrigger className="max-w-[10rem]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {speciesOpts.map((s) => <SelectItem key={s} value={s}>{s === "all" ? "All species" : s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="max-w-[10rem]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="pending">pending</SelectItem>
            <SelectItem value="graded">graded</SelectItem>
            <SelectItem value="sawed">sawed</SelectItem>
          </SelectContent>
        </Select>
        {pending > 0 && <StatusBadge value={`${pending} pending grading`} tone="amber" />}
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lot ID</TableHead><TableHead>Species</TableHead><TableHead>Supplier</TableHead>
              <TableHead>Truck</TableHead><TableHead>Received</TableHead><TableHead>Pcs</TableHead>
              <TableHead>CFT</TableHead><TableHead>Rate</TableHead><TableHead>Value</TableHead>
              <TableHead>Status</TableHead><TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={11} className="text-center text-muted-foreground py-8">No logs match.</TableCell></TableRow>
            ) : rows.map((l) => {
              const value = l.gradedCft * l.ratePerCft;
              return (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs">{l.id}</TableCell>
                  <TableCell><StatusBadge value={l.species} tone="wood" /></TableCell>
                  <TableCell>{l.supplier}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{l.truck}</TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(l.received)}</TableCell>
                  <TableCell>{l.pieces}</TableCell>
                  <TableCell>{l.gradedCft || "—"}</TableCell>
                  <TableCell>{fmtMoney(l.ratePerCft, ccy)}</TableCell>
                  <TableCell className="font-semibold">{value ? fmtMoney(value, ccy) : "—"}</TableCell>
                  <TableCell><StatusBadge value={l.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(l)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(l.id)} className="text-rose-600 hover:text-rose-700">Del</Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {editing && (
        <LogFormDialog
          existing={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            setDb((db) => {
              if (editing === "new") {
                db.logs.unshift(data);
              } else {
                const idx = db.logs.findIndex((x) => x.id === data.id);
                if (idx >= 0) db.logs[idx] = data;
              }
            });
            setEditing(null);
            toast.success(editing === "new" ? "Log added" : "Log updated");
          }}
        />
      )}
    </div>
  );
}

function LogFormDialog({
  existing, onClose, onSave,
}: { existing: LogLot | null; onClose: () => void; onSave: (d: LogLot) => void }) {
  const ccy = useStore((s) => s.db.settings.currency);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<LogLot>(
    existing ?? {
      id: nextId("L"), species: "", supplier: "", truck: "",
      received: today, pieces: 0, gradedCft: 0, ratePerCft: 0,
      status: "pending", notes: "",
    },
  );

  const value = form.gradedCft * form.ratePerCft;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit log lot" : "New log lot"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Species"><Input value={form.species} onChange={(e) => setForm({ ...form, species: e.target.value })} /></Field>
            <Field label="Supplier"><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></Field>
            <Field label="Truck no."><Input value={form.truck} onChange={(e) => setForm({ ...form, truck: e.target.value })} /></Field>
            <Field label="Received on"><Input type="date" value={form.received} onChange={(e) => setForm({ ...form, received: e.target.value })} /></Field>
            <Field label="Pieces"><Input type="number" value={form.pieces} onChange={(e) => setForm({ ...form, pieces: +e.target.value || 0 })} /></Field>
            <Field label="Graded CFT"><Input type="number" step={0.1} value={form.gradedCft} onChange={(e) => setForm({ ...form, gradedCft: +e.target.value || 0 })} /></Field>
            <Field label={`Rate / CFT (${ccy})`}><Input type="number" value={form.ratePerCft} onChange={(e) => setForm({ ...form, ratePerCft: +e.target.value || 0 })} /></Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as LogLot["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">pending</SelectItem>
                  <SelectItem value="graded">graded</SelectItem>
                  <SelectItem value="sawed">sawed</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Notes">
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          <div className="rounded-lg bg-muted p-3 text-xs">
            Inventory value: <span className="font-bold text-foreground">{fmtMoney(value, ccy)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            if (!form.species || !form.supplier) return toast.error("Species and supplier are required");
            onSave(form);
          }}>
            {existing ? "Save" : "Add log"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-[11px] uppercase tracking-wide">{label}</Label>{children}</div>;
}
