import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../src/__mocks__/prisma";
import activityLogRoutes from "../../src/routes/activity-log.routes";
import authRoutes from "../../src/routes/auth.routes";
import reportRoutes from "../../src/routes/report.routes";
import userRoutes from "../../src/routes/user.routes";
import { ActivityLogService, sanitizeMetadata } from "../../src/services/activity-log.service";
import { hashPassword } from "../../src/utils/password";

const { testSecret } = vi.hoisted(() => ({
  testSecret: "activity-log-test-secret",
}));

vi.mock("../../src/config/env", () => ({
  env: {
    JWT_SECRET: testSecret,
    JWT_EXPIRES_IN: "15m",
    REFRESH_TOKEN_SECRET: "activity-log-refresh-secret",
    NODE_ENV: "test",
    SPAM_RETENTION_DAYS: 30,
  },
}));

const app = express();
app.use(express.json());
app.use("/api/v1/activity-logs", activityLogRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/users", userRoutes);

const adminId = "00000000-0000-4000-8000-000000000001";
const workerId = "00000000-0000-4000-8000-000000000002";
const citizenId = "00000000-0000-4000-8000-000000000003";
const reportId = "00000000-0000-4000-8000-000000000010";

const makeToken = (userId: string) =>
  `Bearer ${jwt.sign({ userId }, testSecret)}`;

const usersById: Record<string, any> = {
  [adminId]: {
    id: adminId,
    email: "admin@bluewaste.test",
    firstName: "Ana",
    lastName: "Admin",
    role: "LGU_ADMIN",
    isActive: true,
    emailVerified: true,
  },
  [workerId]: {
    id: workerId,
    email: "worker@bluewaste.test",
    firstName: "Wally",
    lastName: "Worker",
    role: "FIELD_WORKER",
    isActive: true,
    emailVerified: true,
  },
  [citizenId]: {
    id: citizenId,
    email: "citizen@bluewaste.test",
    firstName: "Cora",
    lastName: "Citizen",
    role: "CITIZEN",
    isActive: true,
    emailVerified: true,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.user.findUnique.mockImplementation(
    (async ({ where }: { where: { id?: string } }) =>
      where.id ? (usersById[where.id] ?? null) : null) as never,
  );
});

describe("Activity Log Feature", () => {
  describe("Authorization and Immutability", () => {
    it("rejects unauthenticated and non-admin access to activity logs", async () => {
      await request(app).get("/api/v1/activity-logs").expect(401);
      await request(app)
        .get("/api/v1/activity-logs")
        .set("Authorization", makeToken(citizenId))
        .expect(403);
      await request(app)
        .get("/api/v1/activity-logs")
        .set("Authorization", makeToken(workerId))
        .expect(403);
      await request(app)
        .get("/api/v1/activity-logs/filters")
        .set("Authorization", makeToken(citizenId))
        .expect(403);
    });

    it("does not expose endpoints to create, modify, or delete activity logs", async () => {
      const adminToken = makeToken(adminId);
      await request(app)
        .post("/api/v1/activity-logs")
        .set("Authorization", adminToken)
        .send({ action: "FAKE" })
        .expect(404);
      await request(app)
        .put(`/api/v1/activity-logs/${adminId}`)
        .set("Authorization", adminToken)
        .send({ description: "tampered" })
        .expect(404);
      await request(app)
        .delete(`/api/v1/activity-logs/${adminId}`)
        .set("Authorization", adminToken)
        .expect(404);
    });
  });

  describe("Query Validation, Filtering, Search, and Pagination", () => {
    it("validates query parameters and rejects malformed filters", async () => {
      const adminToken = makeToken(adminId);
      await request(app)
        .get("/api/v1/activity-logs?limit=101")
        .set("Authorization", adminToken)
        .expect(400);
      await request(app)
        .get("/api/v1/activity-logs?userId=not-a-uuid")
        .set("Authorization", adminToken)
        .expect(400);
      await request(app)
        .get("/api/v1/activity-logs?category=UNKNOWN")
        .set("Authorization", adminToken)
        .expect(400);
      await request(app)
        .get("/api/v1/activity-logs?startDate=invalid-date")
        .set("Authorization", adminToken)
        .expect(400);
      await request(app)
        .get("/api/v1/activity-logs?action=invalid-action!")
        .set("Authorization", adminToken)
        .expect(400);
    });

    it("queries paginated activity logs with search, role, category, and date range filters", async () => {
      const logEntry = {
        id: "log-1",
        userId: adminId,
        userName: "Ana Admin",
        userRole: "LGU_ADMIN",
        action: "REPORT_VERIFIED",
        category: "REPORT",
        description: 'Verified waste report "Coastal plastic"',
        entityType: "Report",
        entityId: reportId,
        metadata: { newStatus: "VERIFIED" },
        createdAt: new Date("2026-11-26T10:00:00.000Z"),
        user: {
          id: adminId,
          firstName: "Ana",
          lastName: "Admin",
          email: "admin@bluewaste.test",
          role: "LGU_ADMIN",
          avatarUrl: null,
        },
      };

      prismaMock.activityLog.count.mockResolvedValue(25);
      prismaMock.activityLog.findMany.mockResolvedValue([logEntry] as never);

      const res = await request(app)
        .get(
          `/api/v1/activity-logs?page=2&limit=10&search=%20plastic%20&userId=${adminId}&userRole=LGU_ADMIN&category=REPORT&action=REPORT_VERIFIED&startDate=2026-11-01&endDate=2026-11-30`,
        )
        .set("Authorization", makeToken(adminId))
        .expect(200);

      expect(res.headers["cache-control"]).toBe("private, no-store");
      expect(res.body.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
      expect(res.body.data).toHaveLength(1);
      expect(prismaMock.activityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: adminId,
            userRole: "LGU_ADMIN",
            category: "REPORT",
            action: "REPORT_VERIFIED",
            createdAt: {
              gte: new Date("2026-11-01T00:00:00.000Z"),
              lte: new Date("2026-11-30T23:59:59.999Z"),
            },
            OR: expect.arrayContaining([
              { description: { contains: "plastic", mode: "insensitive" } },
            ]),
          }),
          skip: 10,
          take: 10,
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        }),
      );
    });
  });

  describe("Data Integrity & Sensitive Data Sanitization", () => {
    it("strips passwords, tokens, OTPs, and secrets from metadata", async () => {
      const cleaned = sanitizeMetadata({
        channel: "web",
        password: "super-secret-password",
        refreshToken: "jwt-refresh-token",
        nested: {
          accessToken: "secret-access-token",
          otp: "123456",
          safeField: "ok",
        },
      });

      expect(cleaned).toEqual({
        channel: "web",
        nested: {
          safeField: "ok",
        },
      });

      prismaMock.activityLog.create.mockResolvedValue({ id: "log-safe" } as never);
      await ActivityLogService.log({
        userId: adminId,
        userName: "Ana Admin",
        userRole: "LGU_ADMIN",
        action: "USER_CREATED",
        category: "USER",
        description: "Created user",
        metadata: {
          password: "secret",
          token: "secret-token",
          targetRole: "FIELD_WORKER",
        },
      });

      expect(prismaMock.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: { targetRole: "FIELD_WORKER" },
        }),
      });
    });

    it("swallows database errors during logging so primary operations are not broken", async () => {
      prismaMock.activityLog.create.mockRejectedValue(new Error("DB offline"));
      await expect(
        ActivityLogService.log({
          userId: adminId,
          userName: "Ana Admin",
          userRole: "LGU_ADMIN",
          action: "USER_LOGIN",
          category: "AUTH",
          description: "Logged in",
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe("Server-Side Activity Recording Integration", () => {
    it("records USER_LOGIN on successful login and does not record on failed login", async () => {
      const hashedPassword = await hashPassword("Password123!");
      prismaMock.user.findFirst.mockResolvedValue({
        ...usersById[citizenId],
        password: hashedPassword,
        phone: null,
        avatarUrl: null,
        address: "",
        createdAt: new Date(),
      } as never);
      prismaMock.activityLog.create.mockResolvedValue({ id: "log-login" } as never);

      await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "citizen@bluewaste.test", password: "WrongPassword!" })
        .expect(401);

      expect(prismaMock.activityLog.create).not.toHaveBeenCalled();

      await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "citizen@bluewaste.test", password: "Password123!" })
        .expect(200);

      expect(prismaMock.activityLog.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: citizenId,
          userName: "Cora Citizen",
          userRole: "CITIZEN",
          action: "USER_LOGIN",
          category: "AUTH",
          entityType: "User",
          entityId: citizenId,
        }),
      });
    });

    it("records REPORT_VERIFIED on success and does not record when report is missing", async () => {
      prismaMock.report.findFirst.mockResolvedValueOnce(null);

      await request(app)
        .put(`/api/v1/reports/${reportId}/status`)
        .set("Authorization", makeToken(adminId))
        .send({ status: "VERIFIED" })
        .expect(404);

      expect(prismaMock.activityLog.create).not.toHaveBeenCalled();

      const existingReport = {
        id: reportId,
        title: "Plastic pile at beach",
        status: "PENDING",
        reporterId: null,
        address: "Panabo Coast",
        isAnonymous: false,
      };
      prismaMock.report.findFirst.mockResolvedValueOnce(existingReport as never);
      prismaMock.$transaction.mockResolvedValueOnce([
        { ...existingReport, status: "VERIFIED" },
        { id: "sh-1" },
      ] as never);
      prismaMock.report.findUnique.mockResolvedValueOnce({
        incidentId: null,
        cleanupScheduleId: null,
      } as never);
      prismaMock.report.findMany.mockResolvedValueOnce([] as never);
      prismaMock.activityLog.create.mockResolvedValueOnce({ id: "log-verify" } as never);

      await request(app)
        .put(`/api/v1/reports/${reportId}/status`)
        .set("Authorization", makeToken(adminId))
        .send({ status: "VERIFIED", notes: "Confirmed by admin" })
        .expect(200);

      expect(prismaMock.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: adminId,
          userName: "Ana Admin",
          userRole: "LGU_ADMIN",
          action: "REPORT_VERIFIED",
          category: "REPORT",
          entityType: "Report",
          entityId: reportId,
        }),
      });
    });

    it("records USER_ACTIVATED and USER_DEACTIVATED on admin user updates", async () => {
      prismaMock.user.update.mockResolvedValue({
        ...usersById[workerId],
        isActive: false,
      } as never);
      prismaMock.activityLog.create.mockResolvedValue({ id: "log-user" } as never);

      await request(app)
        .put(`/api/v1/users/${workerId}`)
        .set("Authorization", makeToken(adminId))
        .send({ isActive: false })
        .expect(200);

      expect(prismaMock.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: adminId,
          action: "USER_DEACTIVATED",
          category: "USER",
          entityType: "User",
          entityId: workerId,
        }),
      });
    });
  });
});
