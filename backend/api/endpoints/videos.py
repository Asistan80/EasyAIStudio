"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/videos.py
Version : 1.0.1
Sprint  : 10
==========================================================
"""
from datetime import datetime
from pathlib import Path
from threading import Lock
from uuid import uuid4

from fastapi import (
    APIRouter,
    HTTPException,
)

from config.settings import settings
from services.encoder_service import EncoderService
from services.provider_service import provider_service


router = APIRouter(
    tags=["Videos"],
)


VIDEO_HISTORY: list[dict] = []


# ==========================================================
# Export State
# ==========================================================

encoder_service = EncoderService()

export_lock = Lock()

ACTIVE_EXPORT: dict = {
    "id": None,
    "status": "idle",
    "progress": 0,
    "input": "",
    "output": "",
    "filename": "",
    "message": "",
    "started_at": None,
    "completed_at": None,
}


# ==========================================================
# Helpers
# ==========================================================


def _normalize_provider_name(
    provider_name: str,
) -> str:

    aliases = {
        "comfyui": "ComfyUI",
        "ComfyUI": "ComfyUI",
        "COMFYUI": "ComfyUI",

        "ollama": "Ollama",
        "Ollama": "Ollama",
        "OLLAMA": "Ollama",

        "mock": "Mock",
        "Mock": "Mock",
        "MOCK": "Mock",

        "openai": "ComfyUI",
        "OpenAI": "ComfyUI",
        "OPENAI": "ComfyUI",
    }

    return aliases.get(
        provider_name,
        provider_name,
    )


def _build_video_request(
    data: dict,
) -> dict:

    return {
        "prompt": data.get(
            "prompt",
            "",
        ),

        "negative_prompt": data.get(
            "negative_prompt",
            "",
        ),

        "model": data.get(
            "model",
            "wan2.1_t2v_1.3B",
        ),

        "duration": data.get(
            "duration",
            2,
        ),

        "fps": data.get(
            "fps",
            16,
        ),

        "width": data.get(
            "width",
            832,
        ),

        "height": data.get(
            "height",
            480,
        ),

        "frames": data.get(
            "frames",
        ),

        "seed": data.get(
            "seed",
            -1,
        ),

        "steps": data.get(
            "steps",
            30,
        ),

        "cfg": data.get(
            "cfg",
            6,
        ),
    }


def _copy_provider_result(
    video: dict,
    result: dict,
) -> None:

    video["status"] = result.get(
        "status",
        "failed",
    )

    video["output"] = result.get(
        "output",
        "",
    )

    provider_fields = (
        "prompt_id",
        "message",
        "filename",
        "path",
        "comfyui_output",
    )

    for field in provider_fields:

        if field in result:

            video[field] = result[field]


def _reset_export_state() -> None:

    with export_lock:

        ACTIVE_EXPORT.update(
            {
                "id": None,
                "status": "idle",
                "progress": 0,
                "input": "",
                "output": "",
                "filename": "",
                "message": "",
                "started_at": None,
                "completed_at": None,
            }
        )


def _update_export_progress(
    value,
) -> None:

    # ------------------------------------------------------
    # EncoderService progress is normally a dict:
    # {
    #     "percent": 25.4,
    #     "frame": ...,
    #     "fps": ...,
    #     "time": ...,
    #     ...
    # }
    # ------------------------------------------------------

    if isinstance(value, dict):

        value = (
            value.get("percent")
            if value.get("percent") is not None
            else value.get("progress", 0)
        )

    try:

        progress = float(value)

    except (
        TypeError,
        ValueError,
    ):

        progress = 0

    progress = max(
        0,
        min(
            100,
            progress,
        )
    )

    with export_lock:

        ACTIVE_EXPORT[
            "progress"
        ] = progress

        if (
            ACTIVE_EXPORT["status"]
            == "rendering"
        ):

            ACTIVE_EXPORT[
                "message"
            ] = (
                f"Rendering: "
                f"{progress:.1f}%"
            )

def _export_log(
    message,
) -> None:

    if not message:

        return

    with export_lock:

        ACTIVE_EXPORT[
            "message"
        ] = str(message)


def _resolve_input_path(
    input_path: str,
) -> Path:

    if not input_path:

        raise HTTPException(
            status_code=400,
            detail="Input file is required.",
        )

    raw_path = Path(
        input_path
    )

    candidates = []

    if raw_path.is_absolute():

        candidates.append(
            raw_path
        )

    else:

        candidates.extend(
            [
                settings.TEMP_RENDER_DIR
                / raw_path,

                settings.EXPORTS_DIR
                / raw_path,

                settings.GALLERY_DIR
                / raw_path,

                settings.BASE_DIR
                / raw_path,
            ]
        )

    resolved = None

    for candidate in candidates:

        try:

            candidate_resolved = (
                candidate
                .resolve()
            )

        except Exception:

            continue

        if candidate_resolved.exists():

            resolved = (
                candidate_resolved
            )

            break

    if resolved is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Input file not found: "
                f"{input_path}"
            ),
        )

    if not resolved.is_file():

        raise HTTPException(
            status_code=400,
            detail="Input path is not a file.",
        )

    return resolved


def _normalize_format(
    value: str,
) -> str:

    value = (
        str(value or "mp4")
        .strip()
        .lower()
        .lstrip(".")
    )

    allowed = {
        "mp4",
        "mov",
        "mkv",
        "webm",
        "avi",
    }

    if value not in allowed:

        return "mp4"

    return value


def _normalize_codec(
    value: str,
) -> str | None:

    value = (
        str(value or "")
        .strip()
        .lower()
    )

    aliases = {
        "h264": None,
        "avc": None,
        "avc1": None,

        "h265": None,
        "hevc": None,

        "av1": None,
    }

    if value in aliases:

        return aliases[value]

    if value in {
        "libx264",
        "libx265",
        "libaom-av1",
        "libsvtav1",
        "h264_nvenc",
        "hevc_nvenc",
        "av1_nvenc",
        "h264_amf",
        "hevc_amf",
        "av1_amf",
        "h264_qsv",
        "hevc_qsv",
        "av1_qsv",
    }:

        return value

    return None


def _select_codec(
    codec_name: str,
) -> str:

    normalized = (
        str(codec_name or "")
        .strip()
        .lower()
    )

    if normalized in {
        "",
        "auto",
        "h264",
        "avc",
        "avc1",
    }:

        return (
            encoder_service
            .ffmpeg
            .get_best_h264_encoder()
        )

    if normalized in {
        "h265",
        "hevc",
    }:

        return (
            encoder_service
            .ffmpeg
            .get_best_h265_encoder()
        )

    if normalized == "av1":

        return (
            encoder_service
            .ffmpeg
            .get_best_av1_encoder()
        )

    explicit = _normalize_codec(
        normalized
    )

    if explicit:

        return explicit

    return (
        encoder_service
        .ffmpeg
        .get_best_h264_encoder()
    )


def _normalize_bitrate(
    value,
) -> str:

    if value is None:

        return "20M"

    if isinstance(
        value,
        str,
    ):

        text = (
            value
            .strip()
            .upper()
        )

        if text.endswith(
            ("K", "M", "G")
        ):

            return text

        try:

            value = float(
                text
            )

        except ValueError:

            return "20M"

    try:

        numeric = float(
            value
        )

    except (
        TypeError,
        ValueError,
    ):

        return "20M"

    # ExportPanel uses Mbps.
    if numeric <= 120:

        return (
            f"{numeric:g}M"
        )

    # Store/backend may use kbps.
    if numeric <= 120000:

        return (
            f"{numeric / 1000:g}M"
        )

    return "20M"


def _build_output_path(
    filename: str,
    extension: str,
) -> Path:

    safe_name = Path(
        filename or "EasyAIStudio_Render"
    ).name

    if not safe_name:

        safe_name = (
            "EasyAIStudio_Render"
        )

    if safe_name.lower().endswith(
        f".{extension}"
    ):

        final_name = safe_name

    else:

        final_name = (
            f"{safe_name}.{extension}"
        )

    settings.EXPORTS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    output = (
        settings.EXPORTS_DIR
        / final_name
    )

    if output.exists():

        timestamp = datetime.now().strftime(
            "%Y%m%d_%H%M%S"
        )

        stem = Path(
            final_name
        ).stem

        output = (
            settings.EXPORTS_DIR
            / (
                f"{stem}_"
                f"{timestamp}."
                f"{extension}"
            )
        )

    return output


def _export_finished(
    job_id: str,
    output_path: Path,
) -> None:

    with export_lock:

        ACTIVE_EXPORT[
            "progress"
        ] = 100

        ACTIVE_EXPORT[
            "status"
        ] = "completed"

        ACTIVE_EXPORT[
            "message"
        ] = (
            "Export completed successfully."
        )

        ACTIVE_EXPORT[
            "completed_at"
        ] = datetime.now().isoformat()

        ACTIVE_EXPORT[
            "output"
        ] = str(
            output_path
        )

        ACTIVE_EXPORT[
            "filename"
        ] = output_path.name


# ==========================================================
# Video History
# ==========================================================


@router.get("/")
async def get_videos():

    return {
        "count": len(VIDEO_HISTORY),
        "videos": VIDEO_HISTORY,
    }


# ==========================================================
# Generate Video
# ==========================================================


@router.post("/generate")
async def generate_video(
    data: dict,
):

    video_id = str(
        uuid4()
    )

    provider_name = _normalize_provider_name(
        data.get(
            "provider",
            "ComfyUI",
        )
    )

    request = _build_video_request(
        data
    )

    # ------------------------------------------------------
    # Get provider
    # ------------------------------------------------------

    try:

        provider = (
            provider_service
            .manager()
            .get(
                provider_name
            )
        )

    except Exception as exc:

        video = {
            "id": video_id,

            "provider": provider_name,

            "model": request["model"],

            "prompt": request["prompt"],

            "negative_prompt": request[
                "negative_prompt"
            ],

            "duration": request["duration"],

            "fps": request["fps"],

            "width": request["width"],

            "height": request["height"],

            "frames": request["frames"],

            "seed": request["seed"],

            "steps": request["steps"],

            "cfg": request["cfg"],

            "status": "failed",

            "output": "",

            "created_at": datetime.now().isoformat(),

            "message": str(exc),
        }

        VIDEO_HISTORY.append(
            video
        )

        return {
            "success": False,
            "message": str(exc),
            "video": video,
        }

    # ------------------------------------------------------
    # Initial history record
    # ------------------------------------------------------

    video = {
        "id": video_id,

        "provider": provider_name,

        "model": request["model"],

        "prompt": request["prompt"],

        "negative_prompt": request[
            "negative_prompt"
        ],

        "duration": request["duration"],

        "fps": request["fps"],

        "width": request["width"],

        "height": request["height"],

        "frames": request["frames"],

        "seed": request["seed"],

        "steps": request["steps"],

        "cfg": request["cfg"],

        "status": "generating",

        "output": "",

        "created_at": datetime.now().isoformat(),
    }

    VIDEO_HISTORY.append(
        video
    )

    # ------------------------------------------------------
    # Generate
    # ------------------------------------------------------

    try:

        result = await provider.generate_video(
            request
        )

        if not isinstance(
            result,
            dict,
        ):

            result = {
                "success": False,
                "status": "failed",
                "output": "",
                "message": (
                    "Provider geçersiz bir sonuç döndürdü."
                ),
            }

        _copy_provider_result(
            video,
            result,
        )

        success = bool(
            result.get(
                "success",
                False,
            )
        )

        return {
            "success": success,

            "message": result.get(
                "message",
                (
                    "Video generation completed."
                    if success
                    else "Video generation failed."
                ),
            ),

            "video": video,
        }

    except Exception as exc:

        video["status"] = "failed"

        video["output"] = ""

        video["message"] = str(
            exc
        )

        return {
            "success": False,
            "message": str(exc),
            "video": video,
        }


# ==========================================================
# Export Video
# ==========================================================


@router.post("/export")
async def export_video(
    data: dict,
):

    with export_lock:

        if ACTIVE_EXPORT[
            "status"
        ] == "rendering":

            raise HTTPException(
                status_code=409,
                detail=(
                    "Another export is already "
                    "in progress."
                ),
            )

    # ======================================================
    # Export Settings
    # ======================================================

    extension = _normalize_format(
        data.get(
            "format",
            "mp4",
        )
    )

    filename = (
        data.get(
            "filename",
            "EasyAIStudio_Render",
        )
        or "EasyAIStudio_Render"
    )

    output_path = _build_output_path(
        filename,
        extension,
    )

    codec = _select_codec(
        data.get(
            "codec",
            "h264",
        )
    )

    bitrate = _normalize_bitrate(
        data.get(
            "bitrate",
            20,
        )
    )

    preset = str(
        data.get(
            "preset",
            "medium",
        )
    )

    crf = data.get(
        "crf",
        18,
    )

    try:

        crf = int(
            crf
        )

    except (
        TypeError,
        ValueError,
    ):

        crf = 18

    fps = data.get(
        "fps",
        30,
    )

    try:

        fps = int(
            fps
        )

    except (
        TypeError,
        ValueError,
    ):

        fps = 30

    # ------------------------------------------------------
    # Resolution
    # ------------------------------------------------------

    resolution_value = data.get(
        "resolution",
        "1920x1080",
    )

    width = 1920
    height = 1080

    if isinstance(
        resolution_value,
        dict,
    ):

        try:

            width = int(
                resolution_value.get(
                    "width",
                    1920,
                )
            )

            height = int(
                resolution_value.get(
                    "height",
                    1080,
                )
            )

        except (
            TypeError,
            ValueError,
        ):

            width = 1920
            height = 1080

    else:

        resolution_text = str(
            resolution_value
            or "1920x1080"
        ).lower().replace(
            " ",
            "",
        )

        if "x" in resolution_text:

            parts = resolution_text.split(
                "x",
                1,
            )

            try:

                width = int(
                    parts[0]
                )

                height = int(
                    parts[1]
                )

            except (
                TypeError,
                ValueError,
            ):

                width = 1920
                height = 1080

    # ------------------------------------------------------
    # Audio Settings
    # ------------------------------------------------------

    audio_codec = str(
        data.get(
            "audioCodec",
            data.get(
                "audio_codec",
                "aac",
            ),
        )
        or "aac"
    ).lower()

    audio_bitrate_value = data.get(
        "audioBitrate",
        data.get(
            "audio_bitrate",
            320,
        ),
    )

    try:

        audio_bitrate_numeric = float(
            audio_bitrate_value
        )

        if audio_bitrate_numeric <= 120:

            audio_bitrate = (
                f"{audio_bitrate_numeric:g}k"
            )

        else:

            audio_bitrate = (
                f"{audio_bitrate_numeric:g}k"
            )

    except (
        TypeError,
        ValueError,
    ):

        audio_bitrate = "320k"

    # ======================================================
    # Determine Export Mode
    #
    # Timeline export:
    #     data["clips"] = [...]
    #
    # Legacy single-input export:
    #     data["input_path"]
    # ======================================================

    clips_data = data.get(
        "clips"
    )

    is_timeline_export = (
        isinstance(
            clips_data,
            list,
        )
        and len(clips_data) > 0
    )

    # ======================================================
    # TIMELINE EXPORT
    # ======================================================

    if is_timeline_export:

        normalized_clips = []

        for index, clip in enumerate(
            clips_data
        ):

            if not isinstance(
                clip,
                dict,
            ):

                continue

            input_value = (
                clip.get("input_path")
                or clip.get("input")
                or clip.get("path")
                or clip.get("source_path")
                or clip.get("source")
            )

            if not input_value:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Timeline clip {index + 1} "
                        "does not contain an input file."
                    ),
                )

            try:

                input_path = _resolve_input_path(
                    str(input_value)
                )

            except HTTPException as exc:

                raise HTTPException(
                    status_code=exc.status_code,
                    detail=(
                        f"Timeline clip {index + 1}: "
                        f"{exc.detail}"
                    ),
                )

            normalized_clip = dict(
                clip
            )

            normalized_clip[
                "input"
            ] = str(
                input_path
            )

            normalized_clips.append(
                normalized_clip
            )

        if not normalized_clips:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Timeline contains no valid "
                    "video clips."
                ),
            )

        # --------------------------------------------------
        # Build Timeline Render Job
        # --------------------------------------------------

        try:

            job = (
                encoder_service
                .build_timeline_render_job(
                    clips=normalized_clips,
                    output_file=output_path,
                    width=width,
                    height=height,
                    fps=fps,
                    codec=codec,
                    bitrate=bitrate,
                    preset=preset,
                    crf=crf,
                    audio_codec=audio_codec,
                    audio_bitrate=audio_bitrate,
                    transitions=data.get(
                        "transitions",
                        [],
                    ) or [],
                )
            )

        except Exception as exc:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not build timeline "
                    "export job: "
                    f"{exc}"
                ),
            )

        job_id = str(
            uuid4()
        )

        job["id"] = job_id

        timeline_inputs = [
            str(
                clip["input"]
            )
            for clip in normalized_clips
        ]

        with export_lock:

            ACTIVE_EXPORT.update(
                {
                    "id": job_id,

                    "status": "rendering",

                    "progress": 0,

                    "input": timeline_inputs,

                    "output": str(
                        output_path
                    ),

                    "filename": output_path.name,

                    "message": (
                        "Timeline export started."
                    ),

                    "started_at": (
                        datetime.now().isoformat()
                    ),

                    "completed_at": None,
                }
            )

        # --------------------------------------------------
        # Start Timeline Render
        # --------------------------------------------------

        try:

            started = (
                encoder_service
                .start_timeline_job(
                    job,
                    progress_callback=(
                        _update_export_progress
                    ),
                    log_callback=(
                        _export_log
                    ),
                )
            )

            if started is False:

                _reset_export_state()

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Encoder could not start "
                        "the timeline export."
                    ),
                )

        except HTTPException:

            raise

        except Exception as exc:

            _reset_export_state()

            raise HTTPException(
                status_code=500,
                detail=(
                    "Timeline export could not "
                    "be started: "
                    f"{exc}"
                ),
            )

        return {
            "success": True,

            "export": {
                "id": job_id,

                "status": "rendering",

                "progress": 0,

                "input": timeline_inputs,

                "output": str(
                    output_path
                ),

                "filename": output_path.name,

                "format": extension,

                "codec": codec,

                "bitrate": bitrate,

                "resolution": {
                    "width": width,
                    "height": height,
                },

                "fps": fps,

                "audioCodec": audio_codec,

                "audioBitrate": audio_bitrate,

                "clip_count": len(
                    normalized_clips
                ),

                "timeline": True,

                "started_at": (
                    ACTIVE_EXPORT[
                        "started_at"
                    ]
                ),
            },
        }

    # ======================================================
    # LEGACY SINGLE VIDEO EXPORT
    # ======================================================

    input_value = (
        data.get("input_path")
        or data.get("input")
        or data.get("source_path")
        or data.get("source")
    )

    input_path = _resolve_input_path(
        str(
            input_value or ""
        )
    )

    # ------------------------------------------------------
    # Build Legacy Render Job
    # ------------------------------------------------------

    try:

        job = (
            encoder_service
            .build_render_job(
                input_file=input_path,
                output_file=output_path,
                codec=codec,
                bitrate=bitrate,
                preset=preset,
                crf=crf,
            )
        )

    except Exception as exc:

        raise HTTPException(
            status_code=400,
            detail=(
                "Could not build export job: "
                f"{exc}"
            ),
        )

    job_id = str(
        uuid4()
    )

    job["id"] = job_id

    with export_lock:

        ACTIVE_EXPORT.update(
            {
                "id": job_id,

                "status": "rendering",

                "progress": 0,

                "input": str(
                    input_path
                ),

                "output": str(
                    output_path
                ),

                "filename": output_path.name,

                "message": (
                    "Export started."
                ),

                "started_at": (
                    datetime.now().isoformat()
                ),

                "completed_at": None,
            }
        )

    # ------------------------------------------------------
    # Start Legacy Render
    # ------------------------------------------------------

    try:

        started = (
            encoder_service
            .start_job(
                job,
                progress_callback=(
                    _update_export_progress
                ),
                log_callback=(
                    _export_log
                ),
            )
        )

        if started is False:

            _reset_export_state()

            raise HTTPException(
                status_code=500,
                detail=(
                    "Encoder could not start "
                    "the export."
                ),
            )

    except HTTPException:

        raise

    except Exception as exc:

        _reset_export_state()

        raise HTTPException(
            status_code=500,
            detail=(
                "Export could not be started: "
                f"{exc}"
            ),
        )

    return {
        "success": True,

        "export": {
            "id": job_id,

            "status": "rendering",

            "progress": 0,

            "input": str(
                input_path
            ),

            "output": str(
                output_path
            ),

            "filename": output_path.name,

            "format": extension,

            "codec": codec,

            "bitrate": bitrate,

            "resolution": {
                "width": width,
                "height": height,
            },

            "fps": fps,

            "audioCodec": audio_codec,

            "audioBitrate": audio_bitrate,

            "timeline": False,

            "started_at": (
                ACTIVE_EXPORT[
                    "started_at"
                ]
            ),
        },
    }

# ==========================================================
# Export Status
# ==========================================================


@router.get("/export/status")
async def export_status():

    encoder_status = {}

    try:

        encoder_status = (
            encoder_service
            .status()
        )

    except Exception as exc:

        encoder_status = {
            "error": str(exc)
        }

    with export_lock:

        result = dict(
            ACTIVE_EXPORT
        )

    # ------------------------------------------------------
    # Synchronize encoder state
    # ------------------------------------------------------

    if (
        result["status"]
        == "rendering"
    ):

        # --------------------------------------------------
        # First trust the EncoderService result.
        # It knows whether FFmpeg actually completed.
        # --------------------------------------------------

        last_render_success = (
            encoder_status.get(
                "last_render_success"
            )
        )

        last_render_output = (
            encoder_status.get(
                "last_render_output"
            )
        )

        last_render_error = (
            encoder_status.get(
                "last_render_error"
            )
        )

        encoder_progress = (
            encoder_status.get(
                "progress"
            )
        )

        if encoder_progress is not None:

            _update_export_progress(
                encoder_progress
            )

            with export_lock:

                result = dict(
                    ACTIVE_EXPORT
                )

        # --------------------------------------------------
        # SUCCESS
        # --------------------------------------------------

        if last_render_success is True:

            output_value = (
                last_render_output
                or result.get("output")
            )

            if output_value:

                output_path = Path(
                    output_value
                )

                if (
                    output_path.exists()
                    and output_path.is_file()
                    and output_path.stat().st_size > 0
                ):

                    _export_finished(
                        result["id"],
                        output_path,
                    )

                    with export_lock:

                        result = dict(
                            ACTIVE_EXPORT
                        )

        # --------------------------------------------------
        # FAILURE
        # --------------------------------------------------

        elif last_render_success is False:

            with export_lock:

                if (
                    ACTIVE_EXPORT[
                        "status"
                    ]
                    == "rendering"
                ):

                    ACTIVE_EXPORT[
                        "status"
                    ] = "failed"

                    ACTIVE_EXPORT[
                        "message"
                    ] = (
                        last_render_error
                        or "Encoder render failed."
                    )

                    ACTIVE_EXPORT[
                        "completed_at"
                    ] = (
                        datetime.now().isoformat()
                    )

                    result = dict(
                        ACTIVE_EXPORT
                    )

        # --------------------------------------------------
        # FALLBACK
        #
        # Only declare "stopped before completion"
        # when EncoderService has not supplied a final
        # render result yet and the encoder is stopped.
        # --------------------------------------------------

        else:

            encoder_running = bool(
                encoder_status.get(
                    "running",
                    False,
                )
            )

            if (
                not encoder_running
                and result["progress"] >= 100
            ):

                output_value = result.get(
                    "output"
                )

                if output_value:

                    output_path = Path(
                        output_value
                    )

                    if (
                        output_path.exists()
                        and output_path.is_file()
                        and output_path.stat().st_size > 0
                    ):

                        _export_finished(
                            result["id"],
                            output_path,
                        )

                        with export_lock:

                            result = dict(
                                ACTIVE_EXPORT
                            )

            elif (
                not encoder_running
                and encoder_status
            ):

                with export_lock:

                    if (
                        ACTIVE_EXPORT[
                            "status"
                        ]
                        == "rendering"
                    ):

                        ACTIVE_EXPORT[
                            "status"
                        ] = "failed"

                        ACTIVE_EXPORT[
                            "message"
                        ] = (
                            "Encoder stopped "
                            "before completion."
                        )

                        ACTIVE_EXPORT[
                            "completed_at"
                        ] = (
                            datetime.now().isoformat()
                        )

                        result = dict(
                            ACTIVE_EXPORT
                        )

    return {
        "success": True,

        "export": result,

        "encoder": encoder_status,
    }


# ==========================================================
# Cancel Export
# ==========================================================


@router.post("/export/cancel")
async def cancel_export():

    with export_lock:

        if ACTIVE_EXPORT[
            "status"
        ] != "rendering":

            return {
                "success": False,

                "message": (
                    "No active export."
                ),

                "export": dict(
                    ACTIVE_EXPORT
                ),
            }

    try:

        encoder_service.cancel()

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Export cancellation failed: "
                f"{exc}"
            ),
        )

    with export_lock:

        ACTIVE_EXPORT[
            "status"
        ] = "cancelled"

        ACTIVE_EXPORT[
            "message"
        ] = "Export cancelled."

        ACTIVE_EXPORT[
            "completed_at"
        ] = (
            datetime.now().isoformat()
        )

    return {
        "success": True,

        "message": "Export cancelled.",

        "export": dict(
            ACTIVE_EXPORT
        ),
    }


# ==========================================================
# Exported Videos
# ==========================================================


@router.get("/exports/list")
async def exports():

    files = []

    if not settings.EXPORTS_DIR.exists():

        return {
            "count": 0,
            "files": [],
        }

    video_extensions = {
        ".mp4",
        ".webm",
        ".mov",
        ".mkv",
        ".avi",
    }

    for file in settings.EXPORTS_DIR.iterdir():

        if not file.is_file():

            continue

        if (
            file.suffix.lower()
            not in video_extensions
        ):

            continue

        stat = file.stat()

        files.append(
            {
                "name": file.name,

                "size": stat.st_size,

                "extension": (
                    file.suffix.lower()
                ),

                "url": (
                    f"/exports/"
                    f"{file.name}"
                ),

                "created_at": (
                    datetime.fromtimestamp(
                        stat.st_mtime
                    ).isoformat()
                ),
            }
        )

    files.sort(
        key=lambda item: item["created_at"],
        reverse=True,
    )

    return {
        "count": len(files),
        "files": files,
    }


# ==========================================================
# Get Video
# ==========================================================


@router.get("/{video_id}")
async def get_video(
    video_id: str,
):

    for video in VIDEO_HISTORY:

        if video["id"] == video_id:

            return {
                "success": True,
                "video": video,
            }

    return {
        "success": False,
        "message": "Video not found.",
    }


# ==========================================================
# Clear Video History
# ==========================================================


@router.delete("/")
async def clear_videos():

    VIDEO_HISTORY.clear()

    return {
        "success": True,
        "count": 0,
        "message": "Video history cleared.",
    }

