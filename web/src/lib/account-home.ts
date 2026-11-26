import type { User } from "@/types";

export function accountHome(role: User["role"]) {
  if (role === "LGU_ADMIN") return "/dashboard";
  if (role === "FIELD_WORKER") return "/field-worker";
  return "/citizen/report";
}
