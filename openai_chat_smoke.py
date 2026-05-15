from __future__ import annotations

import argparse
import os
from urllib.parse import urlsplit, urlunsplit

import httpx

DEFAULT_BACKEND_OPENAI_BASE_URL = "http://34.45.206.120:8088/v1"

#
# To start:
# in linux:
#
# cd backend_app
# source .venv/bin/activate
# export BACKEND_OPENAI_BASE_URL="http://34.45.206.120:8088/v1"
# export BACKEND_ACCESS_TOKEN="replace-with-proxy-access-token"
# python examples/openai_chat_smoke.py
#
# powershell:
#
# cd C:\Users\pdhe\PycharmProjects\ladder_capital_value_investing\ladder_capical_value_investing\backend_app
#
# .\.venv\Scripts\Activate.ps1
#
# $env:BACKEND_OPENAI_BASE_URL = "http://34.45.206.120:8088/v1"
# $env:BACKEND_ACCESS_TOKEN = "replace-with-proxy-access-token"
#
# python .\examples\openai_chat_smoke.py
#
# .\.venv\Scripts\python.exe .\examples\openai_chat_smoke.py `
#   --base-url "http://34.45.206.120:8088/v1" `
#   --api-key "replace-with-proxy-access-token"
#
# C:\Users\pdhe\PycharmProjects\ladder_capital_value_investing\.venv\Scripts\python.exe .\examples\openai_chat_smoke.py --base-url "http://34.45.206.120:8088/v1" --api-key "replace-with-proxy-access-token"



def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    if not args.api_key:
        raise SystemExit("Set BACKEND_ACCESS_TOKEN or pass --api-key with backend_app PROXY_ACCESS_TOKEN.")

    base_url = normalize_base_url(args.base_url)
    http_client = httpx.Client(
        trust_env=args.trust_env,
        timeout=httpx.Timeout(args.timeout, connect=10.0),
    )
    if not args.skip_health_check and not check_health(http_client, base_url):
        return

    print(f"Target OpenAI base URL: {base_url}")
    print("Type a message and press Enter. Use Ctrl+C, Ctrl+D, exit, or quit to stop.")

    if args.prompt:
        send_message(http_client, base_url, args.api_key, args.model, args.session_id, args.prompt)

    while True:
        try:
            prompt = input("\nYou> ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye.")
            return

        if not prompt:
            continue
        if prompt.lower() in {"exit", "quit", ":q"}:
            print("Bye.")
            return

        send_message(http_client, base_url, args.api_key, args.model, args.session_id, prompt)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Open an interactive OpenAI-style chat loop with backend_app.")
    parser.add_argument(
        "prompt",
        nargs="?",
        help="Optional first prompt to send before entering interactive mode.",
    )
    parser.add_argument(
        "--base-url",
        default=os.getenv("BACKEND_OPENAI_BASE_URL", DEFAULT_BACKEND_OPENAI_BASE_URL),
        help="backend_app OpenAI base URL. Root URLs are normalized to /v1.",
    )
    parser.add_argument(
        "--api-key",
        default=os.getenv("BACKEND_ACCESS_TOKEN"),
        help="PROXY_ACCESS_TOKEN value for backend_app.",
    )
    parser.add_argument(
        "--session-id",
        default=os.getenv("OPENCLAW_SESSION_ID", "smoke-test"),
        help="Session id forwarded to OpenClaw as the OpenAI user field.",
    )
    parser.add_argument("--model", default="openclaw", help="Model name to send in the OpenAI request.")
    parser.add_argument(
        "--trust-env",
        action="store_true",
        help="Use local proxy and SSL_CERT_FILE environment variables. Disabled by default for easier Windows testing.",
    )
    parser.add_argument(
        "--skip-health-check",
        action="store_true",
        help="Skip the /healthz preflight check and send chat requests directly.",
    )
    parser.add_argument("--timeout", type=float, default=120.0, help="Request timeout in seconds.")
    return parser


