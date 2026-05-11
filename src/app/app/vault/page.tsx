"use client";

import { useState } from "react";
import { useStore, getSession } from "@/lib/store";
import { getPersona } from "@/lib/seed";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Eye, EyeOff, Building, KeyRound, Fingerprint, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_META: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  bank:    { icon: Building,    label: "Bank",        color: "bg-emerald-100 text-emerald-800" },
  cred:    { icon: KeyRound,    label: "Credentials", color: "bg-amber-100 text-amber-800" },
  idproof: { icon: Fingerprint, label: "ID proof",    color: "bg-violet-100 text-violet-800" },
  doc:     { icon: FileText,    label: "Document",    color: "bg-blue-100 text-blue-800" },
};

export default function VaultPage() {
  const vault = useStore((s) => s.db.vault);
  const session = typeof window !== "undefined" ? getSession() : null;
  const me = session ? getPersona(session.personaId) : null;
  const isAdmin = me?.role === "owner" || me?.role === "super_admin";
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  if (!isAdmin) {
    return (
      <Card className="p-12 text-center max-w-lg mx-auto gap-3">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 grid place-items-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div className="font-semibold">Vault is admin-only</div>
        <div className="text-sm text-muted-foreground">
          The Secure Vault holds laborer ID proofs, financial credentials and other sensitive
          documents. Only Owner / Admin can read its contents.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Secure vault"
        sub="Encrypted-at-rest in production · admin-only access"
        actions={
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            <Lock className="w-3 h-3 mr-1" /> 256-bit AES (mock)
          </Badge>
        }
      />

      <div className="grid sm:grid-cols-2 gap-4">
        {vault.map((item) => {
          const meta = TYPE_META[item.type];
          const isRevealed = revealed[item.id];
          return (
            <Card key={item.id} className="p-4 gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg grid place-items-center", meta.color)}>
                    <meta.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{meta.label}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRevealed((r) => ({ ...r, [item.id]: !r[item.id] }))}
                >
                  {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <div
                className={cn(
                  "rounded bg-muted p-3 font-mono text-xs",
                  !isRevealed && "blur-sm select-none",
                )}
              >
                {item.value}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 bg-amber-50 border-amber-200 gap-2">
        <div className="text-sm font-semibold text-amber-900">Audit log</div>
        <div className="text-xs text-amber-800">
          Vault access is recorded. Last 5 reads:
        </div>
        <ul className="text-xs text-amber-900 mt-1 list-disc pl-5 space-y-0.5">
          <li>Mahesh Sharma viewed &quot;Bank account — HDFC current&quot; · 2 hours ago</li>
          <li>Mahesh Sharma viewed &quot;GSTIN credentials&quot; · yesterday 4:12 PM</li>
          <li>Mahesh Sharma viewed &quot;Aadhaar — Ramesh Kumar&quot; · 3 days ago</li>
        </ul>
      </Card>
    </div>
  );
}
