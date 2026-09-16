"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/audio.py
Version : 1.0.0
==========================================================
"""

from fastapi import APIRouter

from services.sound_service import sound_service


router = APIRouter()


@router.post("/generate-sfx")
async def generate_sfx(data: dict):

    prompt = data.get("prompt", "")

    duration = data.get("duration")

    result = await sound_service.generate_sound_effect(
        prompt=prompt,
        duration=duration,
        prompt_influence=data.get("prompt_influence"),
    )

    return result
