# Task: Convert openai_chat_smoke.py To Local Codex CLI

## Goal

Update `openai_chat_smoke.py` so it uses the local `codex` CLI instead of an OpenAI-compatible backend URL and no longer depends on `BACKEND_OPENAI_BASE_URL`.

## Milestones

1. Inspect current script behavior and local `codex` CLI options.
2. Refactor the script to invoke local `codex exec` for each prompt.
3. Verify the new flow with a focused smoke test and record the result.

## Expected Verification

- The script should not require `BACKEND_OPENAI_BASE_URL`.
- The script should fail fast if `codex` is not installed or invocation fails.
- A non-interactive prompt should produce an assistant reply via local `codex exec`.

## Current Status

- Status: Completed
- Current milestone: 3
- Blockers: None

## Completion Notes

- Milestone 1 completed: confirmed local `codex` CLI is installed and supports `codex exec`.
- Milestone 2 completed: replaced backend/OpenAI-compatible HTTP flow with local `codex exec` subprocess flow.
- Milestone 3 completed: verified the script returns a local Codex response without requiring `BACKEND_OPENAI_BASE_URL`.
