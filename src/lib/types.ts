// Domain types for SawmillOS demo.

export type Role =
  | "super_admin"
  | "owner"
  | "production"
  | "hr"
  | "sales"
  | "accountant";

export type Tier = "Platform" | "Tenant";

export interface Persona {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string; // tailwind utility classes for avatar bg/text
  roleLabel: string;
  role: Role;
  tier: Tier;
  scope?: string;
}

export interface Tenant {
  id: string;
  name: string;
  city: string;
  plan: "Starter" | "Growth" | "Enterprise";
  status: "active" | "trialing" | "past_due";
  users: number;
  mrr: number;
  joined: string; // ISO date
  logsThisMonth: number;
  sawingHrs: number;
  primary: boolean;
}

export interface Message {
  from: string; // persona id or external id
  text: string;
  at: string; // ISO datetime
}

export interface SupportThread {
  id: string;
  tenantId: string;
  subject: string;
  unread: boolean;
  updatedAt: string;
  messages: Message[];
}

export interface TenantSettings {
  autoLogoutMin: number;
  currency: string;
  cftRate: number;
  mistriCommissionPct: number;
  ownerCommissionPct: number;
  organisation: string;
  address: string;
  gstin: string;
}

export interface LogLot {
  id: string;
  species: string;
  supplier: string;
  truck: string;
  received: string;
  pieces: number;
  gradedCft: number;
  ratePerCft: number;
  status: "pending" | "graded" | "sawed";
  notes: string;
}

export interface SawJob {
  id: string;
  logId: string;
  mistriId: string;
  startedAt: string;
  endedAt: string | null;
  inputCft: number;
  outputCft: number;
  wastageCft: number;
  status: "in_progress" | "completed" | "paused";
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  phone: string;
  wageType: "daily" | "piece";
  dailyWage?: number;
  pieceRate?: number;
  joined: string;
  idProof: string;
}

export interface Attendance {
  date: string;
  laborId: string;
  status: "present" | "half" | "absent";
  hoursOt: number;
}

export interface Customer {
  id: string;
  name: string;
  city: string;
  phone: string;
  gstin: string;
  balance: number;
}

export interface Order {
  id: string;
  customerId: string;
  date: string;
  species: string;
  cft: number;
  ratePerCft: number;
  status: "pending" | "packing" | "fulfilled";
  packingSlip: string;
}

export interface Invoice {
  id: string;
  customerId: string;
  orderId: string | null;
  date: string;
  amount: number; // taxable
  gst: number;
  total: number;
  paid: number;
  status: "open" | "partial" | "paid" | "overdue";
}

export interface Bill {
  id: string;
  vendor: string;
  date: string;
  amount: number;
  paid: number;
  status: "open" | "partial" | "paid";
}

export interface DailyReport {
  id: string;
  authorId: string;
  at: string;
  text: string;
  pic: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

export type SheetData = (string | number)[][];

export interface Sheet {
  id: string;
  folderId: string;
  name: string;
  updatedAt: string;
  data: SheetData;
}

export interface VaultItem {
  id: string;
  label: string;
  value: string;
  type: "bank" | "cred" | "idproof" | "doc";
}

export interface TeamChat {
  id: string;
  participants: string[];
  updatedAt: string;
  messages: Message[];
}

export interface Db {
  meta: { seededAt: string; version: number };
  tenants: Tenant[];
  supportThreads: SupportThread[];
  settings: TenantSettings;
  logs: LogLot[];
  sawJobs: SawJob[];
  labour: Worker[];
  attendance: Attendance[];
  customers: Customer[];
  orders: Order[];
  invoices: Invoice[];
  bills: Bill[];
  dailyReports: DailyReport[];
  folders: Folder[];
  sheets: Sheet[];
  vault: VaultItem[];
  teamChats: TeamChat[];
}
