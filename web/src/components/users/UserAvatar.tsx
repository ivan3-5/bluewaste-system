"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import type { UserRecord } from "@/hooks/useUsers";
import { cn } from "@/lib/utils";

const roleColors: Record<UserRecord["role"], string> = {
  LGU_ADMIN: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  FIELD_WORKER: "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300",
  CITIZEN: "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

export function UserAvatar({
  user,
}: {
  user: Pick<UserRecord, "avatarUrl" | "firstName" | "lastName" | "role">;
}) {
  const initials = `${user.firstName.trim().charAt(0)}${user.lastName.trim().charAt(0)}`.toUpperCase() || "?";

  return (
    <Avatar
      aria-hidden="true"
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold",
        roleColors[user.role] ?? roleColors.CITIZEN,
      )}
    >
      <AvatarImage src={user.avatarUrl?.trim() || undefined} alt="" className="h-full w-full object-cover" />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
