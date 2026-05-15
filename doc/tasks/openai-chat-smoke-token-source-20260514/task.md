# Task: Remove Implicit OPENAI_API_KEY Fallback From openai_chat_smoke.py

## Goal

Update `openai_chat_smoke.py` so it fails fast when the backend proxy token is missing instead of silently falling back to `OPENAI_API_KEY`.

## Milestones

1. Confirm the current credential selection behavior and the exact runtime failure.
2. Add regression tests for credential source selection.
3. Update the script to require `BACKEND_ACCESS_TOKEN` or explicit `--api-key`.
4. Verify the behavior and record the evidence.

## Expected Verification

- When `BACKEND_ACCESS_TOKEN` is unset, the script should not implicitly use `OPENAI_API_KEY`.
- When `BACKEND_ACCESS_TOKEN` is set, the parser should use it as the default `--api-key`.
- Running the script without `BACKEND_ACCESS_TOKEN` or explicit `--api-key` should fail fast with a clear prerequisite error.

## Current Status

- Status: Completed
- Current milestone: 4
- Blockers: None

## Completion Notes

- Milestone 1 completed: confirmed the script implicitly fell back to `OPENAI_API_KEY` when `BACKEND_ACCESS_TOKEN` was missing, which produced runtime `401 invalid_api_key` against the backend proxy.
- Milestone 2 completed: added regression coverage for both the forbidden fallback path and the valid backend-token path.
- Milestone 3 completed: removed the implicit `OPENAI_API_KEY` fallback so the script now only uses `BACKEND_ACCESS_TOKEN` unless `--api-key` is passed explicitly.
- Milestone 4 completed: verification passed with unit tests, bytecode compilation, and a runtime check that now fails fast with a clear prerequisite error.
