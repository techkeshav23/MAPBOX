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
import type { Invoice } from "@/lib/types";

export default function ARPage() {
  const db = useStore((s) => s.db);
  const setDb = useStore((s) => s.setDb);
  const ccy = db.settings.currency;
  const [paying, setPaying] = useState<Invoice | null>(null);
  const [creating, setCreating] = useState(false);

  const totalAr = db.invoices.reduce((s, i) => s + i.total - i.paid, 0);
  const overdue = db.invoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + i.total - i.paid, 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Accounts receivable"
        sub={`${fmtMoney(totalAr, ccy)} outstanding · ${fmtMoney(overdue, ccy)} overdue`}
        actions={<Button onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> New invoice</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(["paid", "partial", "overdue", "open"] as const).map((s) => {
          const list = db.invoices.filter((i) => i.status === s);
          const amt = list.reduce((sum, i) => sum + (s === "paid" ? i.paid : i.total - i.paid), 0);
          return <StatCard key={s} label={s} value={list.length} delta={fmtMoney(amt, ccy)} />;
        })}
      </div>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead><TableHead>Customer</TableHead><TableHead>Date</TableHead>
              <TableHead>Taxable</TableHead><TableHead>GST</TableHead><TableHead>Total</TableHead>
              <TableHead>Paid</TableHead><TableHead>Balance</TableHead><TableHead>Status</TableHead><TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {db.invoices.slice().sort((a, b) => +new Date(b.date) - +new Date(a.date)).map((i) => {
              const c = db.customers.find((x) => x.id === i.customerId)!;
              const bal = i.total - i.paid;
              return (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-xs">{i.id}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(i.date)}</TableCell>
                  <TableCell>{fmtMoney(i.amount, ccy)}</TableCell>
                  <TableCell>{fmtMoney(i.gst, ccy)}</TableCell>
                  <TableCell className="font-semibold">{fmtMoney(i.total, ccy)}</TableCell>
                  <TableCell>{fmtMoney(i.paid, ccy)}</TableCell>
                  <TableCell className={bal > 0 ? "font-semibold text-amber-700" : "text-muted-foreground"}>
                    {fmtMoney(bal, ccy)}
                  </TableCell>
                  <TableCell><StatusBadge value={i.status} /></TableCell>
                  <TableCell className="text-right">
                    {bal > 0 && <Button variant="ghost" size="sm" onClick={() => setPaying(i)}>Record payment</Button>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {paying && (
        <PaymentDialog
          invoice={paying}
          onClose={() => setPaying(null)}
          onSave={(amt) => {
            setDb((db) => {
              const inv = db.invoices.find((x) => x.id === paying.id);
              if (!inv) return;
              inv.paid = Math.min(inv.total, inv.paid + amt);
              if (inv.paid >= inv.total) inv.status = "paid";
              else if (inv.paid > 0) inv.status = "partial";
            });
            setPaying(null);
            toast.success("Payment recorded");
          }}
        />
      )}

      {creating && (
        <NewInvoiceDialog
          onClose={() => setCreating(false)}
          onSave={(data) => {
            setDb((db) => db.invoices.unshift(data));
            setCreating(false);
            toast.success("Invoice created");
          }}
        />
      )}
    </div>
  );
}

function PaymentDialog({
  invoice, onClose, onSave,
}: { invoice: Invoice; onClose: () => void; onSave: (amt: number) => void }) {
  const ccy = useStore((s) => s.db.settings.currency);
  const bal = invoice.total - invoice.paid;
  const [amt, setAmt] = useState(bal);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Record payment</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="rounded-lg bg-muted p-3 text-sm">
            <div>Invoice <span className="font-mono">{invoice.id}</span></div>
            <div className="text-xs text-muted-foreground mt-0.5">
              Outstanding: <span className="font-semibold text-foreground">{fmtMoney(bal, ccy)}</span>
            </div>
          </div>
          <div>
            <Label>Amount received ({ccy})</Label>
            <Input type="number" value={amt} onChange={(e) => setAmt(+e.target.value || 0)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(amt)}>Record</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewInvoiceDialog({ onClose, onSave }: { onClose: () => void; onSave: (i: Invoice) => void }) {
  const db = useStore((s) => s.db);
  const ccy = db.settings.currency;
  const [customerId, setCustomerId] = useState(db.customers[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState(0);
  const [gstPct, setGstPct] = useState(18);

  const gst = (amount * gstPct) / 100;
  const total = amount + gst;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>New invoice</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Customer</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{db.customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div><Label>Taxable amount ({ccy})</Label><Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value || 0)} /></div>
            <div><Label>GST rate (%)</Label><Input type="number" value={gstPct} onChange={(e) => setGstPct(+e.target.value || 0)} /></div>
          </div>
          <div className="rounded-lg bg-muted p-3 text-sm">
            Total: <span className="font-bold">{fmtMoney(total, ccy)}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({
            id: nextId("INV"), customerId, orderId: null, date,
            amount, gst, total, paid: 0, status: "open",
          })}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
