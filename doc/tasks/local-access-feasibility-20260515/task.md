# Task: Evaluate Local Accessibility Refactor Feasibility

## Goal

Determine whether the current `D:\ProjectPackage\HeYi` project can be refactored so it is accessible locally, and record the exact scope boundaries, prerequisites, and blockers for both partial-local and fully-local operation.

## Milestones

1. Inspect the frontend entry, local proxy behavior, and direct runtime dependencies.
2. Inspect backend-style functions, database/auth dependencies, and required environment variables.
3. Decide whether the requested change should be accepted, rejected, split, or blocked, with evidence.

## Expected Verification

- Confirm how the frontend currently reaches chat, auth, quota, and report-generation services.
- Confirm whether required database schema and local service definitions exist in the repository.
- Produce a change decision with blockers and next actions.

## Current Status

- Status: Completed
- Current milestone: 3
- Blockers:
  - Full local self-hosting is blocked by missing database schema/migration artifacts and missing local backend service definitions.

## Completion Notes

- Milestone 1 completed: confirmed that the frontend can be served locally, but chat currently depends on a webpack proxy for `/api/proxy/v1`.
- Milestone 2 completed: confirmed that stock analysis, auth, quota, and report generation depend on Supabase-style endpoints, remote/public data sources, and remote AI credentials.
- Milestone 3 completed: the change request was triaged as `split` rather than a single yes/no change.
- Accepted scope:
  - Local frontend access while keeping remote dependencies.
- Blocked scope:
  - Fully local self-hosted operation without additional backend/schema work.
