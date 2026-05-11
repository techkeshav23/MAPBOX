"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { fmtMoney, fmtDate, nextId } from "@/lib/format";
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
import { Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const db = useStore((s) => s.db);
  const setDb = useStore((s) => s.setDb);
  const ccy = db.settings.currency;
  const [statusF, setStatusF] = useState<"all" | Order["status"]>("all");
  const [editing, setEditing] = useState<Order | "new" | null>(null);
  const [packing, setPacking] = useState<Order | null>(null);

  const counts = {
    all: db.orders.length,
    pending: db.orders.filter((o) => o.status === "pending").length,
    packing: db.orders.filter((o) => o.status === "packing").length,
    fulfilled: db.orders.filter((o) => o.status === "fulfilled").length,
  };

  const rows = db.orders
    .filter((o) => statusF === "all" || o.status === statusF)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  function generatePackingSlip(o: Order) {
    const psId = "PS-" + (3200 + Math.floor(Math.random() * 800));
    setDb((db) => {
      const x = db.orders.find((y) => y.id === o.id);
      if (!x) return;
      x.packingSlip = psId;
      x.status = "fulfilled";
    });
    toast.success(`Packing slip ${psId} generated`);
    setPacking({ ...o, packingSlip: psId, status: "fulfilled" });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Sales orders"
        sub="Manage customer orders, fulfilment, and packing slips."
        actions={<Button onClick={() => setEditing("new")}><Plus className="w-4 h-4" /> New order</Button>}
      />

      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "pending", "packing", "fulfilled"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusF(s)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              statusF === s ? "bg-wood-100 text-wood-800" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {s} · {counts[s]}
          </button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead>
              <TableHead>Species</TableHead><TableHead>CFT</TableHead><TableHead>Rate</TableHead>
              <TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Packing slip</TableHead><TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow><TableCell colSpan={10} className="text-center text-muted-foreground py-8">No orders.</TableCell></TableRow>
            )}
            {rows.map((o) => {
              const c = db.customers.find((x) => x.id === o.customerId)!;
              return (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.id}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.city}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(o.date)}</TableCell>
                  <TableCell><StatusBadge value={o.species} tone="wood" /></TableCell>
                  <TableCell>{o.cft}</TableCell>
                  <TableCell>{fmtMoney(o.ratePerCft, ccy)}</TableCell>
                  <TableCell className="font-semibold">{fmtMoney(o.cft * o.ratePerCft, ccy)}</TableCell>
                  <TableCell><StatusBadge value={o.status} /></TableCell>
                  <TableCell>
                    {o.packingSlip
                      ? <button onClick={() => setPacking(o)} className="text-wood-700 font-mono text-xs hover:underline">{o.packingSlip}</button>
                      : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(o)}>Edit</Button>
                    {o.status !== "fulfilled" && (
                      <Button variant="ghost" size="sm" onClick={() => generatePackingSlip(o)}>Pack</Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {editing && (
        <OrderDialog
          existing={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            setDb((db) => {
              if (editing === "new") db.orders.unshift(data);
              else {
                const idx = db.orders.findIndex((x) => x.id === data.id);
                if (idx >= 0) db.orders[idx] = data;
              }
            });
            setEditing(null);
            toast.success(editing === "new" ? "Order created" : "Order updated");
          }}
        />
      )}

      {packing && <PackingSlipDialog order={packing} onClose={() => setPacking(null)} />}
    </div>
  );
}

