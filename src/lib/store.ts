// Zustand store with localStorage persistence + session.

"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { buildSeed } from "./seed";
import type { Db } from "./types";

interface AppState {
  db: Db;
  hydrated: boolean;
  setDb: (updater: (d: Db) => void) => void;
  resetDb: () => void;
  setHydrated: (v: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      db: buildSeed(),
      hydrated: false,
      setDb: (updater) =>
        set((s) => {
          const next = JSON.parse(JSON.stringify(s.db)) as Db;
          updater(next);
          return { db: next };
        }),
      resetDb: () => set({ db: buildSeed() }),
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "sawmillos:db:v1",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    },
  ),
);

// Session — stored in sessionStorage so multiple tabs / users on same machine stay isolated.
const SESSION_KEY = "sawmillos:session:v1";

export interface Session {
  personaId: string;
  startedAt: number;
  lastActiveAt: number;
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function setSession(s: Session): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

export function signIn(personaId: string): void {
  setSession({ personaId, startedAt: Date.now(), lastActiveAt: Date.now() });
}

export function touchSession(): void {
  const s = getSession();
  if (!s) return;
  setSession({ ...s, lastActiveAt: Date.now() });
}
