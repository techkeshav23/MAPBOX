"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { fmtDateTime, timeAgo } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function SupportInboxPage() {
  const threads = useStore((s) => s.db.supportThreads);
  const tenants = useStore((s) => s.db.tenants);
  const setDb = useStore((s) => s.setDb);
  const [active, setActive] = useState(threads[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");

  const tenantName = (id: string) => tenants.find((t) => t.id === id)?.name ?? id;
  const sorted = [...threads].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  const filtered = sorted.filter((t) =>
    !search ||
    `${t.subject} ${tenantName(t.tenantId)}`.toLowerCase().includes(search.toLowerCase()),
  );
  const current = threads.find((t) => t.id === active);

  function send() {
    if (!reply.trim() || !active) return;
    const text = reply;
    setDb((db) => {
      const t = db.supportThreads.find((x) => x.id === active);
      if (!t) return;
      t.messages.push({ from: "rajesh", text, at: new Date().toISOString() });
      t.updatedAt = new Date().toISOString();
      t.unread = false;
    });
    setReply("");
    toast.success("Reply sent");
  }

  return (
    <Card className="overflow-hidden p-0 gap-0" style={{ height: "calc(100vh - 8rem)" }}>
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-12 md:col-span-4 border-r border-border flex flex-col min-h-0">
          <div className="p-3 border-b border-border">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search threads…"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActive(t.id);
                  if (t.unread) {
                    setDb((db) => {
                      const x = db.supportThreads.find((y) => y.id === t.id);
                      if (x) x.unread = false;
                    });
                  }
                }}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border hover:bg-muted/60",
                  t.id === active && "bg-wood-50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-sm truncate">{t.subject}</div>
                  {t.unread && <span className="w-2 h-2 rounded-full bg-wood-700" />}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {tenantName(t.tenantId)} · {timeAgo(t.updatedAt)}
                </div>
                <div className="text-xs text-foreground/80 mt-1 truncate">
                  {t.messages.at(-1)?.text ?? ""}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:flex col-span-8 flex-col min-h-0">
          {current ? (
            <>
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <div>
                  <div className="font-semibold">{current.subject}</div>
                  <div className="text-xs text-muted-foreground">{tenantName(current.tenantId)}</div>
                </div>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Open</Badge>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted/30">
                {current.messages.map((m, i) => {
                  const isMe = m.from === "rajesh";
                  return (
                    <div key={i} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn("bubble", isMe ? "bubble-me" : "bubble-them")}>
                        <div>{m.text}</div>
                        <div className={cn("text-[10px] mt-1", isMe ? "text-wood-100/80" : "text-muted-foreground")}>
                          {fmtDateTime(m.at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 border-t border-border flex items-center gap-2 bg-background">
                <Input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a reply…"
                />
                <Button onClick={send}>
                  <Send className="w-4 h-4" /> Send
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-muted-foreground text-sm">
              Select a thread to view.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
