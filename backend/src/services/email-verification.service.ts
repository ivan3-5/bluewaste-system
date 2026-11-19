import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import prisma from "../config/database";
import { env } from "../config/env";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

export class EmailVerificationError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "EmailVerificationError";
  }
}

function hashOtp(userId: string, code: string) {
  return createHmac("sha256", env.JWT_SECRET)
    .update(`bluewaste-email-otp:${userId}:${code}`)
    .digest("hex");
}

async function sendViaBrevo(email: string, firstName: string, code: string) {
  if (!env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL) {
    throw new EmailVerificationError(
      "Email verification is unavailable. Contact the administrator.",
      503,
      "EMAIL_PROVIDER_NOT_CONFIGURED",
    );
  }

  let response: Response;
  try {
    response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { email: env.BREVO_SENDER_EMAIL, name: env.BREVO_SENDER_NAME },
        to: [{ email, name: firstName }],
        subject: "Verify your BlueWaste email",
        textContent: `Your BlueWaste verification code is ${code}. It expires in 10 minutes. If you did not create this account, you can ignore this email.`,
        htmlContent: `<main style="font-family:Arial,sans-serif;color:#0f172a"><h2>Verify your BlueWaste email</h2><p>Hello ${escapeHtml(firstName)},</p><p>Enter this code in BlueWaste to verify your email address:</p><p style="font-size:32px;font-weight:700;letter-spacing:8px">${code}</p><p>This code expires in 10 minutes. If you did not create this account, you can ignore this email.</p></main>`,
      }),
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    throw new EmailVerificationError(
      "Email delivery is temporarily unavailable. Please try again shortly.",
      503,
      "EMAIL_DELIVERY_FAILED",
    );
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Brevo email delivery failed", response.status, detail.slice(0, 500));
    throw new EmailVerificationError(
      "We could not send the verification email. Please try again shortly.",
      503,
      "EMAIL_DELIVERY_FAILED",
    );
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

export class EmailVerificationService {
  static readonly resendCooldownSeconds = RESEND_COOLDOWN_MS / 1000;

  static async issueCode(user: { id: string; email: string; firstName: string }, allowImmediate = false) {
    const now = new Date();
    const code = randomInt(100_000, 1_000_000).toString();

    await prisma.$transaction(async (tx) => {
      // Locking the user serializes first sends too, when no OTP row exists yet.
      await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id} FOR UPDATE`;
      const current = await tx.emailVerification.findUnique({ where: { userId: user.id } });
      if (!allowImmediate && current) {
        const secondsLeft = Math.ceil(
          (current.lastSentAt.getTime() + RESEND_COOLDOWN_MS - now.getTime()) / 1000,
        );
        if (secondsLeft > 0) {
          throw new EmailVerificationError(
            `Please wait ${secondsLeft} seconds before requesting another code.`,
            429,
            "OTP_RESEND_COOLDOWN",
            secondsLeft,
          );
        }
      }

      await tx.emailVerification.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          codeHash: hashOtp(user.id, code),
          expiresAt: new Date(now.getTime() + OTP_TTL_MS),
          lastSentAt: now,
          attempts: 0,
        },
        update: {
          codeHash: hashOtp(user.id, code),
          expiresAt: new Date(now.getTime() + OTP_TTL_MS),
          lastSentAt: now,
          attempts: 0,
        },
      });
    });

    await sendViaBrevo(user.email, user.firstName, code);
  }

  static async resend(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true, emailVerified: true },
    });
    // Do not disclose whether an address is registered or already verified.
    if (!user || user.emailVerified) {
      return { accepted: true, retryAfterSeconds: 0 };
    }

    await this.issueCode(user);
    return { accepted: true, retryAfterSeconds: RESEND_COOLDOWN_MS / 1000 };
  }

  static async verify(email: string, code: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        address: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    if (!user || !user.isActive) {
      throw new EmailVerificationError("Invalid or expired verification code.", 400, "INVALID_OTP");
    }
    if (user.emailVerified) {
      throw new EmailVerificationError("This email address is already verified.", 409, "EMAIL_ALREADY_VERIFIED");
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${user.id} FOR UPDATE`;
      const challenge = await tx.emailVerification.findUnique({ where: { userId: user.id } });
      if (!challenge) return "invalid" as const;
      if (challenge.expiresAt.getTime() <= Date.now()) {
        await tx.emailVerification.delete({ where: { userId: user.id } });
        return "expired" as const;
      }
      if (challenge.attempts >= MAX_ATTEMPTS) {
        await tx.emailVerification.delete({ where: { userId: user.id } });
        return "locked" as const;
      }

      const expected = Buffer.from(challenge.codeHash, "hex");
      const actual = Buffer.from(hashOtp(user.id, code), "hex");
      if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
        const attempts = challenge.attempts + 1;
        if (attempts >= MAX_ATTEMPTS) {
          await tx.emailVerification.delete({ where: { userId: user.id } });
          return "locked" as const;
        }
        await tx.emailVerification.update({
          where: { userId: user.id },
          data: { attempts },
        });
        return "invalid" as const;
      }

      await tx.user.update({ where: { id: user.id }, data: { emailVerified: true } });
      await tx.emailVerification.delete({ where: { userId: user.id } });
      return "verified" as const;
    });

    if (result === "expired") {
      throw new EmailVerificationError("This verification code has expired. Request a new code.", 410, "OTP_EXPIRED");
    }
    if (result === "locked") {
      throw new EmailVerificationError("Too many incorrect codes. Request a new code.", 429, "OTP_ATTEMPTS_EXCEEDED");
    }
    if (result !== "verified") {
      throw new EmailVerificationError("Invalid or expired verification code.", 400, "INVALID_OTP");
    }

    const { password: _password, emailVerified: _emailVerified, isActive: _isActive, ...publicUser } = user;
    return publicUser;
  }
}
