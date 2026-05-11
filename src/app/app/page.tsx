"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/store";
import { getPersona } from "@/lib/seed";
import { defaultRouteFor } from "@/lib/nav";

export default function AppRoot() {
  const router = useRouter();
  useEffect(() => {
    const s = getSession();
    if (!s) return router.replace("/login");
    const u = getPersona(s.personaId);
    router.replace(u ? defaultRouteFor(u.role) : "/login");
  }, [router]);
  return null;
}
