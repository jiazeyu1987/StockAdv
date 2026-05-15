# Bug Regression Evidence

## Bug

`openai_chat_smoke.py` authenticated successfully but printed an intermediate `{"runId":"...","status":"in_flight"}` payload instead of the final assistant reply.

## Expected

The script should print the final assistant message returned by the OpenAI-compatible chat completion endpoint.

## Reproduction

`python openai_chat_smoke.py --api-key "replace-with-proxy-access-token" "Reply with exactly: pong"`

## Root Cause

The SDK-based request path against this backend surfaced an intermediate in-flight payload, while a direct authenticated HTTP POST to the same OpenAI-compatible endpoint returned a completed chat response body with final assistant content.

## Regression Test Added Or Updated

Updated `tests/test_openai_chat_smoke.py` to cover chat endpoint URL normalization to `/v1/chat/completions`, extraction of assistant content from a completed chat completion payload, and printing the final assistant message from the direct HTTP request path.

RED:

- `python -m unittest tests.test_openai_chat_smoke`
- Expected failure before the fix:
  - missing `chat_completions_url(...)`
  - missing `extract_assistant_text(...)`
  - `send_message(...)` did not accept the HTTP-based arguments needed for the final-response path

GREEN:

- `python -m unittest tests.test_openai_chat_smoke` -> PASS
- `python -m py_compile openai_chat_smoke.py tests\test_openai_chat_smoke.py` -> PASS
- `python openai_chat_smoke.py --api-key "replace-with-proxy-access-token" "Reply with exactly: pong"` -> PASS, printed `Assistant> pong`

## Verification

Scope is limited to the smoke script request path. Health check behavior, base URL normalization, and backend token handling remain intact. The script now relies on the backend returning a completed OpenAI-compatible JSON body for non-streaming requests, which matches the verified live behavior on 2026-05-15.

## Blockers

None.
