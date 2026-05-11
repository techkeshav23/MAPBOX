"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { fmtMoney, nextId } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const customers = useStore((s) => s.db.customers);
  const orders = useStore((s) => s.db.orders);
  const ccy = useStore((s) => s.db.settings.currency);
  const setDb = useStore((s) => s.setDb);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Customer | "new" | null>(null);

  const list = customers.filter((c) =>
    !search || `${c.name} ${c.city}`.toLowerCase().includes(search.toLowerCase()),
  );

  function remove(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return;
    setDb((db) => { db.customers = db.customers.filter((x) => x.id !== id); });
    toast.success("Customer deleted");
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Customers"
        sub={`${customers.length} buyers · total outstanding ${fmtMoney(customers.reduce((s, c) => s + c.balance, 0), ccy)}`}
        actions={<Button onClick={() => setEditing("new")}><Plus className="w-4 h-4" /> Add customer</Button>}
      />

      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer or city…" className="max-w-md" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((c) => {
          const ltv = orders.filter((o) => o.customerId === c.id).reduce((s, o) => s + o.cft * o.ratePerCft, 0);
          const orderCount = orders.filter((o) => o.customerId === c.id).length;
          return (
            <Card key={c.id} className="p-5 gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.city} · {c.phone}</div>
                </div>
                <Badge
                  variant="secondary"
                  className={c.balance > 0 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}
                >
                  {c.balance > 0 ? `owes ${fmtMoney(c.balance, ccy)}` : "settled"}
                </Badge>
              </div>
              <div className="rounded bg-muted p-2 text-xs">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">GSTIN</div>
                <div className="font-mono mt-0.5">{c.gstin}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-muted p-2">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Orders</div>
                  <div className="font-bold mt-0.5">{orderCount}</div>
                </div>
                <div className="rounded bg-muted p-2">
                  <div className="text-[10px] uppercase font-bold text-muted-foreground">Lifetime value</div>
                  <div className="font-bold mt-0.5">{fmtMoney(ltv, ccy)}</div>
                </div>
              </div>
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing(c)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => remove(c.id, c.name)} className="text-rose-600 hover:text-rose-700">
                  Delete
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {editing && (
        <CustomerDialog
          existing={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(c) => {
            setDb((db) => {
              if (editing === "new") db.customers.push(c);
              else {
                const idx = db.customers.findIndex((x) => x.id === c.id);
                if (idx >= 0) db.customers[idx] = c;
              }
            });
            setEditing(null);
            toast.success(editing === "new" ? "Added" : "Updated");
          }}
        />
      )}
    </div>
  );
}

function CustomerDialog({
  existing, onClose, onSave,
}: { existing: Customer | null; onClose: () => void; onSave: (c: Customer) => void }) {
  const ccy = useStore((s) => s.db.settings.currency);
  const [form, setForm] = useState<Customer>(
    existing ?? { id: nextId("C"), name: "", city: "", phone: "", gstin: "", balance: 0 },
  );
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{existing ? "Edit customer" : "Add customer"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="City"><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
            <Field label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
            <Field label="GSTIN"><Input value={form.gstin} onChange={(e) => setForm({ ...form, gstin: e.target.value })} /></Field>
            <Field label={`Opening balance (${ccy})`}><Input type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: +e.target.value || 0 })} /></Field>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            if (!form.name) return toast.error("Name required");
            onSave(form);
          }}>{existing ? "Save" : "Add"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="text-[11px] uppercase tracking-wide">{label}</Label>{children}</div>;
}
