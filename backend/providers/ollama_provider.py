"""
==========================================================
Easy AI Studio
File    : backend/providers/ollama_provider.py
Version : 1.0.0
==========================================================
"""

from __future__ import annotations

import httpx

from providers.base_provider import BaseProvider
from schemas.image import ImageRequest, ImageResponse


class OllamaProvider(BaseProvider):

    provider_name = "Ollama"

    def __init__(self) -> None:

        self.base_url = "http://127.0.0.1:11434"

    async def initialize(self) -> None:
        return

    async def health(self) -> bool:

        try:

            async with httpx.AsyncClient(timeout=5) as client:

                response = await client.get(
                    f"{self.base_url}/api/tags"
                )

                return response.status_code == 200

        except Exception:

            return False

    async def models(self):

        async with httpx.AsyncClient(timeout=10) as client:

            response = await client.get(
                f"{self.base_url}/api/tags"
            )

            response.raise_for_status()

            data = response.json()

            return data.get("models", [])

    async def generate_image(
        self,
        request: ImageRequest,
    ) -> ImageResponse:

        raise NotImplementedError(
            "Current Ollama models do not generate images. "
            "Use ComfyUI or a diffusion provider."
        )

    async def generate_text(
        self,
        prompt: str,
        model: str = "llama3",
    ) -> str:

        async with httpx.AsyncClient(timeout=300) as client:

            response = await client.post(

                f"{self.base_url}/api/generate",

                json={

                    "model": model,

                    "prompt": prompt,

                    "stream": False

                }

            )

            response.raise_for_status()

            data = response.json()

            return data.get(
                "response",
                "",
            )

    async def generate_video(
        self,
        request,
    ):

        raise NotImplementedError(
            "Video generation is not supported."
        )