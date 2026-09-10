"""
==========================================================
Easy AI Studio
File    : backend/config/settings.py
Version : 1.0.0
==========================================================
"""

from pathlib import Path

from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict
)


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):

    #
    # Application
    #

    APP_NAME: str = "Easy AI Studio"

    APP_VERSION: str = "1.0.0"

    APP_DESCRIPTION: str = (
        "Create. Animate. Share."
    )

    HOST: str = "127.0.0.1"

    PORT: int = 8000

    DEBUG: bool = True

    API_PREFIX: str = "/api"

    LOG_LEVEL: str = "INFO"

    #
    # Base Directory
    #
    # FFmpegService and other backend services
    # use settings.BASE_DIR to resolve local paths.
    #

    BASE_DIR: Path = BASE_DIR

    #
    # Directories
    #

    FRONTEND_DIR: Path = (
        BASE_DIR
        / "frontend"
    )

    GALLERY_DIR: Path = (
        BASE_DIR
        / "gallery"
    )

    EXPORTS_DIR: Path = (
        BASE_DIR
        / "exports"
    )

    PROMPTS_DIR: Path = (
        BASE_DIR
        / "prompts"
    )

    SETTINGS_DIR: Path = (
        BASE_DIR
        / "settings"
    )

    TESTS_DIR: Path = (
        BASE_DIR
        / "tests"
    )

    #
    # ComfyUI
    #

    COMFYUI_HOST: str = "127.0.0.1"

    COMFYUI_PORT: int = 8188

    COMFYUI_TIMEOUT: int = 900

    #
    # Image workflow
    #

    COMFYUI_WORKFLOW: Path = (
        BASE_DIR
        / "backend"
        / "workflows"
        / "workflow_api.json"
    )

    #
    # Video workflow
    #

    COMFYUI_VIDEO_WORKFLOW: Path = (
        BASE_DIR
        / "backend"
        / "workflows"
        / "text_to_video_wan.json"
    )

    COMFYUI_OUTPUT_DIR: Path = (
        BASE_DIR
        / "gallery"
    )

    #
    # Environment / Settings
    #

    model_config = SettingsConfigDict(

        env_file=BASE_DIR / ".env",

        env_file_encoding="utf-8",

        case_sensitive=True,

        extra="ignore"

    )

    #
    # FFmpeg
    #

    FFMPEG_PATH: str = "ffmpeg"

    FFPROBE_PATH: str = "ffprobe"

    FFMPEG_TIMEOUT: int = 3600

    FFMPEG_THREADS: int = 0

    FFMPEG_LOGLEVEL: str = "info"

    #
    # Render / Cache
    #

    TEMP_RENDER_DIR: Path = (
        BASE_DIR
        / "temp"
        / "render"
    )

    CACHE_DIR: Path = (
        BASE_DIR
        / "cache"
    )


settings = Settings()


#
# Ensure required directories exist
#

settings.GALLERY_DIR.mkdir(
    parents=True,
    exist_ok=True
)

settings.EXPORTS_DIR.mkdir(
    parents=True,
    exist_ok=True
)

settings.PROMPTS_DIR.mkdir(
    parents=True,
    exist_ok=True
)

settings.SETTINGS_DIR.mkdir(
    parents=True,
    exist_ok=True
)

settings.COMFYUI_OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

settings.TEMP_RENDER_DIR.mkdir(
    parents=True,
    exist_ok=True
)

settings.CACHE_DIR.mkdir(
    parents=True,
    exist_ok=True
)