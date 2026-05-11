// Persona registry + factory for the seed database.

import type { Attendance, Db, Persona } from "./types";

export const PERSONAS: Persona[] = [
  {
    id: "rajesh",
    name: "Rajesh Khanna",
    email: "rajesh@sawmillos.app",
    initials: "RK",
    color: "bg-violet-100 text-violet-800",
    roleLabel: "App Manager (SaaS)",
    role: "super_admin",
    tier: "Platform",
    scope: "All tenants",
  },
  {
    id: "mahesh",
    name: "Mahesh Sharma",
    email: "mahesh@sharma-sawmill.in",
    initials: "MS",
    color: "bg-wood-100 text-wood-800",
    roleLabel: "Owner / Admin",
    role: "owner",
    tier: "Tenant",
    scope: "Sharma Sawmill",
  },
  {
    id: "vikram",
    name: "Vikram Yadav",
    email: "vikram@sharma-sawmill.in",
    initials: "VY",
    color: "bg-amber-100 text-amber-800",
    roleLabel: "Production Manager",
    role: "production",
    tier: "Tenant",
    scope: "Sharma Sawmill",
  },
  {
    id: "sunil",
    name: "Sunil Verma",
    email: "sunil@sharma-sawmill.in",
    initials: "SV",
    color: "bg-emerald-100 text-emerald-800",
    roleLabel: "HR / Foreman",
    role: "hr",
    tier: "Tenant",
    scope: "Sharma Sawmill",
  },
  {
    id: "priya",
    name: "Priya Mehta",
    email: "priya@sharma-sawmill.in",
    initials: "PM",
    color: "bg-rose-100 text-rose-800",
    roleLabel: "Sales Clerk",
    role: "sales",
    tier: "Tenant",
    scope: "Sharma Sawmill",
  },
  {
    id: "anjali",
    name: "Anjali Gupta",
    email: "anjali@sharma-sawmill.in",
    initials: "AG",
    color: "bg-blue-100 text-blue-800",
    roleLabel: "Accountant",
    role: "accountant",
    tier: "Tenant",
    scope: "Sharma Sawmill",
  },
];

export function getPersona(id: string): Persona | undefined {
  return PERSONAS.find((p) => p.id === id);
}

const days = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const dateOffset = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

