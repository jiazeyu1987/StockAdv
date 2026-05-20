# Task: Update Disclaimer Copy

## Goal

Update the frontend disclaimer copy to the user-provided legal text and keep all visible disclaimer entry points consistent.

## Milestones

1. Inspect existing disclaimer entry points and confirm affected frontend files.
2. Add regression coverage for the required disclaimer text and shared usage.
3. Update the frontend copy, verify the result, and record evidence.

## Expected Verification

- Confirm all visible disclaimer locations in the frontend.
- Run a regression test that checks the new disclaimer text and shared usage.
- Run frontend verification commands after the copy update.

## Current Status

Completed
- Current milestone: 3
- Blockers:
  - None

## Completion Notes

- Milestone 1 completed: confirmed three visible disclaimer entry points in `src/App.tsx`, `src/pages/ChatPage.tsx`, and `src/components/HowToAskAI.tsx`.
- Milestone 2 completed: added a regression test that requires a shared disclaimer copy source and shared usage across all affected files.
- Milestone 3 completed: introduced a shared disclaimer constant, updated all affected entry points to reuse it, and verified test, typecheck, and build results.
