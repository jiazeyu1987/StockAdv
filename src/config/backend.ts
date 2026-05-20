declare const __STOCKADV_BACKEND_API_BASE_URL__: string | undefined;
declare const __STOCKADV_PROXY_ACCESS_TOKEN__: string | undefined;
declare const __STOCKADV_SESSION_ID__: string | undefined;

type RuntimeBackendConfig = {
  apiBaseUrl?: string;
  proxyAccessToken?: string;
  sessionId?: string;
};

const runtimeConfig = ((window as any).STOCKADV_CONFIG?.backend || {}) as RuntimeBackendConfig;

export const BACKEND_API_BASE_URL =
  runtimeConfig.apiBaseUrl || __STOCKADV_BACKEND_API_BASE_URL__ || '/api/proxy/v1';

export const BACKEND_PROXY_ACCESS_TOKEN =
  runtimeConfig.proxyAccessToken || __STOCKADV_PROXY_ACCESS_TOKEN__ || 'replace-with-proxy-access-token';

export const BACKEND_SESSION_ID =
  runtimeConfig.sessionId || __STOCKADV_SESSION_ID__ || 'web-chat-session';
