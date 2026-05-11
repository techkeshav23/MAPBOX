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
    <aside className="hidden lg:flex w-56 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="px-4 h-12 flex items-center gap-2 border-b border-sidebar-border">
        <div className="font-serif text-base font-bold text-wood-900 tracking-tight leading-none">
          SawmillOS
        </div>
        <div className="text-[9px] uppercase tracking-[0.14em] text-muted-foreground font-semibold mt-1">
          {user.role === "super_admin" ? "platform" : "tenant"}
        </div>
      </div>

      <div className="px-4 py-2 border-b border-sidebar-border">
        <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-semibold">
          {user.role === "super_admin" ? "All tenants" : "Workspace"}
        </div>
        <div className="mono text-[12px] font-medium truncate">
          {user.scope ?? "—"}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 space-y-px">
        {groups.map((g) => (
          <div key={g.section} className="px-2">
            <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-[0.12em] px-2 pt-3 pb-1">
              {g.section}
            </div>
            {g.items.map((item) => {
              const isExact = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 text-[13px] transition-colors",
                    isExact
                      ? "bg-wood-100 text-wood-900 font-medium border-l-2 border-wood-700 -ml-px pl-[7px]"
                      : "text-sidebar-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent -ml-px pl-[7px]",
                  )}
                >
                  <item.icon className="w-3.5 h-3.5 opacity-70" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-4 py-2.5 flex items-center gap-2 text-[11px] mono">
        <span className={cn("dot", online ? "dot-emerald" : "dot-amber")} />
        <span className="text-muted-foreground">
          {online ? "online" : "offline · queued"}
        </span>
      </div>
    </aside>
  );
}
