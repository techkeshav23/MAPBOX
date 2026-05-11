interface PageHeaderProps {
  title: string;
  sub?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({ title, sub, meta, actions }: PageHeaderProps) {
  return (
    <header className="rule pt-3 pb-4 mb-4 flex items-end justify-between gap-3 flex-wrap">
      <div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
          {meta}
        </div>
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground leading-tight mt-0.5">
          {title}
        </h1>
        {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
