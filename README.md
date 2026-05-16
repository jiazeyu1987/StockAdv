# StockAdv Frontend

StockAdv is a React/Webpack frontend for the value-investing assistant. It runs locally as a browser app and talks to `backend_app`, the OpenClaw security proxy from:

```text
C:\Users\pdhe\PycharmProjects\ladder_capital_value_investing\ladder_capical_value_investing\backend_app
```

In local development, the browser does not call the cloud backend directly. It calls this frontend's Webpack dev-server proxy:

```text
Browser -> http://127.0.0.1:3266/api/proxy/v1/chat/completions
        -> http://34.45.206.120:8088/v1/chat/completions
        -> backend_app -> local OpenClaw service on the cloud instance
```

## Current Cloud Backend

The currently verified cloud backend is:

```text
BACKEND_OPENAI_BASE_URL=http://34.45.206.120:8088/v1
PROXY_ACCESS_TOKEN=replace-with-proxy-access-token
```

The cloud instance itself also needs its server-only OpenClaw settings:

```text
OPENCLAW_LOCAL_WS_URL=ws://127.0.0.1:18789/
OPENCLAW_ORIGIN=http://127.0.0.1:18789
ALLOWED_ORIGINS=*
OPENCLAW_TOKEN=<server-only OpenClaw token>
```

Do not put the real `OPENCLAW_TOKEN` into frontend code. The frontend only authenticates to `backend_app` with `PROXY_ACCESS_TOKEN`.

## Prerequisites

- Node.js 20+ or 24+
- Corepack, bundled with modern Node.js
- Network access to `34.45.206.120:8088`

PowerShell may block `npm.ps1`/`pnpm.ps1`. Use the `.cmd` form of Corepack on Windows:

```powershell
corepack.cmd prepare pnpm@9.15.9 --activate
corepack.cmd pnpm install
```

## Run The Webpage Locally

Start the dev server:

```powershell
cd C:\Users\pdhe\PycharmProjects\StockAdv
corepack.cmd pnpm dev --host 127.0.0.1
```

Open:

```text
http://127.0.0.1:3266/
```

The login screen is currently a test screen. Click `登录` to enter the chat page; no password is required. The status should change to `服务正常` after the frontend calls `/api/proxy/healthz`.

## Backend Configuration

The default development configuration already points to the cloud backend:

```text
STOCKADV_BACKEND_PROXY_TARGET=http://34.45.206.120:8088
STOCKADV_BACKEND_API_BASE_URL=/api/proxy/v1
STOCKADV_PROXY_ACCESS_TOKEN=replace-with-proxy-access-token
STOCKADV_SESSION_ID=web-chat-session
```

To use a different backend without editing code:

```powershell
$env:STOCKADV_BACKEND_PROXY_TARGET = "http://127.0.0.1:8088"
$env:STOCKADV_PROXY_ACCESS_TOKEN = "replace-with-proxy-access-token"
corepack.cmd pnpm dev --host 127.0.0.1
```

For a deployed static frontend, provide the same values before the bundle loads if you are not using the Webpack dev proxy:

```html
<script>
  window.STOCKADV_CONFIG = {
    backend: {
      apiBaseUrl: "/api/proxy/v1",
      proxyAccessToken: "replace-with-proxy-access-token",
      sessionId: "web-chat-session"
    }
  };
</script>
```

The deployed web host must also provide a reverse proxy from `/api/proxy` to the real `backend_app` origin, or `apiBaseUrl` must point to a CORS-enabled backend URL.

## Smoke Tests

Check the cloud backend directly:

```powershell
Invoke-RestMethod -Uri "http://34.45.206.120:8088/healthz"

$headers = @{ Authorization = "Bearer replace-with-proxy-access-token" }
Invoke-RestMethod -Uri "http://34.45.206.120:8088/v1/models" -Headers $headers
```

Check the same backend through the local frontend proxy after `pnpm dev` is running:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:3266/api/proxy/healthz"

$headers = @{ Authorization = "Bearer replace-with-proxy-access-token" }
Invoke-RestMethod -Uri "http://127.0.0.1:3266/api/proxy/v1/models" -Headers $headers
```

Send an OpenAI-compatible chat request through the local proxy:

```powershell
$headers = @{
  Authorization = "Bearer replace-with-proxy-access-token"
  "Content-Type" = "application/json"
}

$body = @{
  model = "openclaw"
  messages = @(@{ role = "user"; content = "请用一句话回复：本地网页可以连接 backend_app。" })
  user = "stockadv-local-smoke"
  stream = $false
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Uri "http://127.0.0.1:3266/api/proxy/v1/chat/completions" `
  -Headers $headers `
  -Method Post `
  -Body $body
```

## Development Checks

```powershell
corepack.cmd pnpm test
corepack.cmd pnpm typecheck
corepack.cmd pnpm build
```

Known build note: Webpack currently reports a bundle-size performance warning for `bundle.js`; the production build still succeeds.

## Verified Locally

Verified on 2026-05-16:

- `http://34.45.206.120:8088/healthz` returned `{"ok":"true"}`.
- `http://34.45.206.120:8088/v1/models` returned the `openclaw` model with the proxy token.
- `http://127.0.0.1:3266/api/proxy/healthz` returned `{"ok":"true"}` through the dev proxy.
- `http://127.0.0.1:3266/api/proxy/v1/chat/completions` returned HTTP 200 through the dev proxy.
- Browser verification loaded the app, entered the chat page, showed `服务正常`, and received a backend response from the UI.
