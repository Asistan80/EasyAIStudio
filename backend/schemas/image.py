"""
==========================================================
Easy AI Studio
File    : backend/schemas/image.py
Version : 2.0.0
==========================================================
"""

from pydantic import BaseModel, Field


class ImageRequest(BaseModel):

    prompt: str = Field(..., min_length=1)

    negative_prompt: str = ""

    width: int = 1024

    height: int = 1024

    steps: int = 30

    cfg: float = 7.5

    seed: int = -1

    provider: str | None = None

    model: str = ""

    sampler: str = ""

    scheduler: str = ""

    batch_size: int = 1

class ImageResponse(BaseModel):

    success: bool

    provider: str

    image: str

    prompt: str

    negative_prompt: str = ""

    model: str = ""

    width: int = 0

    height: int = 0

    steps: int = 0

    cfg: float = 0

    seed: int = 0