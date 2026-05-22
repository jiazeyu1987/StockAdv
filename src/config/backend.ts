declare const __STOCKADV_BACKEND_API_BASE_URL__: string | undefined;
declare const __STOCKADV_PROXY_ACCESS_TOKEN__: string | undefined;
declare const __STOCKADV_SESSION_ID__: string | undefined;
declare const __STOCKADV_ACCOUNT_MANAGER_API_BASE_URL__: string | undefined;

type RuntimeBackendConfig = {
  apiBaseUrl?: string;
  proxyAccessToken?: string;
  sessionId?: string;
  accountManagerApiBaseUrl?: string;
};

const runtimeConfig = ((window as any).STOCKADV_CONFIG?.backend || {}) as RuntimeBackendConfig;
const injectedBackendApiBaseUrl =
  typeof __STOCKADV_BACKEND_API_BASE_URL__ !== 'undefined'
    ? __STOCKADV_BACKEND_API_BASE_URL__
    : undefined;
const injectedProxyAccessToken =
  typeof __STOCKADV_PROXY_ACCESS_TOKEN__ !== 'undefined'
    ? __STOCKADV_PROXY_ACCESS_TOKEN__
    : undefined;
const injectedSessionId =
  typeof __STOCKADV_SESSION_ID__ !== 'undefined'
    ? __STOCKADV_SESSION_ID__
    : undefined;
const injectedAccountManagerApiBaseUrl =
  typeof __STOCKADV_ACCOUNT_MANAGER_API_BASE_URL__ !== 'undefined'
    ? __STOCKADV_ACCOUNT_MANAGER_API_BASE_URL__
    : undefined;

export const BACKEND_API_BASE_URL =
  runtimeConfig.apiBaseUrl || injectedBackendApiBaseUrl || '/api/proxy/v1';

export const BACKEND_PROXY_ACCESS_TOKEN =
  runtimeConfig.proxyAccessToken || injectedProxyAccessToken || 'replace-with-proxy-access-token';

export const BACKEND_SESSION_ID =
  runtimeConfig.sessionId || injectedSessionId || 'web-chat-session';

export const ACCOUNT_MANAGER_API_BASE_URL =
  runtimeConfig.accountManagerApiBaseUrl || injectedAccountManagerApiBaseUrl || '/api/account-manager/v1';
