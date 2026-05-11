"use client";

import { useStore, getSession } from "@/lib/store";
import { getPersona } from "@/lib/seed";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SettingsPage() {
  const settings = useStore((s) => s.db.settings);
  const setDb = useStore((s) => s.setDb);
  const session = typeof window !== "undefined" ? getSession() : null;
  const me = session ? getPersona(session.personaId) : null;

  function update<K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) {
    setDb((db) => { db.settings[key] = value; });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Settings" sub="Personal & workspace preferences" />

      {me && (
        <Card className="p-5 gap-4">
          <div className="text-sm font-semibold">Profile</div>
          <div className="flex items-center gap-4">
            <Avatar className={cn("w-16 h-16", me.color)}>
              <AvatarFallback className="bg-transparent text-current font-bold text-xl">
                {me.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{me.name}</div>
              <div className="text-sm text-muted-foreground">{me.email}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {me.roleLabel} · {me.scope ?? me.tier}
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-5 gap-4">
        <div className="text-sm font-semibold">Workspace</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Organisation name</Label>
            <Input
              defaultValue={settings.organisation}
              onBlur={(e) => update("organisation", e.target.value)}
            />
          </div>
          <div>
            <Label>GSTIN</Label>
            <Input defaultValue={settings.gstin} onBlur={(e) => update("gstin", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Address</Label>
            <Input defaultValue={settings.address} onBlur={(e) => update("address", e.target.value)} />
          </div>
          <div>
            <Label>Default CFT rate ({settings.currency})</Label>
            <Input
              type="number"
              defaultValue={settings.cftRate}
              onBlur={(e) => update("cftRate", +e.target.value || 0)}
            />
          </div>
          <div>
            <Label>Auto-logout (min)</Label>
            <Input
              type="number"
              defaultValue={settings.autoLogoutMin}
              onBlur={(e) => update("autoLogoutMin", +e.target.value || 10)}
            />
          </div>
          <div>
            <Label>Mistri commission %</Label>
            <Input
              type="number"
              defaultValue={settings.mistriCommissionPct}
              onBlur={(e) => update("mistriCommissionPct", +e.target.value || 0)}
            />
          </div>
          <div>
            <Label>Owner reserve %</Label>
            <Input
              type="number"
              defaultValue={settings.ownerCommissionPct}
              onBlur={(e) => update("ownerCommissionPct", +e.target.value || 0)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => toast.success("Settings saved")}>Save changes</Button>
        </div>
      </Card>

      <Card className="p-5 gap-3">
        <div className="text-sm font-semibold">Demo</div>
        <div className="text-xs text-muted-foreground">
          Reset all data back to factory defaults. Useful for repeating the demo cleanly.
        </div>
        <div>
          <Button
            variant="outline"
            onClick={() => {
              if (!confirm("Reset all demo data?")) return;
              useStore.getState().resetDb();
              toast.success("Demo data reset. Reloading…");
              setTimeout(() => location.reload(), 800);
            }}
          >
            Reset demo data
          </Button>
        </div>
      </Card>
    </div>
  );
}
