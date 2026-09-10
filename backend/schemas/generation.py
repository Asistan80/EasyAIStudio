"""
==========================================================
Easy AI Studio
File    : backend/schemas/generation.py
Version : 2.0.0
==========================================================
"""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class GenerationRequest(BaseModel):
    """
    Base generation request used by every AI provider.
    """

    provider: str | None = None

    model: str | None = None

    prompt: str = Field(
        ...,
        min_length=1,
        max_length=10000,
    )

    negative_prompt: str = ""

    width: int = 1024

    height: int = 1024

    steps: int = 30

    cfg: float = 7.5

    seed: int = -1

    extra: dict[str, Any] = {}


class GenerationResponse(BaseModel):
    """
    Standard response returned by every provider.
    """

    success: bool

    provider: str

    model: str | None = None

    output: str | None = None

    message: str | None = None

    metadata: dict[str, Any] = {}