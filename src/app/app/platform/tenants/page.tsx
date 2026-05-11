"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { fmtMoney, fmtDate, initials, nextId } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

export default function TenantsPage() {
  const tenants = useStore((s) => s.db.tenants);
  const setDb = useStore((s) => s.setDb);
  const [search, setSearch] = useState("");
  const [planF, setPlanF] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [openTenant, setOpenTenant] = useState<string | null>(null);
  const [openProvision, setOpenProvision] = useState(false);

  const rows = tenants.filter((t) => {
    if (search && !`${t.name} ${t.city}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (planF !== "all" && t.plan !== planF) return false;
    if (statusF !== "all" && t.status !== statusF) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="All tenants"
        sub={`${tenants.length} sawmills · 1 actively wired in this demo`}
        actions={
          <Button onClick={() => setOpenProvision(true)}>
            <Plus className="w-4 h-4" /> Provision tenant
          </Button>
        }
      />

      <Card className="p-3 flex-row items-center gap-2 flex-wrap flex">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or city…"
          className="max-w-xs"
        />
        <Select value={planF} onValueChange={setPlanF}>
          <SelectTrigger className="max-w-[10rem]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            <SelectItem value="Starter">Starter</SelectItem>
            <SelectItem value="Growth">Growth</SelectItem>
            <SelectItem value="Enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusF} onValueChange={setStatusF}>
          <SelectTrigger className="max-w-[10rem]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">active</SelectItem>
            <SelectItem value="trialing">trialing</SelectItem>
            <SelectItem value="past_due">past_due</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>MRR</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No matches.
                </TableCell>
              </TableRow>
            )}
            {rows.map((t) => (
              <TableRow key={t.id} className="cursor-pointer" onClick={() => setOpenTenant(t.id)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-wood-100 text-wood-700 grid place-items-center text-xs font-bold">
                      {initials(t.name)}
                    </div>
                    <div>
                      <div className="font-semibold">
                        {t.name}
                        {t.primary && (
                          <Badge variant="secondary" className="ml-2 bg-emerald-100 text-emerald-800">
                            live
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{t.city}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell><StatusBadge value={t.plan} /></TableCell>
                <TableCell><StatusBadge value={t.status} /></TableCell>
                <TableCell>{t.users}</TableCell>
                <TableCell className="font-semibold">{fmtMoney(t.mrr)}</TableCell>
                <TableCell className="text-muted-foreground">{fmtDate(t.joined)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setOpenTenant(t.id); }}>
                    View →
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Detail dialog */}
      {openTenant && (
        <TenantDetailDialog
          id={openTenant}
          onClose={() => setOpenTenant(null)}
          onAction={() => setOpenTenant(null)}
        />
      )}

      <Dialog open={openProvision} onOpenChange={setOpenProvision}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Provision new tenant</DialogTitle>
          </DialogHeader>
          <ProvisionForm
            onCancel={() => setOpenProvision(false)}
            onSave={(d) => {
              setDb((db) => {
                db.tenants.push({
                  id: nextId("t"), name: d.name, city: d.city, plan: d.plan,
                  status: "trialing", users: d.users, mrr: 0,
                  joined: new Date().toISOString().slice(0, 10),
                  logsThisMonth: 0, sawingHrs: 0, primary: false,
                });
              });
              setOpenProvision(false);
              toast.success("Tenant provisioned (14-day trial)");
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TenantDetailDialog({
  id, onClose, onAction,
}: { id: string; onClose: () => void; onAction: () => void }) {
  const t = useStore((s) => s.db.tenants.find((x) => x.id === id));
  const setDb = useStore((s) => s.setDb);
  if (!t) return null;

  function toggleStatus() {
    setDb((db) => {
      const x = db.tenants.find((y) => y.id === id);
      if (x) x.status = x.status === "active" ? "past_due" : "active";
    });
    toast.success(t!.status === "active" ? "Tenant suspended" : "Tenant reactivated");
    onAction();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tenant detail</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-wood-100 text-wood-700 grid place-items-center font-bold text-lg">
              {initials(t.name)}
            </div>
            <div>
              <div className="text-base font-bold">{t.name}</div>
              <div className="text-xs text-muted-foreground">
                {t.city} · joined {fmtDate(t.joined)}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Plan", t.plan], ["Status", t.status], ["Users", t.users],
              ["MRR", fmtMoney(t.mrr)], ["Logs (mo.)", t.logsThisMonth.toLocaleString("en-IN")],
              ["Sawing hrs", t.sawingHrs],
            ].map(([k, v]) => (
              <div key={String(k)} className="rounded-lg bg-muted p-3">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">{k}</div>
                <div className="font-semibold mt-0.5">{v}</div>
              </div>
            ))}
          </div>
          {t.primary ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              This is the live demo tenant. Sign in as Owner / Production Manager / etc. from the
              login page to see their workspace.
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
              Mock tenant — workspace not wired in this demo build.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="destructive" onClick={toggleStatus}>
            {t.status === "active" ? "Suspend" : "Reactivate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProvisionForm({
  onCancel, onSave,
}: {
  onCancel: () => void;
  onSave: (d: { name: string; city: string; plan: "Starter" | "Growth" | "Enterprise"; users: number }) => void;
}) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [plan, setPlan] = useState<"Starter" | "Growth" | "Enterprise">("Growth");
  const [users, setUsers] = useState(3);

  return (
    <div className="space-y-3">
      <div>
        <Label>Sawmill name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Goyal Timbers" />
      </div>
      <div>
        <Label>City</Label>
        <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Yamunanagar" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Plan</Label>
          <Select value={plan} onValueChange={(v) => setPlan(v as typeof plan)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Starter">Starter</SelectItem>
              <SelectItem value="Growth">Growth</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Initial users</Label>
          <Input type="number" min={1} value={users} onChange={(e) => setUsers(Number(e.target.value) || 1)} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => {
          if (!name) return toast.error("Name required");
          onSave({ name, city, plan, users });
        }}>
          Provision
        </Button>
      </DialogFooter>
    </div>
  );
}