function OrderDialog({
  existing, onClose, onSave,
}: { existing: Order | null; onClose: () => void; onSave: (o: Order) => void }) {
  const db = useStore((s) => s.db);
  const ccy = db.settings.currency;
  const [form, setForm] = useState<Order>(
    existing ?? {
      id: nextId("SO"),
      customerId: db.customers[0]?.id ?? "",
      date: new Date().toISOString().slice(0, 10),
      species: "Sheesham", cft: 0, ratePerCft: db.settings.cftRate,
      status: "pending", packingSlip: "",
    },
  );
  const total = form.cft * form.ratePerCft;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>{existing ? "Edit order" : "New order"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Customer">
              <Select value={form.customerId} onValueChange={(v) => v && setForm({ ...form, customerId: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{db.customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Date"><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
            <Field label="Species">
              <Select value={form.species} onValueChange={(v) => v && setForm({ ...form, species: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Array.from(new Set(db.logs.map((l) => l.species))).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="CFT"><Input type="number" step={0.1} value={form.cft} onChange={(e) => setForm({ ...form, cft: +e.target.value || 0 })} /></Field>
            <Field label={`Rate / CFT (${ccy})`}><Input type="number" value={form.ratePerCft} onChange={(e) => setForm({ ...form, ratePerCft: +e.target.value || 0 })} /></Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => v && setForm({ ...form, status: v as Order["status"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">pending</SelectItem>
                  <SelectItem value="packing">packing</SelectItem>
                  <SelectItem value="fulfilled">fulfilled</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="rounded-lg bg-muted p-3 text-sm">
            Order total: <span className="font-bold">{fmtMoney(total, ccy)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)}>{existing ? "Save" : "Create order"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PackingSlipDialog({ order, onClose }: { order: Order; onClose: () => void }) {
  const db = useStore((s) => s.db);
  const ccy = db.settings.currency;
  const c = db.customers.find((x) => x.id === order.customerId)!;
  const total = order.cft * order.ratePerCft;
  const gst = total * 0.18;
  const grand = total + gst;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-sm p-0">
        <DialogHeader className="px-4 pt-3 pb-2 border-b border-border">
          <DialogTitle className="text-sm font-semibold">Packing slip · preview</DialogTitle>
        </DialogHeader>
        <div className="invoice">
          <div className="ruled pt-3 mb-4 flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.18em] font-semibold text-stone-600">
                Packing slip
              </div>
              <div className="text-2xl font-mono font-bold mt-1">#{order.packingSlip}</div>
            </div>
            <div className="text-right">
              <div className="font-serif font-bold text-lg">{db.settings.organisation}</div>
              <div className="text-xs text-stone-700 leading-tight">{db.settings.address}</div>
              <div className="text-xs text-stone-700 mono mt-0.5">GSTIN {db.settings.gstin}</div>
            </div>
          </div>
          <div className="ruled-thin pt-3 grid grid-cols-2 gap-6 text-sm mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-stone-600 mb-1">Bill to</div>
              <div className="font-serif font-semibold text-base">{c.name}</div>
              <div className="text-stone-700">{c.city} · {c.phone}</div>
              <div className="text-stone-600 mono text-xs mt-0.5">GSTIN {c.gstin}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-stone-600 mb-1">Reference</div>
              <div className="mono text-base">{order.id}</div>
              <div className="text-stone-700 text-xs mt-0.5">Dated {fmtDate(order.date)}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th className="text-right">CFT</th>
                <th className="text-right">Rate (₹)</th>
                <th className="text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div>{order.species} timber, sawn to spec</div>
                  <div className="text-[11px] text-stone-600 italic">Per quotation; quality grade as agreed</div>
                </td>
                <td className="text-right">{order.cft.toFixed(2)}</td>
                <td className="text-right">{order.ratePerCft.toLocaleString("en-IN")}</td>
                <td className="text-right font-semibold">{total.toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td colSpan={3} className="text-right text-xs text-stone-600">Sub-total</td>
                <td className="text-right">{total.toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td colSpan={3} className="text-right text-xs text-stone-600">GST @ 18%</td>
                <td className="text-right">{Math.round(gst).toLocaleString("en-IN")}</td>
              </tr>
              <tr style={{ borderTop: "2px solid #111" }}>
                <td colSpan={3} className="text-right font-bold uppercase tracking-wide text-xs">Grand total</td>
                <td className="text-right font-serif font-bold text-xl">₹ {Math.round(grand).toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
          <div className="ruled-thin mt-6 pt-2 text-[10px] text-stone-600 italic">
            Goods once dispatched will not be taken back. All disputes subject to Yamunanagar jurisdiction. E.&O.E.
          </div>
        </div>
        <DialogFooter className="px-4 py-3 border-t border-border">
          <Button variant="outline" onClick={onClose} className="rounded-sm">Close</Button>
          <Button onClick={() => window.print()} className="rounded-sm"><Printer className="w-4 h-4" /> Print</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-[11px] uppercase tracking-wide">{label}</Label>{children}</div>;
}
