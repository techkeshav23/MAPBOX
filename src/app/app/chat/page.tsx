"use client";

import { useState } from "react";
import { useStore, getSession } from "@/lib/store";
import { getPersona, PERSONAS } from "@/lib/seed";
import { fmtDateTime, timeAgo, nextId } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function TeamChatPage() {
  const me = getSession()?.personaId ?? "mahesh";
  const chats = useStore((s) => s.db.teamChats);
  const setDb = useStore((s) => s.setDb);
  const myChats = chats.filter((c) => c.participants.includes(me));
  const [active, setActive] = useState(myChats[0]?.id ?? null);
  const [text, setText] = useState("");

  function send() {
    if (!text.trim() || !active) return;
    const t = text;
    setDb((db) => {
      const c = db.teamChats.find((x) => x.id === active);
      if (!c) return;
      c.messages.push({ from: me, text: t, at: new Date().toISOString() });
      c.updatedAt = new Date().toISOString();
    });
    setText("");
  }

  function newChat() {
    const others = PERSONAS.filter((p) => p.tier === "Tenant" && p.id !== me);
    const target = others[Math.floor(Math.random() * others.length)];
    let newId: string | null = null;
    setDb((db) => {
      let existing = db.teamChats.find(
        (c) => c.participants.includes(me) && c.participants.includes(target.id),
      );
      if (!existing) {
        existing = {
          id: nextId("tc"), participants: [me, target.id],
          updatedAt: new Date().toISOString(), messages: [],
        };
        db.teamChats.push(existing);
      }
      newId = existing.id;
    });
    if (newId) setActive(newId);
    toast.success(`Chat with ${target.name}`);
  }

  const current = chats.find((c) => c.id === active);
  const peer = current ? getPersona(current.participants.find((p) => p !== me) ?? "") : null;

  return (
    <Card className="overflow-hidden p-0 gap-0" style={{ height: "calc(100vh - 8rem)" }}>
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-12 md:col-span-4 border-r border-border flex flex-col min-h-0">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div className="text-sm font-semibold">Conversations</div>
            <Button variant="ghost" size="sm" onClick={newChat}>New</Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {myChats.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No chats yet. Click &quot;New&quot;.</div>
            ) : (
              myChats
                .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
                .map((c) => {
                  const other = getPersona(c.participants.find((p) => p !== me) ?? "");
                  const last = c.messages.at(-1);
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActive(c.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 border-b border-border hover:bg-muted/60 flex items-center gap-3",
                        c.id === active && "bg-wood-50",
                      )}
                    >
                      <div className={cn("w-9 h-9 rounded-full grid place-items-center text-xs font-bold", other?.color ?? "bg-muted")}>
                        {other?.initials ?? "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{other?.name ?? "Unknown"}</div>
                        <div className="text-xs text-muted-foreground truncate">{last?.text ?? "—"}</div>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{timeAgo(c.updatedAt)}</div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        <div className="hidden md:flex col-span-8 flex-col min-h-0">
          {current && peer ? (
            <>
              <div className="px-5 py-3 border-b border-border">
                <div className="font-semibold">{peer.name}</div>
                <div className="text-xs text-muted-foreground">{peer.roleLabel}</div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted/30">
                {current.messages.map((m, i) => {
                  const isMe = m.from === me;
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
                <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a message…" />
                <Button onClick={send}><Send className="w-4 h-4" /></Button>
              </div>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-muted-foreground text-sm">Select a chat</div>
          )}
        </div>
      </div>
    </Card>
  );
}
