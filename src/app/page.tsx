"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/store";
import { defaultRouteFor } from "@/lib/nav";
import { getPersona } from "@/lib/seed";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const s = getSession();
    if (s) {
      const u = getPersona(s.personaId);
      router.replace(u ? defaultRouteFor(u.role) : "/login");
    } else {
      router.replace("/login");
    }
  }, [router]);
  return null;
}
