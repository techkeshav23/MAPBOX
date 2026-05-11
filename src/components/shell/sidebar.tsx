"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV } from "@/lib/nav";
import type { Persona } from "@/lib/types";

export function Sidebar({ user, online }: { user: Persona; online: boolean }) {
  const pathname = usePathname();
  const groups = NAV[user.role];

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="px-5 h-16 flex items-center gap-2.5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-wood-700 text-wood-50 grid place-items-center font-extrabold">
          S
        </div>
        <div>
          <div className="text-[15px] font-bold leading-tight">SawmillOS</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {user.role === "super_admin" ? "Platform" : user.scope}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {groups.map((g) => (
          <div key={g.section}>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.08em] px-3 pt-3 pb-1">
              {g.section}
            </div>
            {g.items.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/app" && pathname.startsWith(item.href + "/")) ||
                (item.href.includes("/app/production") && pathname === "/app/production") ||
                false;
              const isExact = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isExact
                      ? "bg-wood-100 text-wood-800"
                      : "text-sidebar-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {!online && (
        <div className="mx-3 mb-3 rounded-md bg-amber-50 border border-amber-200 p-2.5 text-[11px] text-amber-800">
          <div className="font-semibold">Offline</div>
          Changes queued locally. Will sync on reconnect.
        </div>
      )}
    </aside>
  );
}
