# Task: Fix In-Flight Response Handling In openai_chat_smoke.py

## Goal

Update `openai_chat_smoke.py` so it prints the final assistant reply instead of an intermediate `{"runId":"...","status":"in_flight"}` payload when calling the public backend.

## Milestones

1. Reproduce the current `in_flight` response behavior and identify the request path that already returns the final answer.
2. Add regression tests for the final-response extraction path.
3. Replace the SDK-based request path with the minimal HTTP request path that returns the final assistant content.
4. Verify the fix and record bug-regression evidence.

## Expected Verification

- A prompt sent through `openai_chat_smoke.py` with a valid proxy token should print the final assistant content rather than `in_flight` status JSON.
- Regression tests should fail before the fix and pass after it.
- Bug evidence should satisfy the bug regression contract.

## Current Status

- Status: Completed
- Current milestone: 4
- Blockers: None

## Completion Notes

- Milestone 1 completed: reproduced that the SDK-based path authenticated successfully but surfaced `{"runId":"...","status":"in_flight"}` instead of the final assistant reply, while a direct HTTP POST to the same endpoint returned completed content.
- Milestone 2 completed: added regression coverage for chat endpoint URL construction, assistant content extraction, and final reply printing from a completed HTTP response.
- Milestone 3 completed: replaced the SDK request path with a direct `httpx` POST to `/v1/chat/completions`, preserving the same authentication and prompt payload.
- Milestone 4 completed: unit tests, bytecode compilation, live backend verification, and bug-regression evidence validation all passed.
