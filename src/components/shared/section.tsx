// Flat section: hairline divider + title row + content. No card chrome.

import { cn } from "@/lib/utils";

interface SectionProps {
  title?: string;
  sub?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  ruled?: boolean;     // ink top rule (heavier)
  noPad?: boolean;
}

export function Section({ title, sub, right, children, className, ruled, noPad }: SectionProps) {
  return (
    <section className={cn(ruled ? "rule" : "rule-thin", "min-w-0", className)}>
      {(title || right) && (
        <div className="flex items-end justify-between gap-3 px-1 pt-3 pb-2">
          {title && (
            <div className="min-w-0">
              <h3 className="text-[13px] font-semibold tracking-wide uppercase text-foreground">
                {title}
              </h3>
              {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
            </div>
          )}
          {right && <div className="flex items-center gap-2">{right}</div>}
        </div>
      )}
      <div className={cn("min-w-0", !noPad && "pt-1 pb-4")}>{children}</div>
    </section>
  );
}
