import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  sticky?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  sticky = true,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 transition-colors",
        sticky &&
          "sticky top-16 z-20 bg-gray-50/95 dark:bg-slate-950/95 backdrop-blur-md py-2.5 -my-2.5",
        className,
      )}
    >
      <div className="min-w-0">
        {title && (
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
        )}
        {description && (
          <p className={cn("text-sm text-slate-500 dark:text-slate-400", title && "mt-2")}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
}

