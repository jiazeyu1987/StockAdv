export interface UserAccount {
  username: string;
  password: string;
  dailyQueryLimit: number | null;
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

export const authenticateUser = (username: string, password: string): UserAccount | null => {
  const normalizedUsername = username.trim();
  return (
    USER_ACCOUNTS.find(
      (account) => account.username === normalizedUsername && account.password === password
    ) || null
  );
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
