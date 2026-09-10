"""
==========================================================
Easy AI Studio
File    : backend/providers/mock_provider.py
Version : 3.0.0
==========================================================
"""

from schemas.image import (
    ImageRequest,
    ImageResponse,
)

from providers.base_provider import BaseProvider


class MockProvider(BaseProvider):

    provider_name = "Mock"

    async def initialize(self) -> None:
        return

    async def health(self) -> bool:
        return True

    async def generate_image(
        self,
        request: ImageRequest,
    ) -> ImageResponse:

        return ImageResponse(

    success=True,

    provider=self.provider_name,

    image="demo.png",

    prompt=request.prompt

)

    async def generate_video(
        self,
        request,
    ):

        return {

            "success": True

        }

    async def generate_text(
        self,
        request,
    ):

        return {

            "success": True,

            "text": "Hello Easy AI Studio"

        }

    async def models(self):

        return [

            {

                "id": "mock-image",

                "name": "Mock Image Model"

            }

        ]