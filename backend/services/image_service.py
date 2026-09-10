"""
==========================================================
Easy AI Studio
File    : backend/services/image_service.py
Version : 3.0.0
==========================================================
"""

from schemas.image import (
    ImageRequest,
    ImageResponse,
)

from services.provider_service import provider_service


class ImageService:

    async def generate(
        self,
        request: ImageRequest,
    ) -> ImageResponse:

        provider = provider_service.manager().get(
            request.provider
        )

        return await provider.generate_image(
            request
        )


image_service = ImageService()