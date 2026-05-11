"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet as MobileSheet, SheetContent, SheetTrigger,
  SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Menu, ChevronDown, Settings, Lock, LogOut } from "lucide-react";
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
  const meta = PAGE_META[pathname];

  function signOut() {
    clearSession();
    router.replace("/login");
  }

  return (
    <header className="h-12 bg-background border-b border-border flex items-center justify-between px-4 lg:px-5 sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0">
        <MobileSheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="lg:hidden -ml-2 rounded-sm">
                <Menu className="w-4 h-4" />
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-64 max-w-[80vw] [&>button]:hidden">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <MobileNav user={user} pathname={pathname} />
          </SheetContent>
        </MobileSheet>

        <div className="min-w-0 flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-[0.14em] font-semibold text-muted-foreground hidden sm:inline">
            you are at
          </span>
          <span className="text-sm font-medium truncate mono">
            {pathname.replace("/app", "") || "/"}
          </span>
          {meta && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground truncate hidden md:inline">{meta[0]}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="hidden sm:flex items-center gap-1.5 text-[11px] mono text-muted-foreground"
          title="Auto-logout countdown"
        >
          <span>idle</span>
          <span className={cn("font-medium", idleRemainingMs < 60_000 ? "text-rose-700" : "text-foreground")}>
            {formatRemaining(idleRemainingMs)}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="gap-2 px-2 h-8 rounded-sm">
                <span
                  className={cn(
                    "w-7 h-7 grid place-items-center text-[10px] font-semibold mono bg-muted text-foreground border border-border",
                  )}
                >
                  {user.initials}
                </span>
                <span className="hidden sm:flex items-baseline gap-1.5">
                  <span className="text-[13px] font-medium leading-none">{user.name.split(" ")[0]}</span>
                  <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    {user.role.replace("_", " ")}
                  </span>
                </span>
                <ChevronDown className="hidden sm:block w-3 h-3 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56 rounded-sm">
            <div className="px-2 py-1.5">
              <div className="text-sm font-semibold leading-tight">{user.name}</div>
              <div className="text-xs text-muted-foreground font-normal mono">{user.email}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/app/settings")}>
              <Settings className="w-4 h-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/app/vault")}>
              <Lock className="w-4 h-4 mr-2" /> Secure vault
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} variant="destructive">
              <LogOut className="w-4 h-4 mr-2" /> Sign out
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
      <div className="px-4 h-12 flex items-center gap-2 border-b border-border">
        <div className="font-serif text-base font-bold text-wood-900">SawmillOS</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {groups.map((g) => (
          <div key={g.section} className="px-2">
            <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.12em] px-2 pt-3 pb-1">
              {g.section}
            </div>
            {g.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 text-[13px]",
                  pathname === item.href ? "bg-wood-100 text-wood-900 font-medium" : "hover:bg-muted",
                )}
              >
                <item.icon className="w-3.5 h-3.5 opacity-70" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}

export { Sidebar } from "./sidebar";
