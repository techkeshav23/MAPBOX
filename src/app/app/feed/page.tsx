"use client";

import { useState } from "react";
import { useStore, getSession } from "@/lib/store";
import { getPersona } from "@/lib/seed";
import { fmtDateTime, timeAgo, nextId } from "@/lib/format";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SAMPLE_PICS = [
  "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&q=70",
  "https://images.unsplash.com/photo-1518792528501-352f829886dc?w=600&q=70",
  "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=600&q=70",
  "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&q=70",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&q=70",
];

export default function FeedPage() {
  const reports = useStore((s) => s.db.dailyReports);
  const setDb = useStore((s) => s.setDb);
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Daily feed"
        sub="Photo updates from the floor — visible to whole team"
        actions={
          <Button onClick={() => setOpen(true)}>
            <Camera className="w-4 h-4" /> Post update
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports
          .slice()
          .sort((a, b) => +new Date(b.at) - +new Date(a.at))
          .map((r) => {
            const author = getPersona(r.authorId);
            return (
              <Card key={r.id} className="p-0 overflow-hidden gap-0">
                <div className="pic-tile" style={{ backgroundImage: `url(${r.pic})` }} />
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold", author?.color ?? "bg-muted")}>
                      {author?.initials ?? "??"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{author?.name ?? "Unknown"}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {author?.roleLabel ?? ""} · {timeAgo(r.at)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm mt-2">{r.text}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{fmtDateTime(r.at)}</div>
                </div>
              </Card>
            );
          })}
      </div>

      {open && (
        <PostDialog
          onClose={() => setOpen(false)}
          onSave={(text, pic) => {
            const me = getSession()?.personaId;
            if (!me) return;
            setDb((db) =>
              db.dailyReports.unshift({
                id: nextId("dr"),
                authorId: me,
                at: new Date().toISOString(),
                text, pic,
              }),
            );
            setOpen(false);
            toast.success("Posted to feed");
          }}
        />
      )}
    </div>
  );
}

function PostDialog({ onClose, onSave }: { onClose: () => void; onSave: (text: string, pic: string) => void }) {
  const [pic, setPic] = useState(SAMPLE_PICS[0]);
  const [text, setText] = useState("");
  const [userPic, setUserPic] = useState<string | null>(null);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Post a daily update</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Photo</Label>
            <div className="grid grid-cols-5 gap-2">
              {SAMPLE_PICS.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => { setPic(src); setUserPic(null); }}
                  className={cn(
                    "aspect-square rounded-lg bg-cover bg-center ring-2 transition",
                    pic === src && !userPic ? "ring-wood-700" : "ring-transparent hover:ring-wood-300",
                  )}
                  style={{ backgroundImage: `url(${src})` }}
                />
              ))}
            </div>
            <div className="mt-2">
              <label className="text-[11px] text-muted-foreground">…or upload from device</label>
              <input
                type="file"
                accept="image/*"
                className="block text-sm mt-1"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setUserPic(reader.result as string);
                    toast.success("Photo attached");
                  };
                  reader.readAsDataURL(f);
                }}
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="What's happening on the floor?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            if (!text.trim()) return toast.error("Add a short description");
            onSave(text.trim(), userPic ?? pic);
          }}>Post</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
