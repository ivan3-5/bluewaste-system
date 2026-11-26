import prisma from "../config/database";
import { hashPassword, comparePassword } from "../utils/password";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { Role } from "@prisma/client";
import { EmailVerificationError, EmailVerificationService } from "./email-verification.service";
import { createWebSession } from "./web-session.service";

export class AuthService {
  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
  }) {
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: data.email, mode: "insensitive" } },
    });
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const hashedPassword = await hashPassword(data.password);

    let user;
    try {
      user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          address: data.address || "",
          role: Role.CITIZEN,
          emailVerified: false,
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
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        throw new Error("Email already registered");
      }
      throw error;
    }

    await EmailVerificationService.issueCode(user, true);
    return { user, verificationRequired: true };
  }

  static async login(email: string, password: string, web = false) {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    // Always run bcrypt compare to prevent timing-based email enumeration.
    // Without this, a missing user returns instantly while a valid user takes
    // ~100ms for bcrypt — leaking which emails are registered.
    const isValid = user ? await comparePassword(password, user.password) : false;
    if (!user || !user.isActive || !isValid) {
      throw new Error("Invalid email or password");
    }
    if (!user.emailVerified) {
      throw new EmailVerificationError(
        "Please verify your email address before logging in.",
        403,
        "EMAIL_NOT_VERIFIED",
      );
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        address: user.address,
        createdAt: user.createdAt,
      },
      ...(web ? await createWebSession(user.id) : {
        token: generateToken(user.id),
        refreshToken: generateRefreshToken(user.id),
      }),
    };
  }

  static async verifyEmail(email: string, code: string, web = false) {
    const user = await EmailVerificationService.verify(email, code);
    return {
      user,
      ...(web ? await createWebSession(user.id) : {
        token: generateToken(user.id),
        refreshToken: generateRefreshToken(user.id),
      }),
    };
  }

  static async resendVerification(email: string) {
    return EmailVerificationService.resend(email);
  }

  static async refreshAccessToken(refreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new Error("Invalid or expired refresh token");
    }
    if (payload.sessionId) throw new Error("Invalid refresh token");

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true, emailVerified: true },
    });

    if (!user || !user.isActive || !user.emailVerified) {
      throw new Error("Invalid or expired refresh token");
    }

    return {
      token: generateToken(user.id),
      refreshToken: generateRefreshToken(user.id),
    };
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
