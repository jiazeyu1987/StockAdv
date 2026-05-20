# Task: Update Chat Input Copy

## Goal

Update the chat input prompt copy for the starter-question pages and keep the visible text consistent across all affected chat entry points.

## Milestones

1. Inspect current chat input copy locations and confirm affected files.
2. Add regression coverage for the required shared input copy.
3. Update the frontend copy, verify the result, and record evidence.

## Expected Verification

- Confirm all visible starter-question chat input placeholder locations.
- Run a regression test that checks the new shared prompt copy and shared usage.
- Run frontend verification commands after the copy update.

## Current Status

Completed
- Current milestone: 3
- Blockers:
  - None

## Completion Notes

- Milestone 1 completed: confirmed the affected starter-question chat input placeholders are in `src/App.tsx` and `src/pages/ChatPage.tsx`.
- Milestone 2 completed: added a regression test that requires a shared chat input copy source and shared usage in both affected pages.
- Milestone 3 completed: introduced a shared chat input prompt source, updated both pages to reuse it, and verified test, typecheck, and build results.
