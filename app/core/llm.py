import json
import httpx
import boto3
from app.core.config import settings


# ==============================
# GROQ IMPLEMENTATION
# ==============================
async def call_groq(prompt: str) -> str:
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is missing")

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    body = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=body
        )

    # DEBUG PRINT
    if response.status_code != 200:
        print("==== GROQ ERROR ====")
        print("Status:", response.status_code)
        print("Body:", response.text)
        raise RuntimeError("Groq API request failed")

    data = response.json()

    return data["choices"][0]["message"]["content"]
# ==============================
# BEDROCK IMPLEMENTATION
# ==============================

async def call_bedrock(prompt: str) -> str:
    client = boto3.client(
        service_name="bedrock-runtime",
        region_name=settings.AWS_REGION
    )

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "max_tokens": 1000
    }

    response = client.invoke_model(
        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
        body=json.dumps(body)
    )

    result = json.loads(response["body"].read())

    try:
        return result["content"][0]["text"]
    except Exception:
        raise RuntimeError("Unexpected Bedrock response format")


# ==============================
# MAIN ROUTER FUNCTION
# ==============================

async def call_llm(prompt: str) -> str:
    provider = settings.LLM_PROVIDER.lower()

    if provider == "groq":
        return await call_groq(prompt)

    elif provider == "bedrock":
        return await call_bedrock(prompt)

    else:
        raise ValueError(f"Unsupported LLM_PROVIDER: {provider}")