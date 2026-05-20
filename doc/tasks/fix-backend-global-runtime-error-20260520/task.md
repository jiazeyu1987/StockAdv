# Task: Fix Backend Global Runtime Error

## Goal

Fix the frontend runtime crash caused by `__STOCKADV_BACKEND_API_BASE_URL__` being undefined at runtime and verify the local app loads with the backend config resolved safely.

## Milestones

1. Inspect the backend config source, build-time definitions, and current local runtime state.
2. Add regression coverage for safe backend global access.
3. Implement the fix, restart the local app, and verify the served bundle no longer exposes the runtime crash.

## Expected Verification

- Confirm how backend config globals are injected at build time.
- Run a regression test that requires safe access to optional injected globals.
- Verify the restarted local app responds and the served bundle no longer contains raw unresolved backend global identifiers.

## Current Status

Completed
- Current milestone: 3
- Blockers:
  - None

## Completion Notes

- Milestone 1 completed: confirmed `webpack.config.js` defines backend globals at build time, while `src/config/backend.ts` still accessed them directly and could therefore throw at runtime when a stale or differently built bundle omitted them.
- Milestone 2 completed: added regression coverage requiring both webpack definitions and safe `typeof`-guarded reads in `src/config/backend.ts`.
- Milestone 3 completed: implemented safe backend global access, restarted the local dev server, and verified the restarted bundle no longer exposes raw unresolved backend global identifiers.
