# Frontend Feature Evidence

## Scope

Enable localhost access for the current frontend entry without changing its remote chat contract.

## Acceptance

- The current frontend can be started locally with `pnpm dev`.
- The local webpack dev server serves the app from `localhost`.
- The active chat flow keeps using the existing `/api/proxy` contract instead of calling the remote origin directly from the frontend.

## BDD Scenarios

- BDD: localhost frontend starts -> Given the workspace dependencies are installable and the active frontend entry uses the existing remote chat backend / When the developer runs the local dev command / Then the app should be served successfully from `localhost` through the webpack dev server.
- BDD: local dev server keeps the current remote chat contract -> Given the frontend sends OpenAI-style requests to the current chat backend / When it runs in localhost development / Then the requests should continue to flow through a local proxy path instead of requiring frontend code to call the remote origin directly.

## RED

- RED: `pnpm typecheck` -> FAIL, `tsc` was unavailable because dependency installation had not completed.
- RED: `pnpm build` -> FAIL, `webpack` was unavailable because dependency installation had not completed.

## GREEN

- GREEN: `pnpm install --frozen-lockfile` -> PASS
- GREEN: `pnpm test` -> PASS
- GREEN: `pnpm typecheck` -> PASS
- GREEN: `pnpm build` -> PASS
- GREEN: localhost verification -> PASS
  - `http://127.0.0.1:3266` returned HTTP `200`
  - `http://127.0.0.1:3266/api/proxy/healthz` returned HTTP `200` with body `{"ok":"true"}`

## Verification

- Automated verification:
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm build`
- Runtime verification:
  - Started `pnpm dev`
  - Requested `http://127.0.0.1:3266`
  - Requested `http://127.0.0.1:3266/api/proxy/healthz`

## Remaining Blockers

- None for localhost access of the current active frontend entry.