export function buildSeed(): Db {
  return {
    meta: { seededAt: new Date().toISOString(), version: 1 },

    tenants: [
      { id: "sharma-sawmill", name: "Sharma Sawmill", city: "Yamunanagar, Haryana", plan: "Growth", status: "active", users: 6, mrr: 4999, joined: "2024-08-12", logsThisMonth: 1240, sawingHrs: 184, primary: true },
      { id: "patel-timber", name: "Patel Timber Works", city: "Surat, Gujarat", plan: "Starter", status: "active", users: 3, mrr: 1999, joined: "2025-01-22", logsThisMonth: 410, sawingHrs: 92, primary: false },
      { id: "verma-wood", name: "Verma Wood Co.", city: "Saharanpur, UP", plan: "Growth", status: "active", users: 7, mrr: 4999, joined: "2024-11-04", logsThisMonth: 1620, sawingHrs: 211, primary: false },
      { id: "gks-mills", name: "GKS Industrial Mills", city: "Pune, Maharashtra", plan: "Enterprise", status: "trialing", users: 12, mrr: 0, joined: "2026-04-29", logsThisMonth: 320, sawingHrs: 41, primary: false },
      { id: "birla-lumber", name: "Birla Lumber Co-op", city: "Jodhpur, Rajasthan", plan: "Growth", status: "past_due", users: 5, mrr: 4999, joined: "2025-03-14", logsThisMonth: 0, sawingHrs: 0, primary: false },
    ],

    supportThreads: [
      {
        id: "t1", tenantId: "sharma-sawmill", subject: "Yield report column missing",
        unread: false, updatedAt: days(0.2),
        messages: [
          { from: "mahesh", text: 'In monthly yield report, "wastage %" column not showing for April. Pls check.', at: days(0.6) },
          { from: "rajesh", text: "Sure Mahesh ji, looking into it. Will revert by EOD.", at: days(0.4) },
          { from: "mahesh", text: "Thanks, also need a callback to discuss the new CFT pricing.", at: days(0.2) },
        ],
      },
      {
        id: "t2", tenantId: "patel-timber", subject: 'Add "Burma Teak" to log species list',
        unread: true, updatedAt: days(1.2),
        messages: [
          { from: "patel-owner", text: "Hi, need Burma Teak as a log species option in procurement. Right now we have to type it manually each time.", at: days(1.2) },
        ],
      },
      {
        id: "t3", tenantId: "verma-wood", subject: "Onboarding session for new accountant",
        unread: false, updatedAt: days(3),
        messages: [
          { from: "verma-owner", text: "New accountant joining Monday. Can we book a 30-min walkthrough?", at: days(4) },
          { from: "rajesh", text: "Booked for Mon 11am. Calendar invite sent.", at: days(3) },
        ],
      },
    ],

    settings: {
      autoLogoutMin: 10,
      currency: "₹",
      cftRate: 1100,
      mistriCommissionPct: 4,
      ownerCommissionPct: 8,
      organisation: "Sharma Sawmill",
      address: "Sector 12, Yamunanagar, Haryana 135001",
      gstin: "06ABCDE1234F1Z5",
    },

    logs: [
      { id: "L-2401", species: "Sheesham", supplier: "Rajinder Timber", truck: "HR58 4421", received: dateOffset(2),  pieces: 38, gradedCft: 412.5, ratePerCft: 920, status: "graded", notes: "" },
      { id: "L-2402", species: "Teak",     supplier: "Vatika Forest",   truck: "PB10 7732", received: dateOffset(1),  pieces: 22, gradedCft: 268.0, ratePerCft: 1450, status: "graded", notes: "AAA grade" },
      { id: "L-2403", species: "Mango",    supplier: "Local farmer",    truck: "HR58 1109", received: dateOffset(1),  pieces: 12, gradedCft: 96.4,  ratePerCft: 540, status: "pending", notes: "awaiting grading" },
      { id: "L-2404", species: "Sheesham", supplier: "Rajinder Timber", truck: "HR58 4421", received: dateOffset(0),  pieces: 41, gradedCft: 0,     ratePerCft: 920, status: "pending", notes: "" },
      { id: "L-2405", species: "Eucalyptus", supplier: "GreenLine Logs", truck: "UK07 9921", received: dateOffset(4), pieces: 64, gradedCft: 318.0, ratePerCft: 410, status: "graded", notes: "plywood grade" },
      { id: "L-2406", species: "Teak",     supplier: "Vatika Forest",   truck: "PB10 7732", received: dateOffset(7),  pieces: 18, gradedCft: 220.5, ratePerCft: 1450, status: "sawed", notes: "" },
    ],

    sawJobs: [
      { id: "SJ-501", logId: "L-2406", mistriId: "lab-2", startedAt: days(6), endedAt: days(5), inputCft: 220.5, outputCft: 184.2, wastageCft: 36.3, status: "completed" },
      { id: "SJ-502", logId: "L-2401", mistriId: "lab-1", startedAt: days(1), endedAt: null,    inputCft: 412.5, outputCft: 0,    wastageCft: 0,   status: "in_progress" },
      { id: "SJ-503", logId: "L-2405", mistriId: "lab-3", startedAt: days(3), endedAt: days(2), inputCft: 318.0, outputCft: 251.4, wastageCft: 66.6, status: "completed" },
    ],

    labour: [
      { id: "lab-1", name: "Ramesh Kumar", role: "Mistri", phone: "98180-11221", wageType: "daily", dailyWage: 650, joined: "2023-06-12", idProof: "AADHAAR ****1234" },
      { id: "lab-2", name: "Sohan Lal",    role: "Mistri", phone: "98180-44209", wageType: "daily", dailyWage: 700, joined: "2022-04-02", idProof: "AADHAAR ****8821" },
      { id: "lab-3", name: "Iqbal Khan",   role: "Mistri", phone: "99100-77821", wageType: "piece", pieceRate: 12, joined: "2024-01-15", idProof: "AADHAAR ****0042" },
      { id: "lab-4", name: "Mohan Singh",  role: "Helper", phone: "98180-99127", wageType: "daily", dailyWage: 420, joined: "2024-09-10", idProof: "AADHAAR ****7711" },
      { id: "lab-5", name: "Vinod Yadav",  role: "Helper", phone: "98180-10299", wageType: "daily", dailyWage: 420, joined: "2025-02-18", idProof: "AADHAAR ****3041" },
      { id: "lab-6", name: "Deepak Sahu",  role: "Loader", phone: "99100-88210", wageType: "daily", dailyWage: 480, joined: "2024-11-22", idProof: "AADHAAR ****6688" },
    ],

    attendance: (() => {
      const out: Attendance[] = [];
      const labIds = ["lab-1", "lab-2", "lab-3", "lab-4", "lab-5", "lab-6"];
      for (let d = 0; d < 14; d++) {
        labIds.forEach((id) => {
          const present = Math.random() > 0.12;
          out.push({
            date: dateOffset(d),
            laborId: id,
            status: (present ? (Math.random() > 0.85 ? "half" : "present") : "absent") as "present" | "half" | "absent",
            hoursOt: present && Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0,
          });
        });
      }
      return out;
    })(),

    customers: [
      { id: "C-1", name: "Modern Furniture House", city: "Karnal",    phone: "98180-22210", gstin: "06ABCFM1234A1Z2", balance: 48200 },
      { id: "C-2", name: "Aastha Builders",        city: "Panipat",   phone: "98180-77321", gstin: "06ABCAB9921A1Z9", balance: 12000 },
      { id: "C-3", name: "Khanna Plywood",         city: "Yamunanagar", phone: "98180-44120", gstin: "06ABCKP5510A1Z1", balance: 0 },
      { id: "C-4", name: "Royal Crafts Pvt Ltd",   city: "Delhi",     phone: "98180-99887", gstin: "07ABCRC2210A1Z6", balance: 89400 },
    ],

    orders: [
      { id: "SO-3201", customerId: "C-1", date: dateOffset(2), species: "Sheesham",  cft: 42, ratePerCft: 1250, status: "fulfilled", packingSlip: "PS-3201" },
      { id: "SO-3202", customerId: "C-4", date: dateOffset(1), species: "Teak",      cft: 28, ratePerCft: 2100, status: "packing",   packingSlip: "" },
      { id: "SO-3203", customerId: "C-2", date: dateOffset(0), species: "Eucalyptus",cft: 88, ratePerCft: 540,  status: "pending",   packingSlip: "" },
      { id: "SO-3204", customerId: "C-3", date: dateOffset(0), species: "Sheesham",  cft: 18, ratePerCft: 1250, status: "fulfilled", packingSlip: "PS-3204" },
      { id: "SO-3205", customerId: "C-1", date: dateOffset(5), species: "Teak",      cft: 15, ratePerCft: 2100, status: "fulfilled", packingSlip: "PS-3205" },
    ],

    invoices: [
      { id: "INV-9981", customerId: "C-1", orderId: "SO-3201", date: dateOffset(2), amount: 52500, gst: 9450,  total: 61950, paid: 13750, status: "partial" },
      { id: "INV-9982", customerId: "C-3", orderId: "SO-3204", date: dateOffset(0), amount: 22500, gst: 4050,  total: 26550, paid: 26550, status: "paid" },
      { id: "INV-9980", customerId: "C-1", orderId: "SO-3205", date: dateOffset(5), amount: 31500, gst: 5670,  total: 37170, paid: 37170, status: "paid" },
      { id: "INV-9979", customerId: "C-4", orderId: null,      date: dateOffset(8), amount: 75000, gst: 13500, total: 88500, paid: 0,     status: "overdue" },
    ],

    bills: [
      { id: "BILL-441", vendor: "Rajinder Timber", date: dateOffset(2), amount: 379500, paid: 200000, status: "partial" },
      { id: "BILL-442", vendor: "Vatika Forest",   date: dateOffset(1), amount: 388600, paid: 388600, status: "paid" },
      { id: "BILL-443", vendor: "GreenLine Logs",  date: dateOffset(4), amount: 130380, paid: 0,      status: "open" },
      { id: "BILL-444", vendor: "BSES Power",      date: dateOffset(6), amount: 41200,  paid: 41200,  status: "paid" },
      { id: "BILL-445", vendor: "Diesel — HP Petrol", date: dateOffset(0), amount: 18400, paid: 0,    status: "open" },
    ],

    dailyReports: [
      { id: "dr-1", authorId: "sunil", at: days(0.4), text: "Morning shift started 8 AM. 6 mistri on floor. Power cut at 11:30 for 40 min — saw line idle.", pic: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&q=70" },
      { id: "dr-2", authorId: "vikram", at: days(1),   text: "Sheesham lot L-2401 graded. AAA grade ratio is 28% — slightly below avg.", pic: "https://images.unsplash.com/photo-1518792528501-352f829886dc?w=600&q=70" },
      { id: "dr-3", authorId: "sunil",  at: days(2),   text: "New helper Vinod onboarded. ID proof collected. Safety gear issued.", pic: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=600&q=70" },
    ],

    folders: [
      { id: "f-root",     name: "My Drive",     parentId: null },
      { id: "f-hr",       name: "HR & Payroll", parentId: "f-root" },
      { id: "f-prod",     name: "Production",   parentId: "f-root" },
      { id: "f-sales",    name: "Sales",        parentId: "f-root" },
      { id: "f-acc",      name: "Accounting",   parentId: "f-root" },
      { id: "f-acc-2026", name: "FY 2026-27",   parentId: "f-acc" },
    ],

    sheets: [
      { id: "s-1", folderId: "f-hr", name: "Attendance Apr 2026.xlsx", updatedAt: days(0.2),
        data: [
          ["Date", "Worker", "Role", "Status", "OT Hrs"],
          [dateOffset(0), "Ramesh Kumar", "Mistri", "Present", 1],
          [dateOffset(0), "Sohan Lal", "Mistri", "Present", 0],
          [dateOffset(0), "Iqbal Khan", "Mistri", "Half", 0],
          [dateOffset(0), "Mohan Singh", "Helper", "Present", 2],
          [dateOffset(0), "Vinod Yadav", "Helper", "Absent", 0],
        ] },
      { id: "s-2", folderId: "f-prod", name: "Yield log L-2406.xlsx", updatedAt: days(1.5),
        data: [
          ["Job ID", "Log ID", "Mistri", "Input CFT", "Output CFT", "Wastage %"],
          ["SJ-501", "L-2406", "Sohan Lal", 220.5, 184.2, "16.5%"],
        ] },
      { id: "s-3", folderId: "f-sales", name: "Customer ledger.xlsx", updatedAt: days(2),
        data: [
          ["Customer", "City", "Balance", "Last Order"],
          ["Modern Furniture House", "Karnal", 48200, dateOffset(2)],
          ["Aastha Builders", "Panipat", 12000, dateOffset(0)],
          ["Royal Crafts Pvt Ltd", "Delhi", 89400, dateOffset(8)],
        ] },
      { id: "s-4", folderId: "f-acc-2026", name: "GST output Q1.xlsx", updatedAt: days(3),
        data: [
          ["Invoice", "Date", "Customer", "Taxable", "GST 18%", "Total"],
          ["INV-9979", dateOffset(8), "Royal Crafts Pvt Ltd", 75000, 13500, 88500],
          ["INV-9980", dateOffset(5), "Modern Furniture House", 31500, 5670, 37170],
          ["INV-9981", dateOffset(2), "Modern Furniture House", 52500, 9450, 61950],
          ["INV-9982", dateOffset(0), "Khanna Plywood", 22500, 4050, 26550],
        ] },
    ],

    vault: [
      { id: "v-1", label: "Bank account — HDFC current",  value: "A/C 5012 4421 0089 · IFSC HDFC0001245", type: "bank" },
      { id: "v-2", label: "GSTIN credentials",            value: "user: shsaw_g · pwd: ●●●●●●●●", type: "cred" },
      { id: "v-3", label: "Aadhaar — Ramesh Kumar (lab-1)", value: "****-****-1234 (front+back scans)", type: "idproof" },
      { id: "v-4", label: "Aadhaar — Sohan Lal (lab-2)",    value: "****-****-8821 (front+back scans)", type: "idproof" },
      { id: "v-5", label: "Property lease deed",            value: "Sector 12 plot · 15 yr lease · expiry 2034-08", type: "doc" },
    ],

    teamChats: [
      { id: "tc-1", participants: ["mahesh", "vikram"], updatedAt: days(0.5),
        messages: [
          { from: "mahesh", text: "Sheesham AAA ratio kyun gir gaya?", at: days(0.6) },
          { from: "vikram", text: "Supplier ne mixed lot bheja hai. Maine note daal diya.", at: days(0.5) },
        ] },
      { id: "tc-2", participants: ["mahesh", "sunil"], updatedAt: days(1),
        messages: [{ from: "sunil", text: "Vinod ki ID proof file Vault mein add kar di.", at: days(1) }] },
    ],
  };
}
