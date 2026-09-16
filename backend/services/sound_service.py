"""
==========================================================
Easy AI Studio
File    : backend/services/sound_service.py
Version : 1.0.0
==========================================================
"""

from __future__ import annotations

import re
import uuid
from datetime import datetime
from pathlib import Path

import httpx

from config.settings import settings


ELEVENLABS_URL = "https://api.elevenlabs.io/v1/sound-generation"


def _safe_filename(prompt: str) -> str:
    base = re.sub(r"[^a-zA-Z0-9]+", "_", prompt.strip().lower())[:40].strip("_") or "sound"
    unique = uuid.uuid4().hex[:8]
    return f"sfx_{base}_{unique}.mp3"

class SoundService:

       async def generate_sound_effect(self, prompt: str, duration: float | None = None, prompt_influence: float | None = None) -> dict:

        if not settings.ELEVENLABS_API_KEY:
            return {"success": False, "message": "ELEVENLABS_API_KEY is not configured in the .env file."}

        if not prompt or not prompt.strip():
            return {"success": False, "message": "Prompt is required."}

        payload = {
            "text": prompt.strip(),
        }

        if prompt_influence is not None:
            payload["prompt_influence"] = max(0.0, min(1.0, float(prompt_influence)))

        if duration:
            payload["duration_seconds"] = max(0.5, min(30.0, float(duration)))

        headers = {
            "xi-api-key": settings.ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(ELEVENLABS_URL, json=payload, headers=headers)

            if response.status_code != 200:
                message = f"ElevenLabs API error ({response.status_code}): {response.text[:300]}"
                return {"success": False, "message": message}

            audio_bytes = response.content
            filename = _safe_filename(prompt)
            output_path: Path = settings.EXPORTS_DIR / filename
            output_path.write_bytes(audio_bytes)

            return {
                "success": True,
                "output": f"/exports/{filename}",
                "filename": filename,
                "prompt": prompt,
                "duration": duration,
                "provider": "ElevenLabs",
                "created_at": datetime.now().isoformat(),
                "message": "Sound effect generated successfully.",
            }

        except httpx.RequestError as exc:
            return {"success": False, "message": f"Could not reach ElevenLabs API: {exc}"}

        except Exception as exc:
            return {"success": False, "message": str(exc)}


sound_service = SoundService()