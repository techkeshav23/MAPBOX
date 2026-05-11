// Sidebar navigation per role + page metadata.

import {
  LayoutDashboard, Building2, Inbox, Settings, Logs, Hammer,
  Users, ClipboardCheck, ShoppingCart, Receipt, Wallet, FileSpreadsheet,
  BarChart3, Camera, MessageSquare, LifeBuoy, Lock,
} from "lucide-react";
import type { Role } from "./types";
import type { ComponentType } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

export const NAV: Record<Role, NavSection[]> = {
  super_admin: [
    {
      section: "Platform",
      items: [
        { href: "/app/platform",          label: "Overview",          icon: LayoutDashboard },
        { href: "/app/platform/tenants",  label: "Tenants",           icon: Building2 },
        { href: "/app/platform/support",  label: "Support inbox",     icon: Inbox },
        { href: "/app/platform/settings", label: "Platform settings", icon: Settings },
      ],
    },
  ],
  owner: [
    { section: "Overview", items: [
      { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/app/reports",   label: "Reports",   icon: BarChart3 },
    ]},
    { section: "Production", items: [
      { href: "/app/production/logs",   label: "Log procurement", icon: Logs },
      { href: "/app/production/sawing", label: "Sawing",          icon: Hammer },
    ]},
    { section: "Workforce", items: [
      { href: "/app/workforce/labour",     label: "Labour",     icon: Users },
      { href: "/app/workforce/attendance", label: "Attendance", icon: ClipboardCheck },
    ]},
    { section: "Sales", items: [
      { href: "/app/sales/orders",    label: "Orders",    icon: ShoppingCart },
      { href: "/app/sales/customers", label: "Customers", icon: Users },
    ]},
    { section: "Accounting", items: [
      { href: "/app/accounts/ar",      label: "AR (invoices)", icon: Receipt },
      { href: "/app/accounts/ap",      label: "AP (bills)",    icon: Wallet },
      { href: "/app/accounts/payroll", label: "Payroll",       icon: Wallet },
      { href: "/app/accounts/tax",     label: "GST / Tax",     icon: Receipt },
    ]},
    { section: "Workspace", items: [
      { href: "/app/sheets",  label: "Sheets & Drive", icon: FileSpreadsheet },
      { href: "/app/feed",    label: "Daily feed",     icon: Camera },
      { href: "/app/chat",    label: "Team chat",      icon: MessageSquare },
      { href: "/app/support", label: "Support",        icon: LifeBuoy },
    ]},
  ],
  production: [
    { section: "Overview", items: [
      { href: "/app/production", label: "My dashboard", icon: LayoutDashboard },
    ]},
    { section: "Production", items: [
      { href: "/app/production/logs",   label: "Log procurement", icon: Logs },
      { href: "/app/production/sawing", label: "Sawing",          icon: Hammer },
    ]},
    { section: "Workspace", items: [
      { href: "/app/sheets", label: "Sheets & Drive", icon: FileSpreadsheet },
      { href: "/app/feed",   label: "Daily feed",     icon: Camera },
      { href: "/app/chat",   label: "Team chat",      icon: MessageSquare },
    ]},
  ],
  hr: [
    { section: "Overview", items: [
      { href: "/app/workforce", label: "My dashboard", icon: LayoutDashboard },
    ]},
    { section: "Workforce", items: [
      { href: "/app/workforce/labour",       label: "Labour",          icon: Users },
      { href: "/app/workforce/attendance",   label: "Attendance",      icon: ClipboardCheck },
      { href: "/app/accounts/payroll-view",  label: "Payroll (view)",  icon: Wallet },
    ]},
    { section: "Workspace", items: [
      { href: "/app/sheets", label: "Sheets & Drive", icon: FileSpreadsheet },
      { href: "/app/feed",   label: "Daily feed",     icon: Camera },
      { href: "/app/chat",   label: "Team chat",      icon: MessageSquare },
    ]},
  ],
  sales: [
    { section: "Overview", items: [
      { href: "/app/sales", label: "My dashboard", icon: LayoutDashboard },
    ]},
    { section: "Sales", items: [
      { href: "/app/sales/orders",    label: "Orders",    icon: ShoppingCart },
      { href: "/app/sales/customers", label: "Customers", icon: Users },
    ]},
    { section: "Workspace", items: [
      { href: "/app/sheets", label: "Sheets & Drive", icon: FileSpreadsheet },
      { href: "/app/feed",   label: "Daily feed",     icon: Camera },
      { href: "/app/chat",   label: "Team chat",      icon: MessageSquare },
    ]},
  ],
  accountant: [
    { section: "Overview", items: [
      { href: "/app/accounts", label: "My dashboard", icon: LayoutDashboard },
      { href: "/app/reports",  label: "Reports",      icon: BarChart3 },
    ]},
    { section: "Books", items: [
      { href: "/app/accounts/ar",      label: "AR (invoices)", icon: Receipt },
      { href: "/app/accounts/ap",      label: "AP (bills)",    icon: Wallet },
      { href: "/app/accounts/payroll", label: "Payroll",       icon: Wallet },
      { href: "/app/accounts/tax",     label: "GST / Tax",     icon: Receipt },
    ]},
    { section: "Workspace", items: [
      { href: "/app/sheets", label: "Sheets & Drive", icon: FileSpreadsheet },
    ]},
  ],
};

// Pages a given role is permitted to land on (string-prefix check).
// `/app/vault` and `/app/settings` are added to every role programmatically below.
const COMMON = ["/app/vault", "/app/settings"];

export const ROLE_ROUTES: Record<Role, string[]> = {
  super_admin: ["/app/platform"].concat(COMMON),
  owner: [
    "/app/dashboard","/app/reports","/app/production","/app/workforce",
    "/app/sales","/app/accounts","/app/sheets","/app/feed","/app/chat","/app/support",
  ].concat(COMMON),
  production: ["/app/production","/app/sheets","/app/feed","/app/chat"].concat(COMMON),
  hr: ["/app/workforce","/app/accounts/payroll-view","/app/sheets","/app/feed","/app/chat"].concat(COMMON),
  sales: ["/app/sales","/app/sheets","/app/feed","/app/chat"].concat(COMMON),
  accountant: ["/app/accounts","/app/reports","/app/sheets"].concat(COMMON),
};

export function defaultRouteFor(role: Role): string {
  switch (role) {
    case "super_admin": return "/app/platform";
    case "owner":       return "/app/dashboard";
    case "production":  return "/app/production";
    case "hr":          return "/app/workforce";
    case "sales":       return "/app/sales";
    case "accountant":  return "/app/accounts";
  }
}

export function canAccess(role: Role, path: string): boolean {
  // Restrict accountant explicitly from /app/accounts/payroll-view (HR-only)
  if (role !== "hr" && path.startsWith("/app/accounts/payroll-view")) return false;
  return ROLE_ROUTES[role].some((r) => path === r || path.startsWith(r + "/"));
}

// Page header titles (path -> [title, sub])
export const PAGE_META: Record<string, [string, string]> = {
  "/app/platform":          ["Platform overview", "SaaS health · all tenants"],
  "/app/platform/tenants":  ["Tenants",           "Subscribed sawmills"],
  "/app/platform/support":  ["Support inbox",     "Tenant conversations"],
  "/app/platform/settings": ["Platform settings", "Plans, billing, defaults"],

  "/app/dashboard":         ["Dashboard",         "Sharma Sawmill · today"],
  "/app/production":        ["Production",        "Logs, sawing, yield"],
  "/app/workforce":         ["HR & Foreman",      "Labour and attendance"],
  "/app/sales":             ["Sales desk",        "Orders and customers"],
  "/app/accounts":          ["Accounts",          "AR, AP, payroll, tax"],

  "/app/production/logs":   ["Log procurement",   "Inbound logs and grading"],
  "/app/production/sawing": ["Sawing",            "Jobs, yield, mistri & owner commission"],

  "/app/workforce/labour":     ["Labour",         "Workers and roles"],
  "/app/workforce/attendance": ["Attendance",     "Daily marking · payroll input"],

  "/app/sales/orders":      ["Orders",            "Customer sales orders"],
  "/app/sales/customers":   ["Customers",         "Buyer directory and balances"],

  "/app/accounts/ar":           ["AR — invoices",  "Money owed to us"],
  "/app/accounts/ap":           ["AP — bills",     "Money we owe"],
  "/app/accounts/payroll":      ["Payroll",        "Wages and disbursement"],
  "/app/accounts/payroll-view": ["Payroll (view)", "Wages — read only"],
  "/app/accounts/tax":          ["GST & tax",      "Compliance summary"],

  "/app/sheets":  ["Sheets & Drive", "Folders, spreadsheets"],
  "/app/reports": ["Reports",        "Daily and monthly · Excel export"],
  "/app/feed":    ["Daily feed",     "Photo updates from the floor"],
  "/app/chat":    ["Team chat",      "Internal messenger"],
  "/app/support": ["Support",        "Talk to SawmillOS team"],
  "/app/vault":   ["Secure vault",   "Admin-only sensitive data"],
  "/app/settings":["Settings",       "Personal & workspace"],
};
