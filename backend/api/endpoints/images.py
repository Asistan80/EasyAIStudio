"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/images.py
Version : 2.0.0
==========================================================
"""

from fastapi import APIRouter

from schemas.image import ImageRequest, ImageResponse
from services.image_service import image_service


router = APIRouter(
    tags=["Images"],
)


@router.post(
    "/generate",
    response_model=ImageResponse,
)
async def generate_image(
    request: ImageRequest,
) -> ImageResponse:

    print("1- Endpoint başladı")

    result = await image_service.generate(request)

    print("2- image_service bitti")

    return result