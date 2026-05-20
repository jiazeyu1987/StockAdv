# Task: Update Chat Textarea Text Color

## Goal

Change the starter-question chat textarea text to black and keep the affected chat entry points consistent through the shared theme.

## Milestones

1. Inspect the current shared textarea style and confirm affected files.
2. Add regression coverage for the shared black textarea text color.
3. Update the shared theme, verify the result, and record evidence.

## Expected Verification

- Confirm the textarea style comes from the shared chat theme.
- Run a regression test that checks the shared textarea text color.
- Run frontend verification commands after the style update.

## Current Status

Completed
- Current milestone: 3
- Blockers:
  - None

## Completion Notes

- Milestone 1 completed: confirmed the starter-question chat textarea style is controlled by `chatTheme.textarea` and reused by both `src/App.tsx` and `src/pages/ChatPage.tsx`.
- Milestone 2 completed: added a regression test that requires the shared textarea style to use black text.
- Milestone 3 completed: updated the shared textarea style to use black text, verified test, typecheck, and production build, and kept both chat entry points aligned through the shared theme.
