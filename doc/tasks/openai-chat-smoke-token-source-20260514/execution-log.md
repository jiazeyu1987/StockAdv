# Execution Log

## 2026-05-14

- Task created for removing the implicit `OPENAI_API_KEY` fallback from `openai_chat_smoke.py`.
- BDD: missing backend proxy token fails fast -> Given `BACKEND_ACCESS_TOKEN` is unset and only `OPENAI_API_KEY` exists / When the script parses defaults or starts without `--api-key` / Then it should report the missing proxy-token prerequisite instead of sending the OpenAI key to the backend proxy.
- BDD: backend proxy token remains the default credential source -> Given `BACKEND_ACCESS_TOKEN` is set / When the script parses default arguments / Then it should use that token as `--api-key`.
- RED: `python -m unittest tests.test_openai_chat_smoke` -> FAIL, the parser still used `OPENAI_API_KEY` as a fallback when `BACKEND_ACCESS_TOKEN` was missing.
- RED: `python openai_chat_smoke.py "Reply with exactly: pong"` -> FAIL, request reached the backend but returned HTTP `401 Unauthorized` with `invalid_api_key` because the wrong credential source was used.
- Implementation:
  - Removed `OPENAI_API_KEY` fallback from the `--api-key` parser default.
  - Kept explicit `--api-key` support so a valid backend proxy token can still be passed on demand.
- GREEN: `python -m unittest tests.test_openai_chat_smoke` -> PASS
- GREEN: `python -m py_compile openai_chat_smoke.py tests\test_openai_chat_smoke.py` -> PASS
- GREEN: `Remove-Item Env:BACKEND_ACCESS_TOKEN -ErrorAction SilentlyContinue; $env:OPENAI_API_KEY='sk-test-openai-key'; python openai_chat_smoke.py "ping"` -> FAIL-FAST with `Set BACKEND_ACCESS_TOKEN or pass --api-key with backend_app PROXY_ACCESS_TOKEN.`
