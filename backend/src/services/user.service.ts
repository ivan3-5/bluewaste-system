import prisma from "../config/database";
import { Role, Prisma } from "@prisma/client";
import { getPaginationParams, buildPaginatedResponse } from "../utils/pagination";
import { hashPassword } from "../utils/password";
import { QueryFilters } from "../utils/http";
import type { UserReportHistoryQuery, UserScheduleHistoryQuery } from "../validators/user.validator";

const userProfileSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  phone: true,
  avatarUrl: true,
  address: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export class UserService {
  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: userProfileSelect,
    });
    if (!user) throw new Error("User not found");
    return user;
  }

  static async getReportHistory(id: string, query: UserReportHistoryQuery) {
    await this.getUserById(id);
    const { search, status, sort, page, limit } = query;
    const where: Prisma.ReportWhereInput = {
      reporterId: id,
      // A named history would reveal the identity behind an anonymous submission.
      isAnonymous: false,
      status,
      ...(search && {
        OR: [
          { id: { startsWith: search, mode: "insensitive" } },
          { title: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } },
        ],
      }),
    };
    const total = await prisma.report.count({ where });
    const currentPage = Math.min(page, Math.max(1, Math.ceil(total / limit)));
    const reports = await prisma.report.findMany({
      where,
      select: {
        id: true, title: true, address: true, latitude: true, longitude: true,
        status: true, severity: true, createdAt: true, isSpam: true, isDeleted: true,
      },
      orderBy: [{ createdAt: sort }, { id: sort }],
      skip: (currentPage - 1) * limit,
      take: limit,
    });
    return buildPaginatedResponse(reports, total, { page: currentPage, limit });
  }

  static async getScheduleHistory(id: string, query: UserScheduleHistoryQuery) {
    const user = await this.getUserById(id);
    const { search, status, sort, page, limit } = query;
    if (user.role !== Role.FIELD_WORKER) {
      return buildPaginatedResponse([], 0, { page: 1, limit });
    }

    const where: Prisma.CleanupScheduleWorkerWhereInput = {
      workerId: id,
      schedule: {
        status,
        ...(search && {
          OR: [
            { id: { startsWith: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
            { barangay: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
    };
    const linkedReports = { isDeleted: false };
    const total = await prisma.cleanupScheduleWorker.count({ where });
    const currentPage = Math.min(page, Math.max(1, Math.ceil(total / limit)));
    const assignments = await prisma.cleanupScheduleWorker.findMany({
      where,
      select: {
        assignedAt: true,
        schedule: {
          select: {
            id: true, title: true, barangay: true, scheduledAt: true, status: true,
            reports: {
              where: linkedReports,
              orderBy: [{ createdAt: "desc" }, { id: "desc" }],
              take: 3,
              select: { id: true, title: true },
            },
            _count: { select: { reports: { where: linkedReports } } },
          },
        },
      },
      orderBy: [{ schedule: { scheduledAt: sort } }, { scheduleId: sort }],
      skip: (currentPage - 1) * limit,
      take: limit,
    });
    return buildPaginatedResponse(assignments, total, { page: currentPage, limit });
  }

  static async getFieldWorkers() {
    return prisma.user.findMany({
      where: { role: Role.FIELD_WORKER, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        _count: { select: { assignedReports: true } },
      },
      orderBy: { firstName: "asc" },
    });
  }

  static async getAllUsers(query: QueryFilters | Record<string, unknown>) {
    const pagination = getPaginationParams(query);
    const roleFilter = typeof query.role === "string" ? query.role : undefined;
    const search = typeof query.search === "string" ? query.search : undefined;

    const where: Prisma.UserWhereInput = {};
    if (roleFilter) {
      const normalizedRole = roleFilter.toUpperCase() as Role;
      if (!Object.values(Role).includes(normalizedRole)) {
        throw new Error("Invalid role");
      }
      where.role = normalizedRole;
    }
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          ...userProfileSelect,
          _count: { select: { reports: true, assignedReports: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.user.count({ where }),
    ]);

    return buildPaginatedResponse(users, total, pagination);
  }

  static async createUser(data: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    phone?: string;
    address?: string;
  }) {
    const { email, password, firstName, lastName, role, phone, address } = data;

    if (!email || !password || !firstName || !lastName || !role) {
      throw new Error("Missing required fields");
    }

    if (!Object.values(Role).includes(role as Role)) {
      throw new Error("Invalid role");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await hashPassword(password);

    return prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role as Role,
        phone: phone || null,
        address: address || "",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        address: true,
        isActive: true,
        createdAt: true,
        _count: { select: { reports: true, assignedReports: true } },
      },
    });
  }

  static async updateUser(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: string;
      phone?: string;
      address?: string;
      isActive?: boolean;
      avatarUrl?: string;
    },
    requestingUserId?: string,
  ) {
    const { firstName, lastName, email, role, phone, address, isActive, avatarUrl } = data;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("User not found");
    }

    if (existing.role === Role.CITIZEN && (!requestingUserId || requestingUserId !== id)) {
      throw new Error("Citizen user accounts cannot be edited by administrators.");
    }

    if (role && !Object.values(Role).includes(role as Role)) {
      throw new Error("Invalid role");
    }

    if (email && email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        throw new Error("Email already in use");
      }
    }

    return prisma.user.update({
      where: { id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role: role as Role }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(isActive !== undefined && { isActive }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        address: true,
        isActive: true,
        createdAt: true,
        _count: { select: { reports: true, assignedReports: true } },
      },
    });
  }

  static async deleteUser(id: string, requestingUserId?: string) {
    if (id === requestingUserId) {
      throw new Error("Cannot delete your own account");
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("User not found");
    }

    if (!existing.isActive) {
      return { message: "User already deactivated", alreadyDeactivated: true };
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: "User deactivated successfully", alreadyDeactivated: false };
  }
}
