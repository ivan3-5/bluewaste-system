import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().email("Invalid email address").transform((email) => email.toLowerCase()),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  phone: z.string().trim().regex(/^[0-9]{0,11}$/, "Phone number must contain up to 11 digits.").optional(),
  address: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").transform((email) => email.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().email("Invalid email address").transform((email) => email.toLowerCase()),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});

export const resendVerificationSchema = z.object({
  email: z.string().trim().email("Invalid email address").transform((email) => email.toLowerCase()),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  address: z.string().nullable().optional(),
});
