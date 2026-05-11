// Newspaper-style horizontal facts row. Replaces 4-up KPI cards on dashboards.

import { cn } from "@/lib/utils";

export interface Fact {
  label: string;
  value: React.ReactNode;
  sub?: string;
  trend?: "up" | "down" | "flat";
}

export function DataStrip({ facts, className }: { facts: Fact[]; className?: string }) {
  return (
    <div className={cn("datastrip", className)}>
      {facts.map((f, i) => (
        <div key={i}>
          <div className="datastrip-label">{f.label}</div>
          <div className="datastrip-value">{f.value}</div>
          {f.sub && (
            <div className={cn("datastrip-sub", f.trend === "up" && "up", f.trend === "down" && "down")}>
              {f.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