def send_message(
    http_client: httpx.Client,
    base_url: str,
    api_key: str,
    model: str,
    session_id: str,
    prompt: str,
) -> None:
    url = chat_completions_url(base_url)
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "user": session_id,
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    try:
        response = http_client.post(url, headers=headers, json=payload)
    except Exception as exc:
        print(f"\nError: {exc}")
        print_exception_chain(exc)
        return

    if response.status_code != 200:
        print(f"\nError: HTTP {response.status_code} - {response.text[:1000]}")
        return

    try:
        completion = response.json()
        assistant_text = extract_assistant_text(completion)
    except ValueError as exc:
        print(f"\nError: {exc}")
        print(f"Response body: {response.text[:1000]}")
        return

    print(f"\nAssistant> {assistant_text}")


def check_health(http_client: httpx.Client, base_url: str) -> bool:
    url = health_url(base_url)
    print(f"Checking backend health: {url}")
    try:
        response = http_client.get(url)
    except httpx.ConnectError as exc:
        print(f"Health check failed: could not connect to {url}")
        print(f"Cause: {exc}")
        print_connection_help(base_url)
        return False
    except httpx.TimeoutException as exc:
        print(f"Health check timed out: {exc}")
        print_connection_help(base_url)
        return False
    except httpx.HTTPError as exc:
        print(f"Health check failed before receiving a response: {exc}")
        print_connection_help(base_url)
        return False

    if response.status_code != 200:
        print(f"Health check returned HTTP {response.status_code}: {response.text[:500]}")
        return False

    print(f"Health check OK: {response.text}")
    return True


def health_url(base_url: str) -> str:
    parts = urlsplit(base_url)
    path = parts.path.rstrip("/")
    if path.endswith("/v1"):
        path = path[: -len("/v1")]
    elif path.endswith("/v1/chat/completions"):
        path = path[: -len("/v1/chat/completions")]

    health_path = f"{path}/healthz" if path else "/healthz"
    return urlunsplit((parts.scheme, parts.netloc, health_path, "", ""))


def chat_completions_url(base_url: str) -> str:
    normalized = normalize_base_url(base_url)
    if normalized.endswith("/chat/completions"):
        return normalized
    return f"{normalized.rstrip('/')}/chat/completions"


def extract_assistant_text(completion: dict) -> str:
    try:
        return completion["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise ValueError("Chat completion response did not contain assistant message content.") from exc


def print_connection_help(base_url: str) -> None:
    parts = urlsplit(base_url)
    host = parts.hostname or "<host>"
    port = parts.port or (443 if parts.scheme == "https" else 80)
    print("")
    print("This means the OpenAI client did not reach backend_app.")
    print(f"From Windows, verify the port with: Test-NetConnection -ComputerName {host} -Port {port}")
    print("On the OpenClaw instance, verify backend_app is listening publicly:")
    print("  curl http://127.0.0.1:8088/healthz")
    print("  ss -ltnp | grep 8088")
    print("  uvicorn app.main:app --host 0.0.0.0 --port 8088")
    print("If curl works on the instance but not from Windows, open the VM/cloud firewall for TCP 8088 or use an SSH tunnel.")
    print("If you run this script on the OpenClaw instance itself, use: --base-url http://127.0.0.1:8088/v1")


def print_exception_chain(exc: BaseException) -> None:
    cause = exc.__cause__ or exc.__context__
    while cause:
        print(f"Caused by: {type(cause).__name__}: {cause}")
        cause = cause.__cause__ or cause.__context__


def normalize_base_url(value: str) -> str:
    parts = urlsplit(value)
    path = parts.path.rstrip("/")
    if path.endswith("/v1"):
        return value.rstrip("/")
    if path.endswith("/v1/chat/completions"):
        path = path[: -len("/chat/completions")]
    else:
        path = f"{path}/v1"
    return urlunsplit((parts.scheme, parts.netloc, path, parts.query, parts.fragment))


if __name__ == "__main__":
    main()
