import axios, { AxiosError, AxiosRequestConfig, CanceledError, InternalAxiosRequestConfig } from "axios";
import { clearWebSession, readWebSession, updateWebSession, SessionTiming, WebSession } from "./web-session";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const authApi = axios.create({ baseURL: API_URL, withCredentials: true, timeout: 8000 });
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

interface SessionRequestOptions {
  webSessionId?: string;
  retried?: boolean;
}

type SessionRequest = InternalAxiosRequestConfig & SessionRequestOptions;

export function endWebSession(session: WebSession, idle = false) {
  if (clearWebSession(session.sessionId, idle)) {
    void authApi.post("/auth/web/logout", { refreshToken: session.refreshToken }).catch(() => {});
  }
}

export function getCurrentWebSession() {
  const session = readWebSession();
  if (session && session.idleUntil <= Date.now()) {
    endWebSession(session, true);
    return null;
  }
  return session;
}

api.interceptors.request.use((config: SessionRequest) => {
  const session = getCurrentWebSession();
  if (config.webSessionId && config.webSessionId !== session?.sessionId) {
    throw new CanceledError("Web session changed");
  }
  if (session) {
    config.webSessionId = session.sessionId;
    config.headers.set("Authorization", `Bearer ${session.token}`);
  }
  return config;
});

const refreshing = new Map<string, Promise<void>>();

function refreshWebSession(session: WebSession) {
  const current = refreshing.get(session.sessionId);
  if (current) return current;

  const pending = authApi.post<SessionTiming & { token: string }>(
    "/auth/web/refresh",
    { refreshToken: session.refreshToken },
  ).then(({ data }) => {
    const active = getCurrentWebSession();
    if (active?.sessionId !== session.sessionId) throw new CanceledError("Web session changed");
    updateWebSession(session.sessionId, data);
  }).finally(() => {
    refreshing.delete(session.sessionId);
  });

  refreshing.set(session.sessionId, pending);
  return pending;
}

api.interceptors.response.use(undefined, async (error: AxiosError<{ code?: string }>) => {
  const request = error.config as SessionRequest | undefined;
  if (error.response?.status !== 401 || !request?.webSessionId) throw error;

  const session = getCurrentWebSession();
  if (session?.sessionId !== request.webSessionId) throw error;

  if (request.retried || error.response.data?.code === "WEB_SESSION_ENDED") {
    endWebSession(session);
    throw error;
  }
  request.retried = true;

  try {
    if (request.headers.get("Authorization") === `Bearer ${session.token}`) {
      await refreshWebSession(session);
    }
  } catch (refreshError) {
    if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
      endWebSession(session);
    }
    throw refreshError;
  }
  return api(request);
});

export function checkWebSession(sessionId: string, signal: AbortSignal, activityAgeMs?: number) {
  const config: AxiosRequestConfig & SessionRequestOptions = {
    webSessionId: sessionId,
    timeout: 8000,
    signal,
  };
  return activityAgeMs === undefined
    ? api.get<SessionTiming>("/auth/web/session", config)
    : api.post<SessionTiming>("/auth/web/activity", { activityAgeMs }, config);
}

export { authApi };
export default api;
