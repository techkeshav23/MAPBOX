"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet as MobileSheet, SheetContent, SheetTrigger,
  SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Menu, Wifi, WifiOff, Timer, ChevronDown, Settings, Lock, LogOut } from "lucide-react";
import { Sidebar } from "./sidebar";
import { NAV, PAGE_META } from "@/lib/nav";
import { clearSession } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Persona } from "@/lib/types";

interface TopbarProps {
  user: Persona;
  online: boolean;
  idleRemainingMs: number;
}

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Topbar({ user, online, idleRemainingMs }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [title, sub] = PAGE_META[pathname] ?? ["", ""];

  function signOut() {
    clearSession();
    router.replace("/login");
  }

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <MobileSheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden -ml-2">
                <Menu className="w-5 h-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-72 max-w-[80vw] [&>button]:hidden">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <MobileNav user={user} pathname={pathname} />
          </SheetContent>
        </MobileSheet>

        <div className="min-w-0">
          <div className="text-base font-semibold truncate">{title || "SawmillOS"}</div>
          <div className="text-xs text-muted-foreground truncate">{sub}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className={cn(
            "hidden sm:flex items-center gap-1.5 text-[11px]",
            online ? "text-muted-foreground" : "text-amber-700",
          )}
        >
          {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{online ? "Online" : "Offline — queued"}</span>
        </div>

        <div
          className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground"
          title="Auto-logout countdown"
        >
          <Timer className="w-3.5 h-3.5" />
          <span className="font-mono">{formatRemaining(idleRemainingMs)}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="gap-2 px-2 h-auto">
                <Avatar className={cn("w-8 h-8", user.color)}>
                  <AvatarFallback className="bg-transparent text-current font-bold text-sm">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold leading-none">{user.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{user.roleLabel}</div>
                </div>
                <ChevronDown className="hidden sm:block w-4 h-4 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/app/settings")}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/app/vault")}>
              <Lock className="w-4 h-4 mr-2" />
              Secure vault
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} variant="destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function MobileNav({ user, pathname }: { user: Persona; pathname: string }) {
  const groups = NAV[user.role];
  return (
    <div className="h-full flex flex-col">
      <div className="px-5 h-16 flex items-center gap-2.5 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-wood-700 text-wood-50 grid place-items-center font-extrabold">
          S
        </div>
        <div className="text-[15px] font-bold">SawmillOS</div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {groups.map((g) => (
          <div key={g.section}>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.08em] px-3 pt-3 pb-1">
              {g.section}
            </div>
            {g.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-wood-100 text-wood-800"
                    : "hover:bg-muted",
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}

export { Sidebar };
