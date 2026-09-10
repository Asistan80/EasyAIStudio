"""
==========================================================
Easy AI Studio
File    : backend/services/bootstrap.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from services.provider_manager import provider_manager
from services.model_manager import model_manager
from services.service_registry import service_registry


def bootstrap():

    provider_manager.clear()

    model_manager.clear()

    provider_manager.register(

        "openai",

        {

            "id": "openai",

            "name": "OpenAI",

            "enabled": True,

            "local": False

        }

    )

    provider_manager.register(

        "ollama",

        {

            "id": "ollama",

            "name": "Ollama",

            "enabled": True,

            "local": True

        }

    )

    provider_manager.register(

        "lmstudio",

        {

            "id": "lmstudio",

            "name": "LM Studio",

            "enabled": True,

            "local": True

        }

    )

    provider_manager.register(

        "openrouter",

        {

            "id": "openrouter",

            "name": "OpenRouter",

            "enabled": True,

            "local": False

        }

    )

    model_manager.register_many(

        "openai",

        [

            {

                "id": "gpt-5.5",

                "name": "GPT-5.5"

            },

            {

                "id": "gpt-5.5-mini",

                "name": "GPT-5.5 Mini"

            }

        ]

    )

    return {

        "success": True,

        "providers": provider_manager.count(),

        "models": model_manager.count(),

        "services": service_registry.count()

    }


bootstrap()