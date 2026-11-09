"use client";

import { useState, useRef } from "react";
import { Plus, Search } from "lucide-react";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  UserRecord,
} from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn, formatDateTime } from "@/lib/utils";
import {
  DataTableSkeleton,
  FilterToolbarSkeleton,
  PageHeadingSkeleton,
} from "@/components/skeletons/page-skeletons";
import { useLiveNotifications } from "@/contexts/LiveNotificationContext";
import { PaginationControls } from "@/components/ui/pagination";

const ROLE_LABELS: Record<string, string> = {
  LGU_ADMIN: "Admin",
  FIELD_WORKER: "Field Worker",
  CITIZEN: "Citizen",
};

const ROLE_BADGE_CLASSES: Record<string, string> = {
  LGU_ADMIN: "bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300",
  FIELD_WORKER: "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300",
  CITIZEN: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
};

const ROLE_DOT_COLORS: Record<string, string> = {
  LGU_ADMIN: "bg-blue-500",
  FIELD_WORKER: "bg-green-500",
  CITIZEN: "bg-slate-400",
};

const ROLE_AVATAR_CLASSES: Record<string, string> = {
  LGU_ADMIN: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300",
  FIELD_WORKER: "bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300",
  CITIZEN: "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
};

const FIELD_CLASS =
  "rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus-visible:ring-blue-500/20 focus-visible:ring-offset-0 focus-visible:border-blue-500";

const TH_CLASS =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400";

const ROLES = ["LGU_ADMIN", "FIELD_WORKER", "CITIZEN"] as const;
const ADD_ROLES = ["LGU_ADMIN", "FIELD_WORKER"] as const;

type Role = (typeof ROLES)[number];

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
  phone: string;
}

const emptyForm: UserFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "FIELD_WORKER",
  phone: "",
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";
}

