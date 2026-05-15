# Task: Default openai_chat_smoke.py Base URL To Public IP

## Goal

Update `openai_chat_smoke.py` so its default OpenAI base URL uses the public backend IP instead of the local loopback address.

## Milestones

1. Confirm the current default `base_url` behavior and identify the target public IP from repository context.
2. Add a regression test that captures the expected default public `base_url`.
3. Update the script default and keep the task evidence in sync.
4. Verify the change and mark the task complete.

## Expected Verification

- `openai_chat_smoke.py` should default to `http://34.45.206.120:8088/v1` when `BACKEND_OPENAI_BASE_URL` is not set.
- The script should still honor an explicit `BACKEND_OPENAI_BASE_URL` override.
- Verification evidence should be recorded in `execution-log.md`.

## Current Status

- Status: Completed
- Current milestone: 4
- Blockers: None

## Completion Notes

- Milestone 1 completed: confirmed the script default still pointed to `http://127.0.0.1:8088/v1`, while repository examples already used `http://34.45.206.120:8088/v1`.
- Milestone 2 completed: added a focused `unittest` regression suite for the parser default and environment override behavior.
- Milestone 3 completed: introduced a reusable parser builder and changed the built-in fallback base URL to the public backend IP.
- Milestone 4 completed: verification passed with unit tests and Python bytecode compilation.
