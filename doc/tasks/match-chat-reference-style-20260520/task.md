# Task: Match Chat Reference Style

## Goal

Adjust the starter-question chat pages so their visual style more closely matches the provided reference screenshot while preserving existing chat behavior and data contracts.

## Milestones

1. Inspect the current chat theme and extract concrete visual targets from the reference image.
2. Add regression coverage for the shared reference-style palette and layout cues.
3. Update the shared theme and chat pages, verify the result, and record evidence.

## Expected Verification

- Confirm the affected shared theme and chat entry-point files.
- Run regression coverage that checks the shared reference-style theme usage.
- Run frontend verification commands after the UI update.

## Current Status

Completed
- Current milestone: 3
- Blockers:
  - None

## Completion Notes

- Milestone 1 completed: extracted the main reference cues as a brighter blue page shell, denser slate starter cards, no empty-state icon above the cards, a heavier sticky composer bar, and a back button on the dedicated chat page.
- Milestone 2 completed: added regression coverage for the shared reference-style palette and layout cues.
- Milestone 3 completed: updated the shared chat theme, aligned both starter-question chat entry points to it, added the missing dedicated-page back affordance, and verified test, typecheck, and build results.
