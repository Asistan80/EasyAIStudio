"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/models.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from fastapi import APIRouter


router = APIRouter()


MODELS = {

    "openai": [

        {
            "id": "gpt-5.5",
            "name": "GPT-5.5",
            "type": "chat"
        },

        {
            "id": "gpt-5.5-mini",
            "name": "GPT-5.5 Mini",
            "type": "chat"
        }

    ],

    "ollama": [],

    "lmstudio": [],

    "openrouter": [],

    "anthropic": [],

    "google": []

}


@router.get("/")
async def get_all_models():

    return MODELS


@router.get("/{provider}")
async def get_provider_models(provider: str):

    provider = provider.lower()

    return {

        "provider": provider,

        "count": len(

            MODELS.get(

                provider,

                []

            )

        ),

        "models": MODELS.get(

            provider,

            []

        )

    }


@router.get("/{provider}/{model_id}")
async def get_model(

    provider: str,

    model_id: str

):

    provider = provider.lower()

    for model in MODELS.get(

        provider,

        []

    ):

        if model["id"] == model_id:

            return model

    return {

        "success": False,

        "message": "Model not found."

    }