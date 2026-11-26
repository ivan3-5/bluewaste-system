import prisma from "../config/database";
import { AuthClaims, generateRefreshToken, generateToken } from "../utils/jwt";

const WEB_IDLE_MS = 15 * 60 * 1000;

export function webSessionTiming(expiresAt: Date) {
  return { expiresAt: expiresAt.getTime(), serverTime: Date.now() };
}

export async function createWebSession(userId: string) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + WEB_IDLE_MS);
  const [, session] = await prisma.$transaction([
    prisma.webSession.deleteMany({ where: { expiresAt: { lte: now } } }),
    prisma.webSession.create({ data: { userId, expiresAt } }),
  ]);
  return {
    sessionId: session.id,
    ...webSessionTiming(session.expiresAt),
    token: generateToken(userId, session.id),
    refreshToken: generateRefreshToken(userId, session.id),
  };
}

export async function getActiveWebSession({ userId, sessionId }: AuthClaims) {
  if (!sessionId) return null;
  return prisma.webSession.findFirst({
    where: {
      id: sessionId,
      userId,
      expiresAt: { gt: new Date() },
      user: { isActive: true, emailVerified: true },
    },
  });
}

export async function extendWebSession(userId: string, sessionId: string, activityAgeMs: number) {
  const now = new Date();
  const remainingMs = WEB_IDLE_MS - Math.min(activityAgeMs, WEB_IDLE_MS);
  const expiresAt = new Date(now.getTime() + remainingMs);
  await prisma.webSession.updateMany({
    where: { id: sessionId, userId, expiresAt: { gt: now, lt: expiresAt } },
    data: { expiresAt },
  });
  return getActiveWebSession({ userId, sessionId });
}

export async function revokeWebSession({ userId, sessionId }: AuthClaims) {
  if (!sessionId) return;
  await prisma.webSession.deleteMany({ where: { id: sessionId, userId } });
}
