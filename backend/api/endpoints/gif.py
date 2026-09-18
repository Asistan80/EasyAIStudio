"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/gif.py
Version : 1.0.0
==========================================================
"""

from fastapi import APIRouter

from services.gif_service import gif_service


router = APIRouter()


@router.post("/auto-generate")
async def auto_generate_gif(data: dict):

    filename = data.get("filename", "")
    start = data.get("start", 0)
    duration = data.get("duration", 3)
    fps = data.get("fps", 12)
    width = data.get("width", 480)

    result = gif_service.generate_gif_from_video(
        filename=filename,
        start=start,
        duration=duration,
        fps=fps,
        width=width,
    )

    return result

