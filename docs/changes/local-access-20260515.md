# Change Request: Local Accessibility Refactor

## Request Summary And Source

- Request: "这个项目可不可以改造成本地可以访问的"
- Source: user request in the current thread on 2026-05-15.

## Current Baseline Reviewed

- Code baseline:
  - `src/App.tsx`
  - `src/pages/ChatPage.tsx`
  - `src/components/StockInput.tsx`
  - `src/components/LoginPanel.tsx`
  - `src/components/RegisterModal.tsx`
  - `src/components/AdminPanel.tsx`
  - `src/supabase/client.ts`
  - `src/utils/aiReport.ts`
  - `src/utils/stockApi.ts`
  - `functions/ai-report/index.ts`
  - `functions/check-user-limit/index.ts`
  - `functions/register-user/index.ts`
  - `functions/send-verification-code/index.ts`
  - `functions/test-login/index.ts`
  - `functions/verify-code/index.ts`
  - `webpack.config.js`
- Existing task/verification baseline:
  - `doc/tasks/project-analysis-20260513/task.md`
  - `doc/tasks/runnability-check-20260515/verification-report.md`
- Missing formal baseline artifacts:
  - No PRD found in the repository.
  - No system design doc found in the repository.
  - No acceptance plan found in the repository.
  - No roadmap or release plan found in the repository.
  - No SQL migration or Supabase schema files found in the repository.

## Classification

- Type: tech constraint plus deployment/accessibility change request.

## Impact Analysis

### Product Impact

- The project can be made locally accessible at the UI level.
- The current user-visible flows depend on remote chat, remote AI report generation, remote/public market data, and Supabase-style auth/quota endpoints.

### Design Impact

- No major UI redesign is required for local accessibility.
- Small configuration refactors are needed to remove hard-coded runtime targets from frontend code.

### Data Impact

- Local UI-only access can still depend on remote data.
- Fully local operation is currently blocked because the repository does not include the database schema or migrations required for:
  - `users`
  - `user_daily_limits`
  - `verification_codes`
  - `recharge_records`

### API Impact

- Chat page currently calls `/api/proxy/v1`, which is only available through the webpack dev proxy.
- Stock analysis flow calls `${location.origin}/sb-api/functions/v1/...` through the generated Supabase client helper.
- AI report generation depends on `functions/ai-report/index.ts`, which requires `MEOO_PROJECT_API_KEY` and forwards requests to `https://api.meoo.host/...`.
- Auth/quota functions require `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

### Test Impact

- No automated tests currently define local-access acceptance.
- Local-access work would need explicit verification for:
  - frontend boot
  - chat health check
  - chat completion request
  - auth/register/login flows
  - quota flow
  - AI report generation flow

### Release Impact

- The change should be split into stages instead of treated as one atomic refactor.
- Local UI access is low-to-medium risk.
- Fully local self-hosting is high risk until missing infrastructure artifacts are supplied.

### Operations Impact

- Local UI access requires only a local dev server plus reachable remote services.
- Fully local self-hosting would require at minimum:
  - a local API/proxy for chat
  - a local Supabase-compatible stack or equivalent replacement
  - local secrets management
  - database schema bootstrap
  - local edge-function hosting or server replacement

## Decision

- Decision: split

## Decision Rationale

- Accept the change if the target means: "open the project locally and use it through localhost while still relying on existing remote services."
- Block the change if the target means: "all services, auth, quota, report generation, and data dependencies run locally without remote infrastructure."

## Required Approvals

- User confirmation is required on which target is desired:
  - local frontend plus remote services
  - full local stack

## Downstream Skill Reruns

- If the local frontend plus remote services path is accepted:
  - `frontend-feature-delivery`
- If the full local stack path is accepted:
  - `system-design-docs`
  - `backend-api-delivery`
  - `database-schema-delivery`
  - `quality-assurance-test-suite`

## Blockers And Next Action

- Blocker:
  - No SQL migration or schema baseline exists in the repository for the Supabase tables required by the current code.
- Blocker:
  - No local backend service implementation is present for `/api/proxy/v1`; only a webpack dev proxy rule exists.
- Blocker:
  - AI report generation still depends on remote `api.meoo.host` credentials.
- Next action:
  - Ask the user to choose between:
    - a practical localhost version that keeps remote dependencies
    - a full local stack refactor
