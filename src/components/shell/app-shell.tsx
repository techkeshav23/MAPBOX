"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore, getSession, touchSession, clearSession } from "@/lib/store";
import { getPersona } from "@/lib/seed";
import { canAccess, defaultRouteFor } from "@/lib/nav";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Toaster } from "@/components/ui/sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TriangleAlert } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useStore((s) => s.hydrated);
  const settings = useStore((s) => s.db.settings);

  const [user, setUser] = useState(() => {
    const s = typeof window !== "undefined" ? getSession() : null;
    return s ? getPersona(s.personaId) : undefined;
  });
  const [online, setOnline] = useState(true);
  const [idleRemaining, setIdleRemaining] = useState(settings.autoLogoutMin * 60_000);
  const [warnOpen, setWarnOpen] = useState(false);
  const [warnSec, setWarnSec] = useState(60);

  // ---- Auth gate
  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace("/login");
      return;
    }
    const u = getPersona(s.personaId);
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
    if (pathname === "/app" || !canAccess(u.role, pathname)) {
      router.replace(defaultRouteFor(u.role));
    }
  }, [router, pathname]);

  // ---- Online/offline
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  // ---- Idle watcher
  const limitMs = settings.autoLogoutMin * 60_000;

  const onActivity = useCallback(() => {
    touchSession();
  }, []);

  useEffect(() => {
    const evts = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    evts.forEach((e) => document.addEventListener(e, onActivity, { passive: true }));
    return () => evts.forEach((e) => document.removeEventListener(e, onActivity));
  }, [onActivity]);

  useEffect(() => {
    const tick = setInterval(() => {
      const s = getSession();
      if (!s) return;
      const remaining = Math.max(0, limitMs - (Date.now() - s.lastActiveAt));
      setIdleRemaining(remaining);
      if (remaining <= 60_000 && !warnOpen) {
        setWarnOpen(true);
      } else if (remaining > 60_000 && warnOpen) {
        setWarnOpen(false);
      }
      if (remaining <= 0) {
        clearSession();
        router.replace("/login");
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [limitMs, warnOpen, router]);

  useEffect(() => {
    if (!warnOpen) return;
    setWarnSec(Math.ceil(idleRemaining / 1000));
  }, [warnOpen, idleRemaining]);

  function stayIn() {
    touchSession();
    setWarnOpen(false);
  }

  function signOutNow() {
    clearSession();
    router.replace("/login");
  }

  if (!hydrated || !user) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar user={user} online={online} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar user={user} online={online} idleRemainingMs={idleRemaining} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-muted/30">{children}</main>
      </div>

      <Dialog open={warnOpen} onOpenChange={setWarnOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 grid place-items-center mb-3">
              <TriangleAlert className="w-5 h-5" />
            </div>
            <DialogTitle>You&apos;ll be signed out</DialogTitle>
            <DialogDescription>
              For security, idle sessions end after {settings.autoLogoutMin} minutes. Sign out in{" "}
              <span className="font-mono font-semibold">{warnSec}</span>s.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={signOutNow}>Sign out</Button>
            <Button onClick={stayIn}>Stay signed in</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster position="bottom-right" richColors />
    </div>
  );
}
