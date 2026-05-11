// Tiny dot + label — replaces colorful pill badges.

import { cn } from "@/lib/utils";

type Tone = "emerald" | "amber" | "rose" | "slate" | "wood";

const STATUS_TONE: Record<string, Tone> = {
  active: "emerald",
  trialing: "wood",
  past_due: "rose",
  paid: "emerald",
  partial: "amber",
  open: "slate",
  overdue: "rose",
  pending: "slate",
  packing: "amber",
  fulfilled: "emerald",
  in_progress: "amber",
  completed: "emerald",
  paused: "slate",
  graded: "emerald",
  sawed: "wood",
  present: "emerald",
  absent: "rose",
  half: "amber",
  Starter: "slate",
  Growth: "wood",
  Enterprise: "wood",
};

export function StatusDot({
  value,
  tone,
  className,
}: { value: string; tone?: Tone; className?: string }) {
  const t = tone ?? STATUS_TONE[value] ?? "slate";
  return (
    <span className={cn("status-text whitespace-nowrap", className)}>
      <span className={`dot dot-${t}`} />
      {value.replace(/_/g, " ")}
    </span>
  );
}
