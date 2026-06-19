
# Remove-Item Env:SSL_CERT_FILE
using_openai = False

if using_openai:
    from openai import OpenAI

    client = OpenAI(
        base_url="http://34.121.13.107:8000/v1",
        api_key="sk-bridge-1MSUK2XtNbW2TkBtd8E6HOj8WjDviJSeq2IRaWvTLVI",
    )
    resp = client.chat.completions.create(
        model="claude-opus-4-7",
        messages=[{"role": "user", "content": "Hello introduce yourself."}],
    )

    print(resp.choices[0].message.content)

else:

    from anthropic import Anthropic

    client = Anthropic(
        base_url="http://34.121.13.107:8000",  # no /v1 — SDK adds it
        api_key="sk-bridge-1MSUK2XtNbW2TkBtd8E6HOj8WjDviJSeq2IRaWvTLVI",
    )
    resp = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=200,
        messages=[{"role": "user", "content": "Hello, introduce yourself."}],
    )
    print(resp.content[0].text)
