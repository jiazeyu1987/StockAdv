# Task: Update Question Cards Copy

## Goal

Update the frontend question cards so both the main chat entry and the chat page use the new 10-card Chinese copy provided by the user.

## Milestones

1. Inspect the existing question card implementation and identify all affected entry points.
2. Add or update regression coverage for the expected 10-card copy.
3. Update the frontend card content and verify the result.

## Expected Verification

- Confirm all affected frontend files that render the question cards.
- Run a regression test that checks the new 10-card copy is present in both affected pages.
- Confirm no old card titles remain in the updated files.

## Current Status

- Status: Completed
- Current milestone: 3
- Blockers:
  - None

## Completion Notes

- Milestone 1 completed: confirmed the question cards were hardcoded separately in `src/App.tsx` and `src/pages/ChatPage.tsx`.
- Milestone 2 completed: added a regression test that requires a shared 10-card definition and both pages to reuse it.
- Milestone 3 completed: moved the card copy into a shared JSON definition, updated both pages to render from it, and verified the new titles and prompts replaced the old set.
