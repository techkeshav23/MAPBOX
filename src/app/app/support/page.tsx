"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { fmtDateTime, timeAgo, nextId } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Send } from "lucide-react";

export default function SupportOutPage() {
  const threads = useStore((s) => s.db.supportThreads);
  const setDb = useStore((s) => s.setDb);
  const myThreads = threads.filter((t) => t.tenantId === "sharma-sawmill");
  const [active, setActive] = useState(myThreads[0]?.id ?? null);
  const [text, setText] = useState("");
  const [openNew, setOpenNew] = useState(false);

  const current = threads.find((t) => t.id === active);

  function send() {
    if (!text.trim() || !active) return;
    const t = text;
    setDb((db) => {
      const x = db.supportThreads.find((y) => y.id === active);
      if (!x) return;
      x.messages.push({ from: "mahesh", text: t, at: new Date().toISOString() });
      x.updatedAt = new Date().toISOString();
      x.unread = true;
    });
    setText("");
    toast.success("Sent to SawmillOS team");
  }

  return (
    <Card className="overflow-hidden p-0 gap-0" style={{ height: "calc(100vh - 8rem)" }}>
      <div className="grid grid-cols-12 h-full">
        <div className="col-span-12 md:col-span-4 border-r border-border flex flex-col min-h-0">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Support tickets</div>
              <div className="text-xs text-muted-foreground">Replies usually in &lt;6h</div>
            </div>
            <Button size="sm" onClick={() => setOpenNew(true)}>New</Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {myThreads.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No tickets.</div>
            ) : (
              myThreads
                .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
                .map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActive(t.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-border hover:bg-muted/60",
                      t.id === active && "bg-wood-50",
                    )}
                  >
                    <div className="font-semibold text-sm truncate">{t.subject}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{timeAgo(t.updatedAt)}</div>
                    <div className="text-xs mt-1 truncate">{t.messages.at(-1)?.text}</div>
                  </button>
                ))
            )}
          </div>
        </div>

        <div className="hidden md:flex col-span-8 flex-col min-h-0">
          {current ? (
            <>
              <div className="px-5 py-3 border-b border-border">
                <div className="font-semibold">{current.subject}</div>
                <div className="text-xs text-muted-foreground">
                  Opened {fmtDateTime(current.messages[0].at)} · {current.messages.length} messages
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-muted/30">
                {current.messages.map((m, i) => {
                  const isMe = m.from !== "rajesh";
                  return (
                    <div key={i} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn("bubble", isMe ? "bubble-me" : "bubble-them")}>
                        <div>{m.text}</div>
                        <div className={cn("text-[10px] mt-1", isMe ? "text-wood-100/80" : "text-muted-foreground")}>
                          {m.from === "rajesh" ? "SawmillOS Support · " : ""}{fmtDateTime(m.at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-3 border-t border-border flex items-center gap-2 bg-background">
                <Input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Reply…" />
                <Button onClick={send}><Send className="w-4 h-4" /></Button>
              </div>
            </>
          ) : (
            <div className="flex-1 grid place-items-center text-muted-foreground text-sm">Select a ticket</div>
          )}
        </div>
      </div>

      {openNew && (
        <NewTicketDialog
          onClose={() => setOpenNew(false)}
          onSave={(subject, msg, callback) => {
            const id = nextId("t");
            setDb((db) =>
              db.supportThreads.unshift({
                id, tenantId: "sharma-sawmill", subject, unread: true,
                updatedAt: new Date().toISOString(),
                messages: [{
                  from: "mahesh",
                  text: msg + (callback ? "\n\n[Requested callback]" : ""),
                  at: new Date().toISOString(),
                }],
              }),
            );
            setActive(id);
            setOpenNew(false);
            toast.success("Ticket opened");
          }}
        />
      )}
    </Card>
  );
}

function NewTicketDialog({
  onClose, onSave,
}: { onClose: () => void; onSave: (subject: string, msg: string, callback: boolean) => void }) {
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [cb, setCb] = useState("no");

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>New support ticket</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Subject</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
          <div><Label>Message</Label><Textarea rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} /></div>
          <div>
            <Label>Need a callback?</Label>
            <Select value={cb} onValueChange={setCb}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No, just chat</SelectItem>
                <SelectItem value="yes">Yes — schedule a 15 min call</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            if (!subject || !msg) return toast.error("Subject and message required");
            onSave(subject, msg, cb === "yes");
          }}>Open ticket</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
