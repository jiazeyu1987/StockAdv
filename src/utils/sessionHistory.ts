export interface ChatSessionSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface StoredChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ChatSessionDetail extends ChatSessionSummary {
  messages: StoredChatMessage[];
}

export interface SessionHistoryBackend {
  apiBaseUrl: string;
  proxyAccessToken: string;
  sessionId: string;
}

interface SessionListResponse {
  sessions: ChatSessionSummary[];
}

interface SessionDetailResponse {
  session: ChatSessionDetail;
}

export const toHistoryUserId = (username: string): string => {
  const safe = username.trim().replace(/[^A-Za-z0-9_.:@-]/g, '-').slice(0, 128);
  return safe || 'user';
};

export const buildOpenClawSessionId = (baseSessionId: string, historySessionId: string): string => {
  const combined = `${baseSessionId}-${historySessionId}`
    .replace(/[^A-Za-z0-9_.:-]/g, '-')
    .slice(0, 128);
  return combined || baseSessionId;
};

export const fetchChatSessions = async (
  backend: SessionHistoryBackend,
  historyUserId: string
): Promise<ChatSessionSummary[]> => {
  const payload = await requestHistory<SessionListResponse>(
    backend,
    `/users/${encodeURIComponent(historyUserId)}/sessions`
  );
  return payload.sessions;
};

export const createChatSession = async (
  backend: SessionHistoryBackend,
  historyUserId: string,
  title = '新对话'
): Promise<ChatSessionDetail> => {
  const payload = await requestHistory<SessionDetailResponse>(
    backend,
    `/users/${encodeURIComponent(historyUserId)}/sessions`,
    {
      method: 'POST',
      body: JSON.stringify({ title }),
    }
  );
  return payload.session;
};

export const fetchChatSession = async (
  backend: SessionHistoryBackend,
  historyUserId: string,
  sessionId: string
): Promise<ChatSessionDetail> => {
  const payload = await requestHistory<SessionDetailResponse>(
    backend,
    `/users/${encodeURIComponent(historyUserId)}/sessions/${encodeURIComponent(sessionId)}`
  );
  return payload.session;
};

const requestHistory = async <T>(
  backend: SessionHistoryBackend,
  path: string,
  init: RequestInit = {}
): Promise<T> => {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${backend.proxyAccessToken}`);

  const response = await fetch(`${backend.apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Session history request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};
