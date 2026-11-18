import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-4", className)}>
      <div>
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
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

