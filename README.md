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

## Deploy On A Cloud Linux Machine

This section deploys the current service shape: a Webpack dev-server frontend on port `3266` that reverse-proxies `/api/proxy/*` to `backend_app` on port `8088`.

The request path will be:

```text
Browser -> http://<cloud-ip>:3266/api/proxy/v1/chat/completions
        -> http://34.45.206.120:8088/v1/chat/completions
        -> backend_app -> OpenClaw
```

If `backend_app` is running on the same cloud machine as this frontend, set `STOCKADV_BACKEND_PROXY_TARGET=http://127.0.0.1:8088` instead of the public `34.45.206.120:8088` URL.

### 1. Install System Packages

Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y curl git ca-certificates build-essential
```

### 2. Install Node.js

Install Node.js 20 LTS with NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version
```

Enable Corepack and install the pnpm version used by this project:

```bash
sudo corepack enable
corepack prepare pnpm@9.15.9 --activate
pnpm --version
```

If `corepack prepare` fails because of permissions, run:

```bash
sudo corepack prepare pnpm@9.15.9 --activate
```

### 3. Get The Source Code

Clone the repository, or upload this project directory to the cloud machine:

```bash
git clone <your-repo-url> StockAdv
cd StockAdv
```

If you upload the folder manually, enter that folder instead:

```bash
cd /path/to/StockAdv
```

### 4. Install Dependencies

```bash
pnpm install
```

Optional verification before launching:

```bash
pnpm test
pnpm typecheck
pnpm build
```

Known build note: Webpack currently reports a bundle-size performance warning for `bundle.js`; the production build still succeeds.

### 5. Configure The Backend Target

Create an environment file for the service:

```bash
sudo tee /etc/stockadv-frontend.env >/dev/null <<'EOF'
STOCKADV_BACKEND_PROXY_TARGET=http://34.45.206.120:8088
STOCKADV_BACKEND_API_BASE_URL=/api/proxy/v1
STOCKADV_PROXY_ACCESS_TOKEN=replace-with-proxy-access-token
STOCKADV_SESSION_ID=web-chat-session
EOF
```

For a same-machine backend, change the first line to:

```text
STOCKADV_BACKEND_PROXY_TARGET=http://127.0.0.1:8088
```

The `OPENCLAW_TOKEN` belongs only in `backend_app`; do not put it in this frontend service.

### 6. Test Launch Manually

Bind to `0.0.0.0` so the service can be reached from outside the cloud machine:

```bash
set -a
. /etc/stockadv-frontend.env
set +a
pnpm dev --host 0.0.0.0
```

In another SSH session, test the frontend proxy:

```bash
curl http://127.0.0.1:3266/api/proxy/healthz

curl \
  -H "Authorization: Bearer replace-with-proxy-access-token" \
  http://127.0.0.1:3266/api/proxy/v1/models
```

If the cloud firewall allows port `3266`, open the browser at:

```text
http://<cloud-ip>:3266/
```

Stop the manual server with `Ctrl+C` after this test.

### 7. Run As A systemd Service

Create a service file. Replace `/path/to/StockAdv` with the absolute path to this project on the cloud machine:

```bash
sudo tee /etc/systemd/system/stockadv-frontend.service >/dev/null <<'EOF'
[Unit]
Description=StockAdv frontend proxy
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/path/to/StockAdv
EnvironmentFile=/etc/stockadv-frontend.env
ExecStart=/usr/bin/pnpm dev --host 0.0.0.0
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

If `pnpm` is installed somewhere else, find it with:

```bash
which pnpm
```

Then update `ExecStart` to use that full path.

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now stockadv-frontend
sudo systemctl status stockadv-frontend
```

To stop the servie:
```bash
sudo systemctl stop stockadv-frontend
```

View logs:

```bash
journalctl -u stockadv-frontend -f
```

Restart after changing `/etc/stockadv-frontend.env`:

```bash
sudo systemctl restart stockadv-frontend
```

### 8. Open The Cloud Firewall

If you want to access the service directly on port `3266`, allow that port in both the VM provider firewall and the Linux firewall.

For `ufw`:

```bash
sudo ufw allow 3266/tcp
sudo ufw status
```

Then open:

```text
http://<cloud-ip>:3266/
```

For a public deployment, prefer putting Nginx or another HTTPS reverse proxy in front of this service and forwarding to `http://127.0.0.1:3266`.

### 9. Final Health Checks

Check the backend directly:

```bash
curl http://34.45.206.120:8088/healthz
curl -H "Authorization: Bearer replace-with-proxy-access-token" \
  http://34.45.206.120:8088/v1/models
```

Check the deployed frontend proxy:

```bash
curl http://127.0.0.1:3266/api/proxy/healthz
curl -H "Authorization: Bearer replace-with-proxy-access-token" \
  http://127.0.0.1:3266/api/proxy/v1/models
```

From your local browser:

```text
http://<cloud-ip>:3266/
```

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

## Accounts saved in repo:

```powershell
user0  75378416  unlimited
user1  42151509  10/day
user2  01671631  10/day
user3  49811656  10/day
user4  29090108  10/day
user5  73684583  10/day
user6  25800699  10/day
user7  70779252  10/day
user8  19011141  10/day
user9  38433209  10/day
```

## Verified Locally

Verified on 2026-05-16:

- `http://34.45.206.120:8088/healthz` returned `{"ok":"true"}`.
- `http://34.45.206.120:8088/v1/models` returned the `openclaw` model with the proxy token.
- `http://127.0.0.1:3266/api/proxy/healthz` returned `{"ok":"true"}` through the dev proxy.
- `http://127.0.0.1:3266/api/proxy/v1/chat/completions` returned HTTP 200 through the dev proxy.
- Browser verification loaded the app, entered the chat page, showed `服务正常`, and received a backend response from the UI.
