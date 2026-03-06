import json
import httpx
import boto3
from typing import AsyncGenerator, Optional
from app.core.config import settings
from app.core.persona import build_persona_system_prompt

# ==============================
# GROQ IMPLEMENTATION
# ==============================
async def call_groq(prompt: str, system_prompt: str | None = None) -> str:
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is missing")

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    messages = []

    if system_prompt:
        messages.append({
            "role": "system",
            "content": system_prompt
        })

    messages.append({
        "role": "user",
            "content": prompt
    })

    body = {
        "model": "llama-3.1-8b-instant",
        "messages": messages,
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


async def stream_groq(
    prompt: str,
    system_prompt: str | None = None
) -> AsyncGenerator[str, None]:
    """
    Stream response from Groq API.

    Args:
        prompt: User prompt content.
        system_prompt: Optional system-level persona instruction.

    Yields:
        Text chunks as they arrive from Groq.
    """

    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is missing")

    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    # Build message list with proper role hierarchy
    messages = []

    if system_prompt:
        messages.append({
            "role": "system",
            "content": system_prompt
        })

    messages.append({
        "role": "user",
        "content": prompt
    })

    body = {
        "model": "llama-3.1-8b-instant",
        "messages": messages,
        "temperature": 0.7,
        "stream": True
    }

    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream(
            "POST",
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=body,
        ) as response:

            if response.status_code != 200:
                raise RuntimeError(
                    f"Groq streaming failed: {response.status_code} - {await response.aread()}"
                )

            async for line in response.aiter_lines():
                if not line:
                    continue

                if line.startswith("data: "):
                    data = line[len("data: "):]

                    if data.strip() == "[DONE]":
                        break

                    try:
                        parsed = json.loads(data)
                        delta = parsed["choices"][0]["delta"]

                        if "content" in delta:
                            yield delta["content"]

                    except Exception:
                        # Ignore malformed chunks silently
                        continue


# ==============================
# BEDROCK IMPLEMENTATION
# ==============================

async def call_bedrock(prompt: str, system_prompt: str | None = None) -> str:
    client = boto3.client(
        service_name="bedrock-runtime",
        region_name=settings.AWS_REGION
    )

    messages = []

    if system_prompt:
        messages.append({
            "role": "system",
            "content": system_prompt
        })

    messages.append({
        "role": "user",
        "content": prompt
    })

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "messages": messages,
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


async def stream_bedrock(
    prompt: str,
    system_prompt: str | None = None
) -> AsyncGenerator[str, None]:
    """
    Stream response from Bedrock (Claude) with optional system persona.
    """

    client = boto3.client(
        service_name="bedrock-runtime",
        region_name=settings.AWS_REGION
    )

    # Build message hierarchy properly
    messages = []

    if system_prompt:
        messages.append({
            "role": "system",
            "content": system_prompt
        })

    messages.append({
        "role": "user",
        "content": prompt
    })

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "messages": messages,
        "max_tokens": 1000,
        "stream": True
    }

    response = client.invoke_model_with_response_stream(
        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
        body=json.dumps(body)
    )

    try:
        for event in response["body"]:
            chunk = json.loads(event["chunk"]["bytes"])

            if "content_block_delta" in chunk:
                delta = chunk["content_block_delta"]

                if "text" in delta:
                    yield delta["text"]

    except Exception as e:
        raise RuntimeError(f"Bedrock streaming failed: {str(e)}")

# ==============================
# MAIN ROUTER FUNCTION
# ==============================

async def call_llm(prompt: str, persona: Optional[str] = None) -> str:
    """
    Call LLM with optional persona-aware prompt wrapping.
    
    Args:
        prompt: The task prompt
        persona: Optional persona type (beginner, student, senior_dev). Defaults to None (no persona wrapping)
        
    Returns:
        LLM response text
    """
    # Wrap prompt with persona system prompt if persona specified  
    provider = settings.LLM_PROVIDER.lower()

    if provider == "groq":
        if persona:
            persona_system = build_persona_system_prompt(persona)
            return await call_groq(prompt, system_prompt=persona_system)
        else:
            return await call_groq(prompt)

    elif provider == "bedrock":
        if persona:
            persona_system = build_persona_system_prompt(persona)
            return await call_bedrock(prompt, system_prompt=persona_system)
        else:
            return await call_bedrock(prompt)

    else:
        raise ValueError(f"Unsupported LLM_PROVIDER: {provider}")


async def stream_llm(prompt: str, persona: Optional[str] = None) -> AsyncGenerator[str, None]:
    """
    Stream LLM response based on configured provider with optional persona wrapping.
    
    Args:
        prompt: The prompt to send to the LLM
        persona: Optional persona type (beginner, student, senior_dev). Defaults to None (no persona wrapping)
        
    Yields:
        Text chunks as they arrive from the LLM
        
    Raises:
        ValueError: If provider is unsupported
        RuntimeError: If streaming fails
    """
    # Wrap prompt with persona system prompt if persona specified   
    provider = settings.LLM_PROVIDER.lower()

    if provider == "groq":
        if persona:
            persona_system = build_persona_system_prompt(persona)
            async for chunk in stream_groq(prompt, system_prompt=persona_system):
                yield chunk
        else:
            async for chunk in stream_groq(prompt):
                yield chunk

    elif provider == "bedrock":
        if persona:
            persona_system = build_persona_system_prompt(persona)
            async for chunk in stream_bedrock(prompt, system_prompt=persona_system):
                yield chunk
        else:
            async for chunk in stream_bedrock(prompt):
                yield chunk

    else:
        raise ValueError(f"Unsupported LLM_PROVIDER: {provider}")