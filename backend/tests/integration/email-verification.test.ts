import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { prismaMock } from "../../src/__mocks__/prisma";

vi.mock("../../src/config/env", () => ({
  env: {
    JWT_SECRET: "unit-test-jwt-secret-with-more-than-32-characters",
    BREVO_API_KEY: "test-brevo-api-key",
    BREVO_SENDER_EMAIL: "noreply@example.test",
    BREVO_SENDER_NAME: "BlueWaste Test",
  },
}));

import { EmailVerificationError, EmailVerificationService } from "../../src/services/email-verification.service";

const user = { id: "user-otp-1", email: "citizen@example.test", firstName: "Citizen" };

function otpHash(code: string) {
  return createHmac("sha256", "unit-test-jwt-secret-with-more-than-32-characters")
    .update(`bluewaste-email-otp:${user.id}:${code}`)
    .digest("hex");
}

function pendingUser() {
  return {
    ...user,
    lastName: "Example",
    password: "hashed-password",
    role: "CITIZEN",
    phone: null,
    avatarUrl: null,
    address: "Panabo City",
    isActive: true,
    emailVerified: false,
    createdAt: new Date(),
  } as any;
}

describe("EmailVerificationService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 201 })));
    (prismaMock.$transaction as any).mockImplementation((callback: (tx: any) => unknown) => callback(prismaMock));
    prismaMock.$queryRaw.mockResolvedValue([] as never);
  });

  it("persists a hashed OTP and sends the code through Brevo", async () => {
    prismaMock.emailVerification.findUnique.mockResolvedValue(null);
    prismaMock.emailVerification.upsert.mockResolvedValue({} as any);

    await EmailVerificationService.issueCode(user, true);

    const fetchMock = vi.mocked(fetch);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect((options.headers as Record<string, string>)["api-key"]).toBe("test-brevo-api-key");
    const payload = JSON.parse(options.body as string);
    const code = payload.textContent.match(/code is (\d{6})/)[1];
    expect(payload.to[0].email).toBe(user.email);
    expect(prismaMock.emailVerification.upsert).toHaveBeenCalledWith(expect.objectContaining({
      create: expect.objectContaining({ userId: user.id, codeHash: otpHash(code), attempts: 0 }),
    }));
    expect(payload.textContent).toContain("expires in 10 minutes");
  });

  it("rejects resend requests during the 60-second cooldown", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...user, emailVerified: false } as any);
    prismaMock.emailVerification.findUnique.mockResolvedValue({
      userId: user.id,
      codeHash: otpHash("123456"),
      expiresAt: new Date(Date.now() + 600_000),
      lastSentAt: new Date(),
      attempts: 0,
    } as any);

    await expect(EmailVerificationService.resend(user.email)).rejects.toMatchObject<Partial<EmailVerificationError>>({
      statusCode: 429,
      code: "OTP_RESEND_COOLDOWN",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects incorrect OTPs and increments the attempt count", async () => {
    prismaMock.user.findUnique.mockResolvedValue(pendingUser());
    prismaMock.emailVerification.findUnique.mockResolvedValue({
      userId: user.id,
      codeHash: otpHash("123456"),
      expiresAt: new Date(Date.now() + 600_000),
      lastSentAt: new Date(),
      attempts: 0,
    } as any);

    await expect(EmailVerificationService.verify(user.email, "999999")).rejects.toMatchObject({
      statusCode: 400,
      code: "INVALID_OTP",
    });
    expect(prismaMock.emailVerification.update).toHaveBeenCalledWith({
      where: { userId: user.id }, data: { attempts: 1 },
    });
  });

  it("expires old OTPs and deletes the expired challenge", async () => {
    prismaMock.user.findUnique.mockResolvedValue(pendingUser());
    prismaMock.emailVerification.findUnique.mockResolvedValue({
      userId: user.id,
      codeHash: otpHash("123456"),
      expiresAt: new Date(Date.now() - 1),
      lastSentAt: new Date(Date.now() - 600_000),
      attempts: 0,
    } as any);

    await expect(EmailVerificationService.verify(user.email, "123456")).rejects.toMatchObject({
      statusCode: 410,
      code: "OTP_EXPIRED",
    });
    expect(prismaMock.emailVerification.delete).toHaveBeenCalledWith({ where: { userId: user.id } });
  });

  it("marks the user verified and consumes a correct OTP", async () => {
    prismaMock.user.findUnique.mockResolvedValue(pendingUser());
    prismaMock.emailVerification.findUnique.mockResolvedValue({
      userId: user.id,
      codeHash: otpHash("123456"),
      expiresAt: new Date(Date.now() + 600_000),
      lastSentAt: new Date(),
      attempts: 0,
    } as any);

    const verified = await EmailVerificationService.verify(user.email, "123456");

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: user.id }, data: { emailVerified: true },
    });
    expect(prismaMock.emailVerification.delete).toHaveBeenCalledWith({ where: { userId: user.id } });
    expect(verified).not.toHaveProperty("password");
    expect(verified).not.toHaveProperty("emailVerified");
  });
});
