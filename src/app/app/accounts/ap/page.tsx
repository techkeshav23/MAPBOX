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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function APPage() {
  const db = useStore((s) => s.db);
  const setDb = useStore((s) => s.setDb);
  const ccy = db.settings.currency;
  const [creating, setCreating] = useState(false);

  const total = db.bills.reduce((s, b) => s + b.amount - b.paid, 0);
  const open = db.bills.filter((b) => b.status !== "paid").length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Accounts payable"
        sub={`${fmtMoney(total, ccy)} owed across ${open} open bills`}
        actions={<Button onClick={() => setCreating(true)}><Plus className="w-4 h-4" /> New bill</Button>}
      />

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill</TableHead><TableHead>Vendor</TableHead><TableHead>Date</TableHead>
              <TableHead>Amount</TableHead><TableHead>Paid</TableHead><TableHead>Balance</TableHead>
              <TableHead>Status</TableHead><TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {db.bills.slice().sort((a, b) => +new Date(b.date) - +new Date(a.date)).map((b) => {
              const bal = b.amount - b.paid;
              return (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{b.id}</TableCell>
                  <TableCell>{b.vendor}</TableCell>
                  <TableCell className="text-muted-foreground">{fmtDate(b.date)}</TableCell>
                  <TableCell className="font-semibold">{fmtMoney(b.amount, ccy)}</TableCell>
                  <TableCell>{fmtMoney(b.paid, ccy)}</TableCell>
                  <TableCell className={bal > 0 ? "text-amber-700 font-semibold" : "text-muted-foreground"}>
                    {fmtMoney(bal, ccy)}
                  </TableCell>
                  <TableCell><StatusBadge value={b.status} /></TableCell>
                  <TableCell className="text-right">
                    {bal > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => {
                        setDb((db) => {
                          const x = db.bills.find((y) => y.id === b.id);
                          if (!x) return;
                          x.paid = x.amount;
                          x.status = "paid";
                        });
                        toast.success(`Paid ${b.vendor}`);
                      }}>Pay</Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {creating && (
        <NewBillDialog
          onClose={() => setCreating(false)}
          onSave={(vendor, date, amount) => {
            setDb((db) => db.bills.unshift({
              id: nextId("BILL"), vendor, date, amount, paid: 0, status: "open",
            }));
            setCreating(false);
            toast.success("Bill added");
          }}
        />
      )}
    </div>
  );
}

function NewBillDialog({
  onClose, onSave,
}: { onClose: () => void; onSave: (vendor: string, date: string, amount: number) => void }) {
  const ccy = useStore((s) => s.db.settings.currency);
  const [vendor, setVendor] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState(0);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>New bill</DialogTitle></DialogHeader>
        <div className="space-y-3 grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Vendor</Label><Input value={vendor} onChange={(e) => setVendor(e.target.value)} /></div>
          <div><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><Label>Amount ({ccy})</Label><Input type="number" value={amount} onChange={(e) => setAmount(+e.target.value || 0)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            if (!vendor) return toast.error("Vendor required");
            onSave(vendor, date, amount);
          }}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
