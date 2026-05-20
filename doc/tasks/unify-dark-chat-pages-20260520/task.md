# Task: Unify Dark Style For Home And Ask Pages

## Goal

Keep the starter question cards at 10 items and make the home chat entry plus the dedicated ask page use the same dark visual style.

## Milestones

1. Inspect the current home and ask page implementations and confirm the style gaps.
2. Add regression coverage for the 10-card requirement and dark-style parity.
3. Update the frontend styles, verify the result, and record evidence.

## Expected Verification

- Confirm both pages render from the shared 10-card source.
- Run a regression test that checks both pages use the shared dark shell and dark card styling.
- Run frontend verification commands after the style update.

## Current Status

Completed
- Current milestone: 3
- Blockers:
  - None

## Completion Notes

- Milestone 1 completed: confirmed the shared 10-card data source already exists, while `src/App.tsx` and `src/pages/ChatPage.tsx` still had divergent shell and surface styles.
- Milestone 2 completed: added regression coverage requiring a shared dark theme definition and both pages to use it.
- Milestone 3 completed: introduced a shared dark chat theme, applied it to both pages, and verified test, typecheck, build, and evidence validation results.
