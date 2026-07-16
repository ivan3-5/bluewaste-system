import prisma from "../config/database";
import { hashPassword, comparePassword } from "../utils/password";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { Role } from "@prisma/client";

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address || "",
        role: Role.CITIZEN,
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
        createdAt: true,
      },
    });

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    return { user, token, refreshToken };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always run bcrypt compare to prevent timing-based email enumeration.
    // Without this, a missing user returns instantly while a valid user takes
    // ~100ms for bcrypt — leaking which emails are registered.
    const isValid = user ? await comparePassword(password, user.password) : false;
    if (!user || !user.isActive || !isValid) {
      throw new Error("Invalid email or password");
    }

    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Verify a refresh token and issue a new short-lived access token.
   * The refresh token itself is not rotated here — rotation can be added
   * later when a `RefreshToken` table is introduced.
   */
  static async refreshAccessToken(refreshToken: string) {
    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new Error("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new Error("Invalid or expired refresh token");
    }

    return { token: generateToken(user.id) };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  static async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      avatarUrl?: string | null;
      address?: string | null;
    },
  ) {
    const updateData = {
      ...data,
      address: data.address === null ? "" : data.address,
    };

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }
}
