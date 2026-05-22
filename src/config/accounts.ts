import {
  ACCOUNT_MANAGER_API_BASE_URL,
  BACKEND_API_BASE_URL,
  BACKEND_PROXY_ACCESS_TOKEN,
  BACKEND_SESSION_ID,
} from './backend';

export interface BackendAssignment {
  id?: string;
  name?: string;
  apiBaseUrl: string;
  proxyAccessToken: string;
  sessionId: string;
}

export interface UserAccount {
  id?: string;
  username: string;
  password: string;
  dailyQueryLimit: number | null;
  isTestUser?: boolean;
  isAccountManagerUser?: boolean;
  backend?: BackendAssignment;
}

export interface QueryUsage {
  date: string;
  count: number;
  limit: number | null;
  remaining: number | null;
}

export const USER_ACCOUNTS: UserAccount[] = [
  { username: 'user0', password: '75378416', dailyQueryLimit: null },
  { username: 'user1', password: '42151509', dailyQueryLimit: 10 },
  { username: 'user2', password: '01671631', dailyQueryLimit: 10 },
  { username: 'user3', password: '49811656', dailyQueryLimit: 10 },
  { username: 'user4', password: '29090108', dailyQueryLimit: 10 },
  { username: 'user5', password: '73684583', dailyQueryLimit: 10 },
  { username: 'user6', password: '25800699', dailyQueryLimit: 10 },
  { username: 'user7', password: '70779252', dailyQueryLimit: 10 },
  { username: 'user8', password: '19011141', dailyQueryLimit: 10 },
  { username: 'user9', password: '38433209', dailyQueryLimit: 10 },
];

const QUERY_USAGE_PREFIX = 'stockadv-query-usage';

const getLocalDateKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const usageKeyFor = (username: string): string => `${QUERY_USAGE_PREFIX}:${username}`;

const buildLocalBackendAssignment = (username: string): BackendAssignment => ({
  apiBaseUrl: BACKEND_API_BASE_URL,
  proxyAccessToken: BACKEND_PROXY_ACCESS_TOKEN,
  sessionId: `${BACKEND_SESSION_ID}-${username}`.replace(/[^A-Za-z0-9_.:-]/g, '-').slice(0, 128),
});

const readStoredCount = (username: string, date: string): number => {
  const stored = localStorage.getItem(usageKeyFor(username));
  if (!stored) return 0;

  try {
    const parsed = JSON.parse(stored) as { date?: unknown; count?: unknown };
    if (parsed.date !== date || typeof parsed.count !== 'number') return 0;
    return Math.max(0, parsed.count);
  } catch {
    return 0;
  }
};

const writeStoredCount = (username: string, date: string, count: number) => {
  localStorage.setItem(usageKeyFor(username), JSON.stringify({ date, count }));
};

const authenticateLocalTestUser = (username: string, password: string): UserAccount | null => {
  const normalizedUsername = username.trim();
  const account =
    USER_ACCOUNTS.find(
      (candidate) => candidate.username === normalizedUsername && candidate.password === password
    ) || null;
  return account
    ? {
        ...account,
        isTestUser: true,
        backend: buildLocalBackendAssignment(account.username),
      }
    : null;
};

const shouldFallbackToLocalAccounts = (status: number): boolean =>
  status === 404 || status === 502 || status === 504;

const accountFromManagerPayload = (payload: any, password: string): UserAccount | null => {
  const user = payload?.user;
  const backend = payload?.backend;
  if (!user?.username || !backend?.apiBaseUrl || !backend?.proxyAccessToken || !backend?.sessionId) {
    return null;
  }

  return {
    id: String(user.id || ''),
    username: String(user.username),
    password,
    dailyQueryLimit:
      typeof user.dailyQueryLimit === 'number' || user.dailyQueryLimit === null
        ? user.dailyQueryLimit
        : null,
    isTestUser: Boolean(user.isTestUser),
    isAccountManagerUser: true,
    backend: {
      id: backend.id ? String(backend.id) : undefined,
      name: backend.name ? String(backend.name) : undefined,
      apiBaseUrl: String(backend.apiBaseUrl).replace(/\/$/, ''),
      proxyAccessToken: String(backend.proxyAccessToken),
      sessionId: String(backend.sessionId),
    },
  };
};

export const authenticateUser = async (username: string, password: string): Promise<UserAccount | null> => {
  const normalizedUsername = username.trim();
  try {
    const response = await fetch(`${ACCOUNT_MANAGER_API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: normalizedUsername, password }),
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return accountFromManagerPayload(await response.json(), password);
    }
    if (!shouldFallbackToLocalAccounts(response.status)) {
      return null;
    }
  } catch {
    return authenticateLocalTestUser(normalizedUsername, password);
  }

  return authenticateLocalTestUser(normalizedUsername, password);
};

export const createAccount = async (
  username: string,
  password: string,
  dailyQueryLimit: number | null = 10
): Promise<UserAccount | null> => {
  const response = await fetch(`${ACCOUNT_MANAGER_API_BASE_URL}/accounts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username.trim(), password, dailyQueryLimit }),
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    return null;
  }

  return accountFromManagerPayload(await response.json(), password);
};

export const getQueryUsage = (account: UserAccount): QueryUsage => {
  const date = getLocalDateKey();
  const count = account.dailyQueryLimit === null ? 0 : readStoredCount(account.username, date);
  const remaining =
    account.dailyQueryLimit === null ? null : Math.max(0, account.dailyQueryLimit - count);

  return {
    date,
    count,
    limit: account.dailyQueryLimit,
    remaining,
  };
};

export const canUseQuery = (account: UserAccount): boolean => {
  const usage = getQueryUsage(account);
  return usage.limit === null || usage.count < usage.limit;
};

export const recordQuery = (account: UserAccount): QueryUsage => {
  if (account.dailyQueryLimit === null) {
    return getQueryUsage(account);
  }

  const date = getLocalDateKey();
  const nextCount = readStoredCount(account.username, date) + 1;
  writeStoredCount(account.username, date, nextCount);
  return getQueryUsage(account);
};
