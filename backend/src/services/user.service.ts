import prisma from "../config/database";
import { Role, Prisma } from "@prisma/client";
import { getPaginationParams, buildPaginatedResponse } from "../utils/pagination";
import { hashPassword } from "../utils/password";
import { QueryFilters } from "../utils/http";

export class UserService {
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
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          isActive: true,
          createdAt: true,
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
  }) {
    const { email, password, firstName, lastName, role, phone } = data;

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
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
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
      isActive?: boolean;
    },
  ) {
    const { firstName, lastName, email, role, phone, isActive } = data;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error("User not found");
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
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
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
