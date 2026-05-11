import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  // generic
  emerald: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  amber:   "bg-amber-100 text-amber-800 hover:bg-amber-100",
  rose:    "bg-rose-100 text-rose-800 hover:bg-rose-100",
  slate:   "bg-slate-100 text-slate-700 hover:bg-slate-100",
  blue:    "bg-blue-100 text-blue-800 hover:bg-blue-100",
  violet:  "bg-violet-100 text-violet-800 hover:bg-violet-100",
  wood:    "bg-wood-100 text-wood-800 hover:bg-wood-100",
};

const STATUS_TONE: Record<string, keyof typeof tones> = {
  active: "emerald",
  trialing: "blue",
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
  sawed: "blue",
  present: "emerald",
  absent: "rose",
  half: "amber",
  Starter: "slate",
  Growth: "wood",
  Enterprise: "violet",
};

export function StatusBadge({ value, tone }: { value: string; tone?: keyof typeof tones }) {
  const t = tone ?? STATUS_TONE[value] ?? "slate";
  return (
    <Badge variant="secondary" className={cn("font-semibold", tones[t])}>
      {String(value).replace(/_/g, " ")}
    </Badge>
  );
}
