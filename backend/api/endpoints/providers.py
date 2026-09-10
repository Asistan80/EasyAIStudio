"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/providers.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from fastapi import APIRouter

router = APIRouter()


PROVIDERS = [

    {
        "id": "openai",
        "name": "OpenAI",
        "enabled": True,
        "local": False,
        "models": [
            "gpt-5.5",
            "gpt-5.5-mini"
        ]
    },

    {
        "id": "ollama",
        "name": "Ollama",
        "enabled": True,
        "local": True,
        "models": []
    },

    {
        "id": "lmstudio",
        "name": "LM Studio",
        "enabled": True,
        "local": True,
        "models": []
    },

    {
        "id": "openrouter",
        "name": "OpenRouter",
        "enabled": True,
        "local": False,
        "models": []
    },

    {
        "id": "anthropic",
        "name": "Anthropic",
        "enabled": False,
        "local": False,
        "models": []
    },

    {
        "id": "google",
        "name": "Google Gemini",
        "enabled": False,
        "local": False,
        "models": []
    }

]


@router.get("/")
async def get_providers():

    return {

        "count": len(PROVIDERS),

        "providers": PROVIDERS

    }


@router.get("/{provider_id}")
async def get_provider(provider_id: str):

    for provider in PROVIDERS:

        if provider["id"] == provider_id:

            return provider

    return {

        "success": False,

        "message": "Provider not found."

    }


@router.get("/default/current")
async def get_default_provider():

    return {

        "provider": "openai"

    }