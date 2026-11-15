import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../src/__mocks__/prisma";
import userRoutes from "../../src/routes/user.routes";

const { testSecret } = vi.hoisted(() => ({ testSecret: "user-history-test-secret" }));
vi.mock("../../src/config/env", () => ({ env: { JWT_SECRET: testSecret } }));

const app = express();
app.use("/api/users", userRoutes);

const userId = "00000000-0000-4000-8000-000000000001";
const path = `/api/users/${userId}`;
const profile = {
  id: userId,
  firstName: "Casey",
  lastName: "Santos",
  email: "casey@example.test",
  role: "FIELD_WORKER" as const,
  isActive: false,
};
const token = (role: "LGU_ADMIN" | "FIELD_WORKER" | "CITIZEN") =>
  `Bearer ${jwt.sign({ userId: role }, testSecret)}`;
const admin = token("LGU_ADMIN");

beforeEach(() => {
  prismaMock.user.findUnique.mockImplementation(async ({ where }) => {
    if (where.id === userId) return profile as never;
    return { ...profile, id: where.id, role: where.id, isActive: true } as never;
  });
});

describe("Admin user history", () => {
  it.each(["", "/reports", "/schedules"])("requires an authenticated admin for %s", async (suffix) => {
    await request(app).get(path + suffix).expect(401);
    await request(app).get(path + suffix).set("Authorization", token("FIELD_WORKER")).expect(403);
    await request(app).get(path + suffix).set("Authorization", token("CITIZEN")).expect(403);
  });

  it("returns profile details for inactive accounts without selecting credentials", async () => {
    const res = await request(app).get(path).set("Authorization", admin).expect(200);
    expect(res.body).toEqual(profile);
    expect(res.headers["cache-control"]).toBe("private, no-store");
    const lookup = prismaMock.user.findUnique.mock.calls.find(([args]) => args.where.id === userId);
    expect(lookup?.[0].select).not.toHaveProperty("password");
  });

  it("reports invalid queries and missing users", async () => {
    await request(app).get(path + "/reports?status=UNKNOWN").set("Authorization", admin).expect(400);
    await request(app).get(path + "/schedules?limit=101").set("Authorization", admin).expect(400);
    await request(app).get("/api/users/invalid").set("Authorization", admin).expect(400);
    prismaMock.user.findUnique.mockResolvedValue(null);
    await request(app).get(path + "/reports").set("Authorization", admin).expect(404);
    expect(prismaMock.report.findMany).not.toHaveBeenCalled();
  });

  it("paginates the selected user's attributable reports without exposing anonymous submissions", async () => {
    prismaMock.report.count.mockResolvedValue(24);
    const report = { id: "report-id", title: "Canal report", isDeleted: true };
    prismaMock.report.findMany.mockResolvedValue([report] as never);
    const res = await request(app)
      .get(path + "/reports?page=2&limit=10&search=%20canal%20&status=CLEANED&sort=asc")
      .set("Authorization", admin)
      .expect(200);

    const where = {
      reporterId: userId,
      isAnonymous: false,
      status: "CLEANED",
      OR: expect.arrayContaining([{ title: { contains: "canal", mode: "insensitive" } }]),
    };
    expect(prismaMock.report.count).toHaveBeenCalledWith({ where });
    expect(prismaMock.report.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where, skip: 10, take: 10, orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    }));
    expect(res.body).toEqual({
      data: [report], pagination: { page: 2, limit: 10, total: 24, totalPages: 3 },
    });
  });

  it("looks up historical schedules through the worker assignment and returns linked report IDs", async () => {
    prismaMock.cleanupScheduleWorker.count.mockResolvedValue(1);
    const assignment = {
      assignedAt: "2026-11-01T07:00:00Z",
      schedule: {
        id: "schedule-id",
        status: "CANCELLED",
        reports: [{ id: "report-id", title: "Canal report" }],
      },
    };
    prismaMock.cleanupScheduleWorker.findMany.mockResolvedValue([assignment] as never);
    const res = await request(app)
      .get(path + "/schedules?page=9&status=CANCELLED")
      .set("Authorization", admin)
      .expect(200);

    const where = { workerId: userId, schedule: { status: "CANCELLED" } };
    expect(prismaMock.cleanupScheduleWorker.count).toHaveBeenCalledWith({ where });
    expect(prismaMock.cleanupScheduleWorker.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where,
      skip: 0,
      orderBy: [{ schedule: { scheduledAt: "desc" } }, { scheduleId: "desc" }],
      select: expect.objectContaining({ assignedAt: true }),
    }));
    expect(res.body.data).toEqual([assignment]);
    expect(res.body.pagination.page).toBe(1);
  });

  it("does not look up schedules for a citizen profile", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...profile, role: "CITIZEN" } as never);
    const res = await request(app).get(path + "/schedules").set("Authorization", admin).expect(200);
    expect(res.body.pagination.total).toBe(0);
    expect(prismaMock.cleanupScheduleWorker.count).not.toHaveBeenCalled();
  });
});
