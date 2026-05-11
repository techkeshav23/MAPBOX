import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  delta?: string;
  trend?: "up" | "down" | "flat" | null;
  className?: string;
}

export function StatCard({ label, value, delta, trend, className }: StatCardProps) {
  return (
    <Card className={cn("p-4 gap-1", className)}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-[1.6rem] font-extrabold tracking-tight leading-tight">
        {value}
      </div>
      {delta && (
        <div
          className={cn(
            "text-[11px] font-semibold inline-flex items-center gap-1",
            trend === "up" && "text-emerald-700",
            trend === "down" && "text-rose-700",
            (!trend || trend === "flat") && "text-muted-foreground",
          )}
        >
          {trend === "up" && <ArrowUp className="w-3 h-3" />}
          {trend === "down" && <ArrowDown className="w-3 h-3" />}
          {trend === "flat" && <Minus className="w-3 h-3" />}
          {delta}
        </div>
      )}
    </Card>
  );
}
