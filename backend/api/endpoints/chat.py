"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/chat.py
Version : 2.0.0
Sprint  : 10
==========================================================
"""

from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from services.provider_service import provider_service


router = APIRouter()


CHAT_HISTORY = []


@router.get("/")
async def get_history():
    """
    Return chat history.
    """

    return {
        "count": len(CHAT_HISTORY),
        "history": CHAT_HISTORY
    }


@router.post("/")
async def send_message(data: dict):
    """
    Send a message to the selected AI provider.
    """

    provider_name = data.get(
        "provider",
        "Ollama"
    )

    model = data.get(
        "model",
        "llama3"
    )

    message_text = data.get(
        "message",
        ""
    )

    if not message_text:
        raise HTTPException(
            status_code=422,
            detail="Message cannot be empty."
        )

    # ------------------------------------------------------
    # User message
    # ------------------------------------------------------

    user_message = {
        "id": str(uuid4()),
        "provider": provider_name,
        "model": model,
        "role": "user",
        "content": message_text,
        "created_at": datetime.now().isoformat()
    }

    CHAT_HISTORY.append(
        user_message
    )

    try:

        # --------------------------------------------------
        # Get the REAL provider manager
        # --------------------------------------------------

        manager = provider_service.manager()

        # --------------------------------------------------
        # Provider names are registered as:
        # "Ollama", "Mock", "ComfyUI", etc.
        #
        # Accept lowercase API values such as:
        # "ollama"
        # --------------------------------------------------

        normalized_provider = {
            "ollama": "Ollama",
            "openai": "OpenAI",
            "anthropic": "Anthropic",
            "google": "Google",
            "gemini": "Google",
            "openrouter": "OpenRouter",
            "lmstudio": "LM Studio",
            "comfyui": "ComfyUI",
            "mock": "Mock"
        }.get(
            provider_name.lower(),
            provider_name
        )

        # --------------------------------------------------
        # Check provider
        # --------------------------------------------------

        if not manager.exists(
            normalized_provider
        ):
            raise HTTPException(
                status_code=500,
                detail=(
                    f"Provider '{provider_name}' "
                    "is not available."
                )
            )

        provider = manager.get(
            normalized_provider
        )

        # --------------------------------------------------
        # Generate response
        #
        # OllamaProvider currently exposes:
        #
        # generate_text(
        #     prompt,
        #     model
        # )
        # --------------------------------------------------

        if normalized_provider == "Ollama":

            recent_history = CHAT_HISTORY[-10:]

            context_lines = [
                f"{item['role']}: {item['content']}"
                for item in recent_history
            ]

            full_prompt = "\n".join(context_lines)

            answer = await provider.generate_text(
                prompt=full_prompt,
                model=model
            )

        else:

            # ------------------------------------------------
            # Other providers may use the generic interface.
            # ------------------------------------------------

            result = await provider.generate_text(
                {
                    "prompt": message_text,
                    "model": model
                }
            )

            if isinstance(
                result,
                dict
            ):

                answer = result.get(
                    "text",
                    result.get(
                        "response",
                        ""
                    )
                )

            else:

                answer = str(
                    result
                )

        # --------------------------------------------------
        # Assistant message
        # --------------------------------------------------

        assistant_message = {
            "id": str(uuid4()),
            "provider": normalized_provider,
            "model": model,
            "role": "assistant",
            "content": answer,
            "created_at": datetime.now().isoformat()
        }

        CHAT_HISTORY.append(
            assistant_message
        )

        # --------------------------------------------------
        # Response
        # --------------------------------------------------

        return {
            "success": True,
            "message": user_message,
            "response": assistant_message
        }

    except HTTPException:
        raise

    except Exception as exc:

        error_message = {
            "id": str(uuid4()),
            "provider": normalized_provider
            if "normalized_provider" in locals()
            else provider_name,
            "model": model,
            "role": "assistant",
            "content": (
                "Provider error: "
                f"{str(exc)}"
            ),
            "created_at": datetime.now().isoformat()
        }

        CHAT_HISTORY.append(
            error_message
        )

        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": str(exc)
            }
        )


@router.delete("/")
async def clear_history():
    """
    Clear chat history.
    """

    CHAT_HISTORY.clear()

    return {
        "success": True,
        "message": "Chat history cleared."
    }