"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const PLANS = [
  { name: "Starter", price: "₹1,999", features: ["Up to 3 users", "5 GB drive", "Email support"] },
  { name: "Growth", price: "₹4,999", features: ["Up to 10 users", "25 GB drive", "Priority support", "Daily reports"], hot: true },
  { name: "Enterprise", price: "₹9,999", features: ["Unlimited users", "100 GB drive", "Dedicated CSM", "Custom roles"] },
];

const FLAGS: [string, boolean, string][] = [
  ["Offline-first sync", true, "Allow data entry while offline; sync on reconnect."],
  ["Secure vault", true, "Admin-only encrypted store for IDs & financials."],
  ["Daily pic feed", true, "Floor staff can post photo updates."],
  ["Tenant-side user provisioning", false, "Allow Owner role to add/remove users on their own."],
];

export default function PlatformSettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="p-5 gap-3">
        <div>
          <div className="text-sm font-semibold">Plans & pricing</div>
          <div className="text-xs text-muted-foreground mt-0.5">Catalog visible to new tenants on signup.</div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl border p-4 ${p.hot ? "border-wood-700 ring-2 ring-wood-200" : "border-border"}`}
            >
              <div className="font-semibold">{p.name}</div>
              <div className="text-2xl font-bold mt-1">
                {p.price}
                <span className="text-xs text-muted-foreground font-medium">/mo</span>
              </div>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {p.features.map((f) => (<li key={f}>• {f}</li>))}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 gap-4">
        <div className="text-sm font-semibold">Defaults for new tenants</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Default currency</Label>
            <Select defaultValue="INR">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">₹ Rupee</SelectItem>
                <SelectItem value="USD">$ USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Auto-logout (min)</Label><Input defaultValue="10" /></div>
          <div><Label>Trial period (days)</Label><Input defaultValue="14" /></div>
          <div><Label>Default mistri commission %</Label><Input defaultValue="4" /></div>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => toast.success("Defaults saved")}>Save defaults</Button>
        </div>
      </Card>

      <Card className="p-5 gap-3">
        <div className="text-sm font-semibold">Feature flags</div>
        <div className="space-y-3">
          {FLAGS.map(([n, on, desc]) => (
            <div
              key={n}
              className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/50"
            >
              <div>
                <div className="font-medium text-sm">{n}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
              </div>
              <Switch defaultChecked={on} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
