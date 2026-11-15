import { cn } from "@/lib/utils";
import type { UserRecord } from "@/hooks/useUsers";

export const ROLE_LABELS: Record<UserRecord["role"], string> = {
  LGU_ADMIN: "Admin",
  FIELD_WORKER: "Field Worker",
  CITIZEN: "Citizen",
};

const ROLE_BADGE_CLASSES: Record<UserRecord["role"], string> = {
  LGU_ADMIN: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300",
  FIELD_WORKER: "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300",
  CITIZEN: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
};

export function UserRoleBadge({ role }: { role: UserRecord["role"] }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", ROLE_BADGE_CLASSES[role])}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

export function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
      isActive
        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
        : "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300",
    )}>
      <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-emerald-500" : "bg-red-500")} />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}
