"""
==========================================================
Easy AI Studio
File    : backend/services/gif_service.py
Version : 1.0.0
==========================================================
"""

from __future__ import annotations

import subprocess
import uuid
from pathlib import Path

from config.settings import settings
from services.ffmpeg_service import FFmpegService


def _find_input_file(filename: str) -> Path | None:

    candidates = [
        settings.TEMP_RENDER_DIR / filename,
        settings.EXPORTS_DIR / filename,
    ]

    for candidate in candidates:
        if candidate.exists():
            return candidate

    return None


class GifService:

    def __init__(self):
        self.ffmpeg = FFmpegService()

    def generate_gif_from_video(
        self,
        filename: str,
        start: float = 0.0,
        duration: float = 3.0,
        fps: int = 12,
        width: int = 480,
    ) -> dict:

        if not filename:
            return {"success": False, "message": "No input video was provided."}

        input_path = _find_input_file(filename)

        if input_path is None:
            return {
                "success": False,
                "message": f"Input video not found: {filename}",
            }

        if not self.ffmpeg.ffmpeg_path:
            return {
                "success": False,
                "message": "FFmpeg binary was not found on this system.",
            }

        start = max(0.0, float(start))
        duration = max(0.2, min(30.0, float(duration)))
        fps = max(1, min(30, int(fps)))
        width = max(64, min(1280, int(width)))

        unique = uuid.uuid4().hex[:8]

        palette_path = settings.EXPORTS_DIR / f"gif_palette_{unique}.png"
        output_filename = f"auto_gif_{unique}.gif"
        output_path = settings.EXPORTS_DIR / output_filename

        vf_scale = f"fps={fps},scale={width}:-1:flags=lanczos"

        palette_cmd = [
            self.ffmpeg.ffmpeg_path,
            "-y",
            "-ss", str(start),
            "-t", str(duration),
            "-i", str(input_path),
            "-vf", f"{vf_scale},palettegen",
            str(palette_path),
        ]

        gif_cmd = [
            self.ffmpeg.ffmpeg_path,
            "-y",
            "-ss", str(start),
            "-t", str(duration),
            "-i", str(input_path),
            "-i", str(palette_path),
            "-filter_complex", f"{vf_scale}[x];[x][1:v]paletteuse",
            str(output_path),
        ]

        try:

            subprocess.run(
                palette_cmd,
                capture_output=True,
                check=True,
            )

            subprocess.run(
                gif_cmd,
                capture_output=True,
                check=True,
            )

        except subprocess.CalledProcessError as exc:

            stderr = exc.stderr.decode("utf-8", errors="ignore") if exc.stderr else ""

            return {
                "success": False,
                "message": f"FFmpeg failed: {stderr[-500:]}",
            }

        finally:

            if palette_path.exists():
                palette_path.unlink()

        if not output_path.exists():
            return {"success": False, "message": "GIF was not created."}

        return {
            "success": True,
            "output": f"/exports/{output_filename}",
            "filename": output_filename,
            "message": "GIF generated successfully.",
        }


gif_service = GifService()
