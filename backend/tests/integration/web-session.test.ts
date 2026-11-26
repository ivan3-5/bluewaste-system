import type { WebSession } from "@prisma/client";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { prismaMock } from "../../src/__mocks__/prisma";
import { app } from "../../src/index";
import { generateRefreshToken, generateToken } from "../../src/utils/jwt";

vi.mock("../../src/middleware/rateLimiter", () => {
  const pass = (_req: unknown, _res: unknown, next: () => void) => next();
  return { generalLimiter: pass, authLimiter: pass, uploadLimiter: pass };
});

const minute = 60_000;
const startedAt = Date.UTC(2026, 10, 26, 12);
const userId = "web-session-user";
const webAuth = "/api/v1/auth/web";

describe("Web session idle expiry", () => {
  let sessions: Map<string, WebSession>;

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(startedAt);
    const bcrypt = await import("bcryptjs");
    const password = await bcrypt.hash("test-password", 4);
    sessions = new Map(
      ["first", "second"].map((id) => [
        id,
        { id, userId, expiresAt: new Date(startedAt + 15 * minute) },
      ]),
    );

    const user = {
      id: userId, email: "citizen@example.com", firstName: "Citizen", lastName: "User",
      password, address: "", phone: null, avatarUrl: null, role: "CITIZEN" as const,
      isActive: true, emailVerified: true, createdAt: new Date(), updatedAt: new Date(),
    };
    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.user.findFirst.mockResolvedValue(user);
    prismaMock.webSession.findFirst.mockImplementation(async ({ where } = {}) => {
      const session = sessions.get(String(where?.id));
      const filter = where?.expiresAt;
      const cutoff = typeof filter === "object" && "gt" in filter ? Number(filter.gt) : Infinity;
      if (!session || session.userId !== where?.userId || session.expiresAt.getTime() <= cutoff) return null;
      return { ...session };
    });
    prismaMock.webSession.updateMany.mockImplementation(async ({ where, data }) => {
      const session = sessions.get(String(where?.id));
      const filter = where?.expiresAt;
      if (!session || session.userId !== where?.userId || typeof filter !== "object" ||
        !("gt" in filter) || !("lt" in filter) || !(data.expiresAt instanceof Date) ||
        session.expiresAt.getTime() <= Number(filter.gt) ||
        session.expiresAt.getTime() >= Number(filter.lt)) {
        return { count: 0 };
      }
      sessions.set(session.id, { ...session, expiresAt: data.expiresAt });
      return { count: 1 };
    });
    prismaMock.webSession.deleteMany.mockImplementation(async ({ where } = {}) => {
      const session = sessions.get(String(where?.id));
      return { count: session?.userId === where?.userId && session && sessions.delete(session.id) ? 1 : 0 };
    });
    prismaMock.webSession.create.mockImplementation(async ({ data }) => {
      const session = { id: "new", userId: String(data.userId), expiresAt: new Date(String(data.expiresAt)) };
      sessions.set(session.id, session);
      return session;
    });
    vi.mocked(prismaMock.$transaction).mockImplementation((queries) =>
      Promise.all(queries as unknown as Promise<unknown>[]),
    );
  });

  afterEach(() => vi.useRealTimers());

  it("starts a web login with a 15-minute deadline and a session-bound access token", async () => {
    const { body, headers } = await request(app).post(`${webAuth}/login`).send({
      email: "citizen@example.com",
      password: "test-password",
    }).expect(200);

    expect(body.sessionId).toBe("new");
    expect(body.expiresAt).toBe(startedAt + 15 * minute);
    expect(headers["set-cookie"][0]).toContain("HttpOnly");
    await request(app).get(`${webAuth}/session`).set("Authorization", `Bearer ${body.token}`).expect(200);
  });

  it("extends only on activity and rejects access or refresh at the deadline", async () => {
    const token = generateToken(userId, "first");
    const refreshToken = generateRefreshToken(userId, "first");
    const otherToken = generateToken(userId, "second");

    vi.setSystemTime(startedAt + 14 * minute);
    await request(app).post(`${webAuth}/refresh`).send({ refreshToken })
      .expect(200).expect(({ body }) => expect(body.expiresAt).toBe(startedAt + 15 * minute));
    vi.setSystemTime(startedAt + 14 * minute + 1000);
    await request(app).post(`${webAuth}/activity`).set("Authorization", `Bearer ${token}`)
      .send({ activityAgeMs: 1000 })
      .expect(200).expect(({ body }) => expect(body.expiresAt).toBe(startedAt + 29 * minute));

    vi.setSystemTime(startedAt + 15 * minute);
    await request(app).get(`${webAuth}/session`).set("Authorization", `Bearer ${otherToken}`).expect(401);
    await request(app).get(`${webAuth}/session`).set("Authorization", `Bearer ${token}`).expect(200);

    vi.setSystemTime(startedAt + 29 * minute);
    await request(app).post(`${webAuth}/activity`).set("Authorization", `Bearer ${token}`).expect(401);
    await request(app).post(`${webAuth}/refresh`).send({ refreshToken }).expect(401);
    await request(app).post("/api/v1/auth/refresh").send({ refreshToken }).expect(401);
  });

  it("revokes only the signed-out session", async () => {
    const refreshToken = generateRefreshToken(userId, "first");
    await request(app).post(`${webAuth}/logout`).send({ refreshToken }).expect(204);
    await request(app).post(`${webAuth}/refresh`).send({ refreshToken }).expect(401);
    await request(app).get(`${webAuth}/session`)
      .set("Authorization", `Bearer ${generateToken(userId, "first")}`).expect(401);
    await request(app).get(`${webAuth}/session`)
      .set("Authorization", `Bearer ${generateToken(userId, "second")}`).expect(200);
  });
});
