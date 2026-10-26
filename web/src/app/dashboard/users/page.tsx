"use client";

import { useState, useEffect, useRef } from "react";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  UserRecord,
} from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/utils";
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
  CITIZEN: "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300",
};

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

export default function UsersPage() {
  const { pushToast } = useLiveNotifications();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
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
      <div>
        <div className="mb-6 flex items-center justify-between">
          <PageHeadingSkeleton withSubtitle={false} />
        </div>
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
    setShowAddModal(true);
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
      setShowAddModal(false);
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
      setEditUser(null);
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
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <Input
        type={type}
        value={form[key] as string}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full"
      />
    </div>
  );

  const isRoleLocked = Boolean(editUser);
  const editRoles = editUser ? ([editUser.role] as const) : ROLES;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">User Management</h1>
          {pagination && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
              {pagination.total} total user{pagination.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Button onClick={openAdd}>+ Add User</Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-400">
            Role
          </label>
          <select
            title="Filter by role"
            className="rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="" className="dark:bg-slate-900 dark:text-slate-200">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r} className="dark:bg-slate-900 dark:text-slate-200">
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-slate-400">
              Search
            </label>
            <Input
              placeholder="Name or email..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-56"
            />
          </div>
        </div>

        {(roleFilter || search) && (
          <Button
            variant="outline"
            size="sm"
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
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
          <thead className="bg-gray-50 dark:bg-slate-800/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Joined
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-gray-400 dark:text-slate-500"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-slate-200">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-sm text-gray-600 dark:text-slate-400">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE_CLASSES[user.role] ?? "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300"}`}
                    >
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">
                    {user.phone || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.isActive ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300" : "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300"}`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-slate-400">
                    {formatDateTime(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {user.role === "CITIZEN" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="cursor-not-allowed opacity-40 text-xs bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-400"
                          title="Citizen accounts cannot be edited by administrators"
                        >
                          Edit
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => openEdit(user)}>
                          Edit
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
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
          className="mt-4 bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-gray-200 dark:border-slate-800"
        />
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-lg bg-white dark:bg-slate-900 p-6 shadow-xl border border-gray-100 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-slate-100">
              Add New User
            </h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {field("First Name", "firstName", "text", true)}
                {field("Last Name", "lastName", "text", true)}
              </div>
              {field("Email", "email", "email", true)}
              {field("Password", "password", "password", true)}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    title="Select role"
                    className="w-full rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value as Role }))
                    }
                  >
                    {ADD_ROLES.map((r) => (
                      <option key={r} value={r} className="dark:bg-slate-900 dark:text-slate-200">
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>
                {field("Phone", "phone")}
              </div>

              {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditUser(null)}
        >
          <div
            className="w-full max-w-lg rounded-lg bg-white dark:bg-slate-900 p-6 shadow-xl border border-gray-100 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-slate-100">
              Edit User
            </h3>
            {editUser.role === "CITIZEN" ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-800 dark:text-amber-300">
                  <p className="font-semibold">Citizen Account Protected</p>
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                    Citizen accounts are private and managed directly by the citizen. Administrators cannot modify citizen personal details.
                  </p>
                </div>
                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditUser(null)}
                    className="dark:border-slate-700 dark:text-slate-300"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {field("First Name", "firstName", "text", true)}
                  {field("Last Name", "lastName", "text", true)}
                </div>
                {field("Email", "email", "email", true)}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      title="Select role"
                      className="w-full rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500"
                      value={form.role}
                      disabled={isRoleLocked}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, role: e.target.value as Role }))
                      }
                    >
                      {editRoles.map((r) => (
                        <option key={r} value={r} className="dark:bg-slate-900 dark:text-slate-200">
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  </div>
                  {field("Phone", "phone")}
                </div>

                {formError && <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>}

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditUser(null)}
                    className="dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateUser.isPending}>
                    {updateUser.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
