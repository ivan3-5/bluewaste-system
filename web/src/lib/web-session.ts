import type { User } from "@/types";

const SESSION_KEY = "bluewaste_web_session";

export interface SessionTiming {
  expiresAt: number;
  serverTime: number;
}

export interface WebSessionResponse extends SessionTiming {
  sessionId: string;
  user: User;
  token: string;
  refreshToken: string;
}

export interface WebSession extends Omit<WebSessionResponse, "serverTime"> {
  // Browser wall-clock deadline, derived from the server's remaining time.
  idleUntil: number;
}

type SessionListener = (session: WebSession | null) => void;
const listeners = new Set<SessionListener>();

// Keep sign-out separate from the token record so a concurrent write in another tab cannot undo it.
const sessionDataKey = (id: string) => `${SESSION_KEY}:data:${id}`;
const sessionEndKey = (id: string) => `${SESSION_KEY}:ended:${id}`;

export function readWebSession(): WebSession | null {
  if (typeof window === "undefined") return null;
  try {
    const id = localStorage.getItem(SESSION_KEY);
    if (!id || localStorage.getItem(sessionEndKey(id))) return null;
    const raw = localStorage.getItem(sessionDataKey(id));
    const session: WebSession | null = raw ? JSON.parse(raw) : null;
    return session?.sessionId === id && session.user?.id && session.token && session.refreshToken &&
      Number.isFinite(session.expiresAt) && Number.isFinite(session.idleUntil) ? session : null;
  } catch {
    return null;
  }
}

function notifyListeners() {
  const session = readWebSession();
  listeners.forEach((listener) => listener(session));
}

function writeWebSession(session: WebSession) {
  localStorage.setItem(sessionDataKey(session.sessionId), JSON.stringify(session));
  notifyListeners();
}

export function startWebSession({ serverTime, ...session }: WebSessionResponse) {
  const previousId = localStorage.getItem(SESSION_KEY);
  const record = { ...session, idleUntil: Date.now() + Math.max(0, session.expiresAt - serverTime) };
  localStorage.setItem(sessionDataKey(session.sessionId), JSON.stringify(record));
  localStorage.setItem(SESSION_KEY, session.sessionId);
  if (previousId && previousId !== session.sessionId) {
    localStorage.removeItem(sessionDataKey(previousId));
    localStorage.removeItem(sessionEndKey(previousId));
  }
  notifyListeners();
}

export function updateWebSession(
  sessionId: string,
  update: Partial<Pick<WebSession, "token" | "user">> & Partial<SessionTiming>,
) {
  const session = readWebSession();
  if (session?.sessionId !== sessionId) return false;
  const { expiresAt, serverTime, ...changes } = update;
  if (expiresAt !== undefined && serverTime !== undefined && expiresAt > session.expiresAt) {
    writeWebSession({
      ...session,
      ...changes,
      expiresAt,
      idleUntil: Date.now() + Math.max(0, expiresAt - serverTime),
    });
  } else if (changes.token === undefined && changes.user === undefined) {
    return true;
  } else {
    writeWebSession({ ...session, ...changes });
  }
  return true;
}

export function clearWebSession(sessionId: string, idle: boolean) {
  const session = readWebSession();
  if (session?.sessionId !== sessionId) return false;
  localStorage.setItem(sessionEndKey(sessionId), idle ? "idle" : "logout");
  localStorage.removeItem(sessionDataKey(sessionId));
  notifyListeners();
  return true;
}

export function hasIdleNotice() {
  if (typeof window === "undefined") return false;
  const id = localStorage.getItem(SESSION_KEY);
  return id !== null && localStorage.getItem(sessionEndKey(id)) === "idle";
}

export function subscribeToWebSession(listener: SessionListener) {
  const onStorage = (event: StorageEvent) => {
    if (event.storageArea !== localStorage) return;
    const id = localStorage.getItem(SESSION_KEY);
    if (event.key === null || event.key === SESSION_KEY ||
      (id && (event.key === sessionDataKey(id) || event.key === sessionEndKey(id)))) {
      listener(readWebSession());
    }
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