export default function UsersPage() {
  const { pushToast } = useLiveNotifications();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // editUser is kept after closing so the dialog doesn't swap forms mid fade-out.
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserRecord | null>(null);

  const [form, setForm] = useState<UserFormData>(emptyForm);
  const [formError, setFormError] = useState("");

  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const { data, isLoading } = useUsers({
    page,
    limit: pageSize,
    role: roleFilter || undefined,
    search: search || undefined,
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const users = data?.data || [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeadingSkeleton />
        <FilterToolbarSkeleton blocks={1} />
        <DataTableSkeleton rows={8} cols={7} />
      </div>
    );
  }

  const handleSearch = (value: string) => {
    setSearchInput(value);

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer (300ms delay)
    debounceTimerRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setFormError("");
    setEditUser(null);
    setDialogOpen(true);
  };

  const openEdit = (user: UserRecord) => {
    if (user.role === "CITIZEN") {
      pushToast({
        id: `user-edit-blocked-${user.id}`,
        title: "Action Not Allowed",
        message: "Citizen user accounts cannot be edited by administrators.",
        type: "STATUS_CHANGE",
        variant: "warning",
        isRead: true,
        createdAt: new Date().toISOString(),
      });
      return;
    }

    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      role: user.role as Role,
      phone: user.phone || "",
    });
    setFormError("");
    setEditUser(user);
    setDialogOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    try {
      await createUser.mutateAsync({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role,
        phone: form.phone || undefined,
      });
      pushToast({
        id: `user-create-${Date.now()}`,
        title: "User Created",
        message: `User ${form.firstName} ${form.lastName} was created successfully.`,
        type: "STATUS_CHANGE",
        variant: "success",
        isRead: true,
        createdAt: new Date().toISOString(),
      });
      setDialogOpen(false);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error || "Failed to create user. Try again.";
      setFormError(errorMsg);
      pushToast({
        id: `user-create-err-${Date.now()}`,
        title: "Creation Failed",
        message: errorMsg,
        type: "STATUS_CHANGE",
        variant: "error",
        isRead: true,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    if (editUser.role === "CITIZEN") {
      setFormError("Citizen user accounts cannot be edited by administrators.");
      return;
    }
    setFormError("");

    if (!form.firstName || !form.lastName || !form.email) {
      setFormError("Please fill in all required fields.");
      return;
    }

    try {
      await updateUser.mutateAsync({
        id: editUser.id,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: editUser.role,
        phone: form.phone || undefined,
      });
      pushToast({
        id: `user-update-${editUser.id}-${Date.now()}`,
        title: "Changes Saved",
        message: `User details for ${form.firstName} ${form.lastName} were updated successfully.`,
        type: "STATUS_CHANGE",
        variant: "success",
        isRead: true,
        createdAt: new Date().toISOString(),
      });
      setDialogOpen(false);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.error || "Failed to update user. Try again.";
      setFormError(errorMsg);
      pushToast({
        id: `user-update-err-${editUser.id}-${Date.now()}`,
        title: "Save Failed",
        message: errorMsg,
        type: "STATUS_CHANGE",
        variant: "error",
        isRead: true,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const field = (
    label: string,
    key: keyof UserFormData,
    type = "text",
    required = false,
  ) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <Input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className={FIELD_CLASS}
      />
    </div>
  );

  const roleField = (roles: readonly Role[], disabled = false) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        Role <span className="text-red-500">*</span>
      </label>
      <Select
        value={form.role}
        disabled={disabled}
        onValueChange={(value) =>
          setForm((f) => ({ ...f, role: value as Role }))
        }
      >
        <SelectTrigger
          aria-label="Select role"
          className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
        >
          <div className="flex items-center gap-2 truncate">
            <span
              className={cn(
                "h-2 w-2 shrink-0 rounded-full",
                ROLE_DOT_COLORS[form.role],
              )}
            />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {roles.map((r) => (
            <SelectItem key={r} value={r}>
              <div className="flex items-center gap-2">
                <span
                  className={cn("h-2 w-2 shrink-0 rounded-full", ROLE_DOT_COLORS[r])}
                />
                <span>{ROLE_LABELS[r]}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  const formFooter = (
    onCancel: () => void,
    isPending: boolean,
    submitLabel: string,
    pendingLabel: string,
  ) => (
    <>
      {formError && (
        <p className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-300">
          {formError}
        </p>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl border-slate-200 dark:border-slate-700 dark:text-slate-300"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="rounded-xl font-semibold">
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </>
  );

  const closeDialog = () => setDialogOpen(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description={
          <>
            Manage admin, field worker, and citizen accounts.
            {pagination && (
              <>
                {" "}
                {pagination.total} total user{pagination.total !== 1 ? "s" : ""}.
              </>
            )}
          </>
        }
        actions={
          <Button onClick={openAdd} className="rounded-xl font-semibold">
            <Plus className="mr-1.5 h-4 w-4" />
            Add User
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/80 dark:border-slate-800 p-4 bg-slate-50/40 dark:bg-slate-950/40">
          <Select
            value={roleFilter || "all"}
            onValueChange={(value) => {
              setRoleFilter(value === "all" ? "" : value);
              setPage(1);
            }}
          >
            <SelectTrigger
              aria-label="Filter by role"
              className="w-[180px] rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition-all hover:bg-slate-50/80 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    roleFilter ? ROLE_DOT_COLORS[roleFilter] : "bg-slate-400",
                  )}
                />
                <SelectValue placeholder="All Roles" />
              </div>
            </SelectTrigger>
            <SelectContent className="w-[210px]">
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span>All Roles</span>
                </div>
              </SelectItem>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn("h-2 w-2 shrink-0 rounded-full", ROLE_DOT_COLORS[r])}
                    />
                    <span>{ROLE_LABELS[r]}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative min-w-[200px] max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search name or email..."
              aria-label="Search users"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-9 pr-3.5 text-sm text-slate-900 dark:text-slate-100 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {(roleFilter || search) && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 dark:border-slate-700"
              onClick={() => {
                setRoleFilter("");
                setSearch("");
                setSearchInput("");
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                <th className={TH_CLASS}>Name</th>
                <th className={TH_CLASS}>Email</th>
                <th className={TH_CLASS}>Role</th>
                <th className={TH_CLASS}>Phone</th>
                <th className={TH_CLASS}>Status</th>
                <th className={TH_CLASS}>Joined</th>
                <th className={TH_CLASS}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No users match the current filters.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                            ROLE_AVATAR_CLASSES[user.role] ?? ROLE_AVATAR_CLASSES.CITIZEN,
                          )}
                        >
                          {getInitials(user.firstName, user.lastName)}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          ROLE_BADGE_CLASSES[user.role] ?? ROLE_BADGE_CLASSES.CITIZEN,
                        )}
                      >
                        {ROLE_LABELS[user.role] ?? user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {user.phone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          user.isActive
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                            : "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300",
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            user.isActive ? "bg-emerald-500" : "bg-red-500",
                          )}
                        />
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {formatDateTime(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {user.role === "CITIZEN" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="cursor-not-allowed rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500 opacity-40"
                          title="Citizen accounts cannot be edited by administrators"
                        >
                          Edit
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="rounded-lg font-semibold"
                          onClick={() => openEdit(user)}
                        >
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-3">
            <PaginationControls
              currentPage={page}
              totalRecords={pagination.total}
              pageSize={pageSize}
              totalPages={pagination.totalPages}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
              itemName="users"
            />
          </div>
        )}
      </div>

      {/* Add / Edit User Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent
          overlayClassName="bg-black/40 backdrop-blur-sm"
          className="max-w-lg gap-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 shadow-2xl sm:rounded-2xl"
        >
          <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 px-6 pb-4 pt-6">
            <DialogTitle className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              {editUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription className="mt-1">
              {editUser
                ? "Update this account's details."
                : "Create a new admin or field worker account."}
            </DialogDescription>
          </div>

          <div className="px-6 py-5">
            {editUser?.role === "CITIZEN" ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-800 dark:text-amber-300">
                  <p className="font-semibold">Citizen Account Protected</p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                    Citizen accounts are private and managed directly by the citizen. Administrators cannot modify citizen personal details.
                  </p>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeDialog}
                    className="rounded-xl border-slate-200 dark:border-slate-700 dark:text-slate-300"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : editUser ? (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {field("First Name", "firstName", "text", true)}
                  {field("Last Name", "lastName", "text", true)}
                </div>
                {field("Email", "email", "email", true)}
                <div className="grid grid-cols-2 gap-4">
                  {roleField([editUser.role as Role], true)}
                  {field("Phone", "phone")}
                </div>
                {formFooter(closeDialog, updateUser.isPending, "Save Changes", "Saving...")}
              </form>
            ) : (
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {field("First Name", "firstName", "text", true)}
                  {field("Last Name", "lastName", "text", true)}
                </div>
                {field("Email", "email", "email", true)}
                {field("Password", "password", "password", true)}
                <div className="grid grid-cols-2 gap-4">
                  {roleField(ADD_ROLES)}
                  {field("Phone", "phone")}
                </div>
                {formFooter(closeDialog, createUser.isPending, "Create User", "Creating...")}
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
