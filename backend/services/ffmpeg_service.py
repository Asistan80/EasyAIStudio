"""
==========================================================
Easy AI Studio
File    : backend/services/ffmpeg_service.py
Version : 1.0.0
==========================================================
"""

from __future__ import annotations

import os
import re
import shutil
import signal
import subprocess
import threading
import time

from pathlib import Path

from typing import Optional
from typing import List
from typing import Dict
from typing import Generator

from config.settings import settings


class FFmpegError(Exception):
    """Base FFmpeg exception."""


class FFmpegNotFoundError(FFmpegError):
    """Raised when ffmpeg cannot be found."""


class FFprobeNotFoundError(FFmpegError):
    """Raised when ffprobe cannot be found."""


class FFmpegProcessError(FFmpegError):
    """Raised when ffmpeg process fails."""


class FFmpegService:

    """
    Easy AI Studio
    FFmpeg Core Service
    """

    def __init__(self):

        self.ffmpeg_path: Optional[str] = None

        self.ffprobe_path: Optional[str] = None

        self.version: Optional[str] = None

        self.process: Optional[subprocess.Popen] = None

        self.running: bool = False

        self.cancel_requested: bool = False

        self.lock = threading.Lock()

        self._detect_binaries()

        self._load_version()

    # ======================================================
    # Detect
    # ======================================================

    def _detect_binaries(self):

        # --------------------------------------------------
        # FFmpeg
        # --------------------------------------------------

        ffmpeg = shutil.which(settings.FFMPEG_PATH)

        if ffmpeg:

            self.ffmpeg_path = ffmpeg

        else:

            portable_paths = [

                # Project root / ffmpeg / bin
                settings.BASE_DIR
                / "ffmpeg"
                / "bin"
                / "ffmpeg.exe",

                # Backend / ffmpeg / bin
                settings.BASE_DIR
                / "backend"
                / "ffmpeg"
                / "bin"
                / "ffmpeg.exe",

                # Settings module location / ffmpeg / bin
                Path(__file__).resolve().parents[2]
                / "ffmpeg"
                / "bin"
                / "ffmpeg.exe",

                # Current backend directory / ffmpeg / bin
                Path(__file__).resolve().parents[1]
                / "ffmpeg"
                / "bin"
                / "ffmpeg.exe"

            ]

            for portable in portable_paths:

                if portable.exists():

                    self.ffmpeg_path = str(
                        portable.resolve()
                    )

                    break

        if self.ffmpeg_path is None:

            raise FFmpegNotFoundError(
                "FFmpeg executable not found."
            )

        # --------------------------------------------------
        # FFprobe
        # --------------------------------------------------

        ffprobe = shutil.which(settings.FFPROBE_PATH)

        if ffprobe:

            self.ffprobe_path = ffprobe

        else:

            portable_paths = [

                # Project root / ffmpeg / bin
                settings.BASE_DIR
                / "ffmpeg"
                / "bin"
                / "ffprobe.exe",

                # Backend / ffmpeg / bin
                settings.BASE_DIR
                / "backend"
                / "ffmpeg"
                / "bin"
                / "ffprobe.exe",

                # Settings module location / ffmpeg / bin
                Path(__file__).resolve().parents[2]
                / "ffmpeg"
                / "bin"
                / "ffprobe.exe",

                # Current backend directory / ffmpeg / bin
                Path(__file__).resolve().parents[1]
                / "ffmpeg"
                / "bin"
                / "ffprobe.exe"

            ]

            for portable in portable_paths:

                if portable.exists():

                    self.ffprobe_path = str(
                        portable.resolve()
                    )

                    break

        if self.ffprobe_path is None:

            raise FFprobeNotFoundError(
                "FFprobe executable not found."
            )

    # ======================================================
    # Version
    # ======================================================

    def _load_version(self):

        result = subprocess.run(

            [

                self.ffmpeg_path,

                "-version"

            ],

            capture_output=True,

            text=True,

            timeout=10

        )

        if result.returncode != 0:

            raise FFmpegProcessError(
                "Unable to read FFmpeg version."
            )

        lines = result.stdout.splitlines()

        if not lines:

            raise FFmpegProcessError(
                "FFmpeg returned no version information."
            )

        line = lines[0]

        self.version = line.strip()

    # ======================================================
    # Public
    # ======================================================

    def get_version(self) -> str:

        return self.version

    def get_ffmpeg_path(self) -> str:

        return self.ffmpeg_path

    def get_ffprobe_path(self) -> str:

        return self.ffprobe_path

    def is_running(self) -> bool:

        return self.running

    def cancel(self):

        self.cancel_requested = True

        if self.process:

            try:

                self.process.send_signal(
                    signal.SIGINT
                )

            except Exception:

                pass

    # ======================================================
    # Execute Command
    # ======================================================

    def run(

        self,

        command: List[str],

        timeout: Optional[int] = None

    ) -> subprocess.CompletedProcess:

        """
        Execute a blocking FFmpeg command.
        """

        timeout = timeout or settings.FFMPEG_TIMEOUT

        return subprocess.run(

            command,

            capture_output=True,

            text=True,

            timeout=timeout,

            encoding="utf-8",

            errors="ignore"

        )

    # ======================================================
    # Start Process
    # ======================================================

    def start_process(

        self,

        command: List[str]

    ):

        """
        Start FFmpeg process.
        """

        with self.lock:

            if self.running:

                raise FFmpegProcessError(

                    "FFmpeg is already running."

                )

            self.cancel_requested = False

            self.running = True

            self.process = subprocess.Popen(

                command,

                stdout=subprocess.PIPE,

                stderr=subprocess.STDOUT,

                stdin=subprocess.PIPE,

                universal_newlines=True,

                encoding="utf-8",

                errors="ignore",

                bufsize=1

            )

    # ======================================================
    # Wait
    # ======================================================

    def wait(self) -> int:

        if self.process is None:

            raise FFmpegProcessError(

                "Process not started."

            )

        code = self.process.wait()

        self.running = False

        return code

    # ======================================================
    # Terminate
    # ======================================================

    def terminate(self):

        if self.process is None:

            return

        try:

            self.process.terminate()

        finally:

            self.running = False

    # ======================================================
    # Kill
    # ======================================================

    def kill(self):

        if self.process is None:

            return

        try:

            self.process.kill()

        finally:

            self.running = False

    # ======================================================
    # Read Output
    # ======================================================

    def read_output(

        self

    ) -> Generator[str, None, None]:

        """
        Read FFmpeg output line by line.
        """

        if self.process is None:

            return

        while True:

            if self.cancel_requested:

                break

            line = self.process.stdout.readline()

            if not line:

                break

            yield line.rstrip()

        self.running = False

    # ======================================================
    # Encoders
    # ======================================================

    def get_encoders(self) -> List[str]:
        """
        Return supported FFmpeg encoders.
        """

        result = self.run(
            [
                self.ffmpeg_path,
                "-hide_banner",
                "-encoders"
            ]
        )

        encoders: List[str] = []

        for line in result.stdout.splitlines():

            if not line:
                continue

            if line.startswith("------"):
                continue

            if line.startswith("Encoders"):
                continue

            match = re.match(
                r"^\s*[A-Z\.]{6}\s+([^\s]+)",
                line
            )

            if match:
                encoders.append(match.group(1))

        return sorted(encoders)

    # ======================================================
    # Decoders
    # ======================================================

    def get_decoders(self) -> List[str]:
        """
        Return supported FFmpeg decoders.
        """

        result = self.run(
            [
                self.ffmpeg_path,
                "-hide_banner",
                "-decoders"
            ]
        )

        decoders: List[str] = []

        for line in result.stdout.splitlines():

            if not line:
                continue

            if line.startswith("------"):
                continue

            if line.startswith("Decoders"):
                continue

            match = re.match(
                r"^\s*[A-Z\.]{6}\s+([^\s]+)",
                line
            )

            if match:
                decoders.append(match.group(1))

        return sorted(decoders)

    # ======================================================
    # Hardware Accelerations
    # ======================================================

    def get_hwaccels(self) -> List[str]:
        """
        Return available FFmpeg hardware accelerators.
        """

        result = self.run(
            [
                self.ffmpeg_path,
                "-hide_banner",
                "-hwaccels"
            ]
        )

        accelerators: List[str] = []

        start = False

        for line in result.stdout.splitlines():

            line = line.strip()

            if not line:
                continue

            if line == "Hardware acceleration methods:":

                start = True
                continue

            if start:
                accelerators.append(line)

        return accelerators

    # ======================================================
    # Encoder Detection
    # ======================================================

    def has_encoder(
        self,
        encoder: str
    ) -> bool:

        return encoder in self.get_encoders()

    def has_nvenc(self) -> bool:

        return (
            self.has_encoder("h264_nvenc")
            or
            self.has_encoder("hevc_nvenc")
            or
            self.has_encoder("av1_nvenc")
        )

    def has_amf(self) -> bool:

        return (
            self.has_encoder("h264_amf")
            or
            self.has_encoder("hevc_amf")
            or
            self.has_encoder("av1_amf")
        )

    def has_qsv(self) -> bool:

        return (
            self.has_encoder("h264_qsv")
            or
            self.has_encoder("hevc_qsv")
            or
            self.has_encoder("av1_qsv")
        )

    # ======================================================
    # Capability Report
    # ======================================================

    def get_capabilities(self) -> Dict:

        """
        Return FFmpeg capability report.
        """

        encoders = self.get_encoders()

        hwaccels = self.get_hwaccels()

        return {

            "version": self.version,

            "ffmpeg": self.ffmpeg_path,

            "ffprobe": self.ffprobe_path,

            "hwaccels": hwaccels,

            "encoders": {

                "nvenc": self.has_nvenc(),

                "amf": self.has_amf(),

                "qsv": self.has_qsv(),

                "x264": "libx264" in encoders,

                "x265": "libx265" in encoders,

                "av1": (

                    "libsvtav1" in encoders

                    or

                    "av1_nvenc" in encoders

                    or

                    "av1_qsv" in encoders

                    or

                    "av1_amf" in encoders

                ),

                "prores": (

                    "prores"
                    in encoders

                    or

                    "prores_ks"
                    in encoders

                )

            }

        }

    # ======================================================
    # Preferred Encoder
    # ======================================================
    def get_best_h264_encoder(self) -> str:

        if False and self.has_nvenc():

            return "h264_nvenc"

        if False and self.has_qsv():

            return "h264_qsv"

        if self.has_amf():

            return "h264_amf"

        return "libx264"

    def get_best_h265_encoder(self) -> str:

        if self.has_nvenc():

            return "hevc_nvenc"

        if self.has_qsv():

            return "hevc_qsv"

        if self.has_amf():

            return "hevc_amf"

        return "libx265"

    def get_best_av1_encoder(self) -> str:

        if self.has_nvenc():

            return "av1_nvenc"

        if self.has_qsv():

            return "av1_qsv"

        if self.has_amf():

            return "av1_amf"

        if self.has_encoder("libsvtav1"):

            return "libsvtav1"

        raise FFmpegProcessError(

            "No AV1 encoder available."

        )

    # ======================================================
    # Information
    # ======================================================

    def info(self) -> Dict:

        return {

            "version": self.version,

            "ffmpeg": self.ffmpeg_path,

            "ffprobe": self.ffprobe_path,

            "running": self.running,

            "cancel_requested": self.cancel_requested,

            "capabilities": self.get_capabilities()

        }

    # ======================================================
    # Command Builder
    # ======================================================

    def build_base_command(self) -> List[str]:
        """
        Return the base FFmpeg command.
        """

        return [
            self.ffmpeg_path,
            "-hide_banner",
            "-y",
            "-loglevel",
            settings.FFMPEG_LOGLEVEL
        ]

    # ======================================================
    # Video Encode Command
    # ======================================================

    def build_video_encode_command(
        self,
        input_file: Path,
        output_file: Path,
        codec: Optional[str] = None,
        bitrate: str = "20M",
        preset: str = "medium",
        crf: int = 18
    ) -> List[str]:

        codec = codec or self.get_best_h264_encoder()

        command = self.build_base_command()

        command.extend([
            "-i",
            str(input_file)
        ])

    # ======================================================
    # Timeline Export / Composition
    # ======================================================

    def build_timeline_encode_command(
        self,
        clips: List[Dict],
        output_file: Path,
        width: int = 1920,
        height: int = 1080,
        fps: int = 30,
        codec: Optional[str] = None,
        bitrate: str = "20M",
        preset: str = "medium",
        crf: int = 18,
        audio_codec: str = "aac",
        audio_bitrate: str = "320k",
        transitions: Optional[List[Dict]] = None
    ) -> List[str]:
        """
        Build FFmpeg command for timeline export.

        Supports:
        - video trimming
        - video speed
        - scaling / padding
        - FPS normalization
        - brightness
        - contrast
        - saturation
        - blur
        - fade in / fade out
        - opacity
        - volume
        - audio speed
        - muted clips
        - video-only clips
        - single / multiple clip concatenation
        """

        if not clips:
            raise FFmpegProcessError(
                "No video clips were provided for timeline export."
            )

        codec = codec or self.get_best_h264_encoder()

        command = self.build_base_command()

        valid_clips = []

        # --------------------------------------------------
        # Validate inputs first
        # --------------------------------------------------

        for clip in clips:

            if not isinstance(clip, dict):
                continue

            input_file = (
                clip.get("input")
                or clip.get("path")
                or clip.get("input_path")
            )

            if not input_file:
                continue

            input_path = Path(input_file)

            self.validate_media(input_path)

            valid_clips.append({
                **clip,
                "_input_path": input_path
            })

        if not valid_clips:
            raise FFmpegProcessError(
                "No valid video inputs were provided."
            )

        # --------------------------------------------------
        # Add inputs
        # --------------------------------------------------

        for clip in valid_clips:

            command.extend([
                "-i",
                str(clip["_input_path"])
            ])

        # --------------------------------------------------
        # Filter graph
        # --------------------------------------------------

        filters = []

        video_labels = []
        audio_labels = []
        clip_ids = []
        durations = []

        for index, clip in enumerate(valid_clips):

            video_in = f"[{index}:v:0]"

            video_label = f"v{index}"
            audio_label = f"a{index}"

            input_path = clip["_input_path"]

            # --------------------------------------------------
            # Timing
            # --------------------------------------------------

            start = clip.get(
                "start",
                clip.get("trimStart", 0)
            )

            try:
                start = float(start or 0)
            except (TypeError, ValueError):
                start = 0.0

            start = max(0.0, start)

            duration = clip.get("duration")

            if duration is None:
                duration = self.get_duration(input_path) - start

            try:
                duration = float(duration)
            except (TypeError, ValueError):
                duration = 0.0

            if duration <= 0:
                continue

            speed = clip.get("speed", 1)

            try:
                speed = float(speed)
            except (TypeError, ValueError):
                speed = 1.0

            if speed <= 0:
                speed = 1.0

            # --------------------------------------------------
            # VIDEO
            # --------------------------------------------------

            video_filters = [
                f"trim=start={start}:duration={duration}",
                "setpts=PTS-STARTPTS"
            ]

            if speed != 1.0:
                video_filters.append(
                    f"setpts=PTS/{speed}"
                )

            # --------------------------------------------------
            # Effects
            # --------------------------------------------------

            effects = clip.get("effects") or []

            if isinstance(effects, dict):
                effects = [effects]

            for effect in effects:

                if not isinstance(effect, dict):
                    continue

                effect_type = str(
                    effect.get(
                        "type",
                        effect.get("name", "")
                    )
                ).lower().strip()

                effect_settings = (
                    effect.get("settings") or {}
                )

                if not isinstance(effect_settings, dict):
                    effect_settings = {}

                # ----------------------------------------------
                # Time range (applies effect only between
                # startTime and endTime, in seconds, relative
                # to the clip)
                # ----------------------------------------------

                try:
                    effect_start = max(
                        0.0,
                        float(effect.get("startTime", 0) or 0)
                    )
                except (TypeError, ValueError):
                    effect_start = 0.0

                raw_end = effect.get("endTime", None)

                try:
                    effect_end = (
                        float(duration)
                        if raw_end is None
                        else float(raw_end)
                    )
                except (TypeError, ValueError):
                    effect_end = float(duration)

                effect_end = min(
                    effect_end,
                    float(duration)
                )

                enable_clause = ""

                if (
                    effect_start > 0.0
                    or effect_end < float(duration)
                ):
                    enable_clause = (
                        f":enable='between(t,"
                        f"{effect_start:.3f},"
                        f"{effect_end:.3f})'"
                    )

                # ----------------------------------------------
                # Brightness
                # ----------------------------------------------

                if effect_type == "brightness":

                    value = effect_settings.get(
                        "value",
                        effect.get("value", 0)
                    )

                    try:
                        value = float(value)
                    except (TypeError, ValueError):
                        value = 0.0

                    value = max(
                        -100.0,
                        min(100.0, value)
                    )

                    video_filters.append(
                        f"eq=brightness={value / 100.0:.4f}"
                        f"{enable_clause}"
                    )

                # ----------------------------------------------
                # Contrast
                # ----------------------------------------------

                elif effect_type == "contrast":

                    value = effect_settings.get(
                        "value",
                        effect.get("value", 100)
                    )

                    try:
                        value = float(value)
                    except (TypeError, ValueError):
                        value = 100.0

                    value = max(0.0, value)

                    video_filters.append(
                        f"eq=contrast={value / 100.0:.4f}"
                        f"{enable_clause}"
                    )

                # ----------------------------------------------
                # Saturation
                # ----------------------------------------------

                elif effect_type == "saturation":

                    value = effect_settings.get(
                        "value",
                        effect.get("value", 100)
                    )

                    try:
                        value = float(value)
                    except (TypeError, ValueError):
                        value = 100.0

                    value = max(0.0, value)

                    video_filters.append(
                        f"eq=saturation={value / 100.0:.4f}"
                        f"{enable_clause}"
                    )

                # ----------------------------------------------
                # Blur
                # ----------------------------------------------

                elif effect_type == "blur":

                    value = effect_settings.get(
                        "value",
                        effect.get("value", 0)
                    )

                    try:
                        value = float(value)
                    except (TypeError, ValueError):
                        value = 0.0

                    value = max(
                        0.0,
                        min(50.0, value)
                    )

                    if value > 0:
                        video_filters.append(
                            f"gblur=sigma={value:.2f}"
                            f"{enable_clause}"
                        )

                # ----------------------------------------------
                # Fade In
                # ----------------------------------------------

                elif effect_type in (
                    "fade",
                    "fadein",
                    "fade_in"
                ):

                    fade_duration = effect_settings.get(
                        "duration",
                        effect.get("duration", 1)
                    )

                    try:
                        fade_duration = max(
                            0.01,
                            float(fade_duration)
                        )
                    except (TypeError, ValueError):
                        fade_duration = 1.0

                    fade_duration = min(
                        fade_duration,
                        duration
                    )

                    video_filters.append(
                        f"fade=t=in:st=0:d={fade_duration}"
                    )

                # ----------------------------------------------
                # Fade Out
                # ----------------------------------------------

                elif effect_type in (
                    "fadeout",
                    "fade_out"
                ):

                    fade_duration = effect_settings.get(
                        "duration",
                        effect.get("duration", 1)
                    )

                    try:
                        fade_duration = max(
                            0.01,
                            float(fade_duration)
                        )
                    except (TypeError, ValueError):
                        fade_duration = 1.0

                    fade_duration = min(
                        fade_duration,
                        duration
                    )

                    start_fade = max(
                        0.0,
                        duration - fade_duration
                    )

                    video_filters.append(
                        f"fade=t=out:"
                        f"st={start_fade}:"
                        f"d={fade_duration}"
                    )

                # ----------------------------------------------
                # Opacity
                # ----------------------------------------------

                elif effect_type == "opacity":

                    value = effect_settings.get(
                        "value",
                        effect.get("value", 100)
                    )

                    try:
                        value = float(value)
                    except (TypeError, ValueError):
                        value = 100.0

                    value = max(
                        0.0,
                        min(100.0, value)
                    )

                    video_filters.extend([
                        "format=rgba",
                        (
                            "colorchannelmixer="
                            f"aa={value / 100.0:.4f}"
                            f"{enable_clause}"
                        )
                    ])

            # --------------------------------------------------
            # Clip opacity
            # --------------------------------------------------

            opacity = clip.get("opacity", 100)

            try:
                opacity = float(opacity)
            except (TypeError, ValueError):
                opacity = 100.0

            opacity = max(
                0.0,
                min(100.0, opacity)
            )

            if opacity < 100:

                video_filters.extend([
                    "format=rgba",
                    (
                        "colorchannelmixer="
                        f"aa={opacity / 100.0:.4f}"
                    )
                ])

            # --------------------------------------------------
            # Final video normalization
            # --------------------------------------------------

            video_filters.extend([
                (
                    f"scale={int(width)}:{int(height)}:"
                    "force_original_aspect_ratio=decrease"
                ),
                (
                    f"pad={int(width)}:{int(height)}:"
                    "(ow-iw)/2:(oh-ih)/2"
                ),
                f"fps={int(fps)}",
                "setsar=1",
                "format=yuv420p"
            ])

            filters.append(
                f"{video_in}"
                f"{','.join(video_filters)}"
                f"[{video_label}]"
            )

            video_labels.append(
                f"[{video_label}]"
            )

            clip_ids.append(clip.get("clipId"))
            durations.append(duration)

            # --------------------------------------------------
            # AUDIO
            #
            # IMPORTANT:
            # Every clip gets an audio stream.
            #
            # Real audio -> process it.
            # No audio / muted -> generate silence.
            #
            # This prevents:
            # [0:a:0] not found
            # and allows concat to work correctly.
            # --------------------------------------------------

            has_audio = bool(
                self.get_audio_codec(input_path)
            )

            muted = bool(
                clip.get("muted", False)
            )

            if muted or not has_audio:

                filters.append(
                    (
                        f"anullsrc="
                        f"channel_layout=stereo:"
                        f"sample_rate=48000,"
                        f"atrim=duration={duration},"
                        f"asetpts=PTS-STARTPTS"
                        f"[{audio_label}]"
                    )
                )

            else:

                audio_filters = [
                    f"atrim=start={start}:duration={duration}",
                    "asetpts=PTS-STARTPTS"
                ]

                if speed != 1.0:

                    remaining_speed = speed

                    while remaining_speed > 2.0:

                        audio_filters.append(
                            "atempo=2.0"
                        )

                        remaining_speed /= 2.0

                    while remaining_speed < 0.5:

                        audio_filters.append(
                            "atempo=0.5"
                        )

                        remaining_speed /= 0.5

                    audio_filters.append(
                        f"atempo={remaining_speed:.6f}"
                    )

                volume = clip.get("volume", 1)

                try:
                    volume = float(volume)
                except (TypeError, ValueError):
                    volume = 1.0

                volume = max(
                    0.0,
                    volume
                )

                if volume != 1.0:

                    audio_filters.append(
                        f"volume={volume}"
                    )

                audio_filters.append(
                    "aresample=async=1"
                )

                filters.append(
                    f"{index}:a:0"
                )

                filters[-1] = (

                    f"[{index}:a:0]"
                    f"{','.join(audio_filters)}"
                    f"[{audio_label}]"
                )

            audio_labels.append(
                f"[{audio_label}]"
            )

        # --------------------------------------------------
        # Make sure at least one video survived validation
        # --------------------------------------------------

        if not video_labels:

            raise FFmpegProcessError(
                "Timeline contains no valid video clips."
            )

        # --------------------------------------------------
        # VIDEO CONCAT
        # --------------------------------------------------

        if len(video_labels) == 1:

            filters.append(
                f"{video_labels[0]}"
                "format=yuv420p"
                "[vout]"
            )

        else:

            filters.append(
                f"{''.join(video_labels)}"
                f"concat=n={len(video_labels)}:v=1:a=0"
                "[vout]"
            )

        # --------------------------------------------------
        # AUDIO CONCAT
        # --------------------------------------------------

        if len(audio_labels) == 1:

            filters.append(
                f"{audio_labels[0]}"
                "anull"
                "[aout]"
            )

        elif len(audio_labels) > 1:

            filters.append(
                f"{''.join(audio_labels)}"
                f"concat=n={len(audio_labels)}:v=0:a=1"
                "[aout]"
            )

        # --------------------------------------------------
        # FILTER COMPLEX
        # --------------------------------------------------

        filter_complex = ";".join(filters)

        command.extend([
            "-filter_complex",
            filter_complex,

            "-map",
            "[vout]",

            "-map",
            "[aout]"
        ])

        # --------------------------------------------------
        # VIDEO CODEC
        # --------------------------------------------------

        if codec.endswith("_nvenc"):

            command.extend([
                "-c:v",
                codec,
                "-preset",
                "p5",
                "-b:v",
                str(bitrate)
            ])

        elif codec.endswith("_amf"):

            command.extend([
                "-c:v",
                codec,
                "-quality",
                "quality",
                "-b:v",
                str(bitrate)
            ])

        elif codec.endswith("_qsv"):

            command.extend([
                "-c:v",
                codec,
                "-preset",
                "medium",
                "-b:v",
                str(bitrate)
            ])

        else:

            command.extend([
                "-c:v",
                codec,
                "-preset",
                str(preset),
                "-crf",
                str(crf),
                "-b:v",
                str(bitrate)
            ])

        # --------------------------------------------------
        # AUDIO CODEC
        # --------------------------------------------------

        command.extend([
            "-c:a",
            str(audio_codec).lower(),
            "-b:a",
            str(audio_bitrate)
        ])

        # --------------------------------------------------
        # OUTPUT
        # --------------------------------------------------

        command.extend([
            "-threads",
            str(settings.FFMPEG_THREADS),

            "-movflags",
            "+faststart",

            str(output_file)
        ])

        return command

        # --------------------------------------------------
        # NVIDIA / AMD / Intel
        # --------------------------------------------------

        if codec.endswith("_nvenc"):

            command.extend([
                "-c:v",
                codec,
                "-preset",
                "p5",
                "-b:v",
                bitrate
            ])

        elif codec.endswith("_amf"):

            command.extend([
                "-c:v",
                codec,
                "-quality",
                "quality",
                "-b:v",
                bitrate
            ])

        elif codec.endswith("_qsv"):

            command.extend([
                "-c:v",
                codec,
                "-preset",
                "medium",
                "-b:v",
                bitrate
            ])

        # --------------------------------------------------
        # CPU
        # --------------------------------------------------

        else:

            command.extend([
                "-c:v",
                codec,
                "-preset",
                preset,
                "-crf",
                str(crf)
            ])

        command.extend([
            "-threads",
            str(settings.FFMPEG_THREADS)
        ])

        command.append(str(output_file))

        return command

    # ======================================================
    # Image Sequence
    # ======================================================

    def build_image_sequence_command(
        self,
        pattern: str,
        fps: int,
        output_file: Path,
        codec: Optional[str] = None
    ) -> List[str]:

        codec = codec or self.get_best_h264_encoder()

        command = self.build_base_command()

        command.extend([
            "-framerate",
            str(fps),
            "-i",
            pattern,
            "-c:v",
            codec
        ])

        command.append(str(output_file))

        return command

    # ======================================================
    # Audio Merge
    # ======================================================

    def build_audio_merge_command(
        self,
        video_file: Path,
        audio_file: Path,
        output_file: Path,
        codec: Optional[str] = None
    ) -> List[str]:

        codec = codec or self.get_best_h264_encoder()

        command = self.build_base_command()

        command.extend([

            "-i",
            str(video_file),

            "-i",
            str(audio_file),

            "-map",
            "0:v:0",

            "-map",
            "1:a:0",

            "-c:v",
            codec,

            "-c:a",
            "aac",

            "-b:a",
            "320k",

            "-shortest"

        ])

        command.append(str(output_file))

        return command

    # ======================================================
    # Trim Video
    # ======================================================

    def build_trim_command(
        self,
        input_file: Path,
        output_file: Path,
        start_time: float,
        duration: float
    ) -> List[str]:

        command = self.build_base_command()

        command.extend([

            "-ss",
            str(start_time),

            "-i",
            str(input_file),

            "-t",
            str(duration),

            "-c",
            "copy"

        ])

        command.append(str(output_file))

        return command

    # ======================================================
    # Resize
    # ======================================================

    def build_resize_command(
        self,
        input_file: Path,
        output_file: Path,
        width: int,
        height: int,
        codec: Optional[str] = None
    ) -> List[str]:

        codec = codec or self.get_best_h264_encoder()

        command = self.build_base_command()

        command.extend([

            "-i",
            str(input_file),

            "-vf",
            f"scale={width}:{height}",

            "-c:v",
            codec

        ])

        command.append(str(output_file))

        return command

    # ======================================================
    # FPS Convert
    # ======================================================

    def build_fps_command(
        self,
        input_file: Path,
        output_file: Path,
        fps: int,
        codec: Optional[str] = None
    ) -> List[str]:

        codec = codec or self.get_best_h264_encoder()

        command = self.build_base_command()

        command.extend([

            "-i",
            str(input_file),

            "-filter:v",
            f"fps={fps}",

            "-c:v",
            codec

        ])

        command.append(str(output_file))

        return command

    # ======================================================
    # Normalize Audio
    # ======================================================

    def build_audio_normalize_command(
        self,
        input_file: Path,
        output_file: Path
    ) -> List[str]:

        command = self.build_base_command()

        command.extend([

            "-i",
            str(input_file),

            "-af",
            "loudnorm",

            "-c:v",
            "copy",

            "-c:a",
            "aac"

        ])

        command.append(str(output_file))

        return command

    # ======================================================
    # Progress Parser
    # ======================================================

    _TIME_REGEX = re.compile(r"time=(\d+):(\d+):(\d+\.\d+)")
    _FPS_REGEX = re.compile(r"fps=\s*([\d\.]+)")
    _FRAME_REGEX = re.compile(r"frame=\s*(\d+)")
    _SPEED_REGEX = re.compile(r"speed=\s*([\d\.]+)x")
    _BITRATE_REGEX = re.compile(r"bitrate=\s*([\d\.kmgKMG/]+)")

    def parse_progress(
        self,
        line: str
    ) -> Dict:

        """
        Parse one FFmpeg output line.

        Returns
        -------
        {
            frame,
            fps,
            time,
            seconds,
            speed,
            bitrate
        }
        """

        data = {

            "frame": None,
            "fps": None,
            "time": None,
            "seconds": 0.0,
            "speed": None,
            "bitrate": None

        }

        frame = self._FRAME_REGEX.search(line)

        if frame:

            data["frame"] = int(frame.group(1))

        fps = self._FPS_REGEX.search(line)

        if fps:

            try:

                data["fps"] = float(fps.group(1))

            except ValueError:

                pass

        speed = self._SPEED_REGEX.search(line)

        if speed:

            try:

                data["speed"] = float(speed.group(1))

            except ValueError:

                pass

        bitrate = self._BITRATE_REGEX.search(line)

        if bitrate:

            data["bitrate"] = bitrate.group(1)

        tm = self._TIME_REGEX.search(line)

        if tm:

            h = int(tm.group(1))

            m = int(tm.group(2))

            s = float(tm.group(3))

            seconds = (

                h * 3600

                + m * 60

                + s

            )

            data["seconds"] = seconds

            data["time"] = (

                f"{h:02d}:"
                f"{m:02d}:"
                f"{s:05.2f}"

            )

        return data

    # ======================================================
    # Progress Percentage
    # ======================================================

    def calculate_progress(

        self,

        current_seconds: float,

        total_seconds: float

    ) -> float:

        """
        Calculate render percentage.
        """

        if total_seconds <= 0:

            return 0.0

        progress = (

            current_seconds
            / total_seconds

        ) * 100.0

        return max(

            0.0,

            min(

                progress,

                100.0

            )

        )

    # ======================================================
    # Read Progress Stream
    # ======================================================

    def progress_stream(

        self,

        total_duration: float

    ) -> Generator[Dict, None, None]:

        """
        Read FFmpeg output
        and yield progress.
        """

        for line in self.read_output():

            progress = self.parse_progress(line)

            progress["percent"] = (

                self.calculate_progress(

                    progress["seconds"],

                    total_duration

                )

            )

            yield progress

    # ======================================================
    # FFprobe
    # ======================================================

    def probe(

        self,

        input_file: Path

    ) -> Dict:

        """
        Read media information using FFprobe.
        """

        command = [

            self.ffprobe_path,

            "-v",

            "quiet",

            "-print_format",

            "json",

            "-show_format",

            "-show_streams",

            str(input_file)

        ]

        result = self.run(command)

        if result.returncode != 0:

            raise FFprobeNotFoundError(

                result.stderr

            )

        import json

        return json.loads(result.stdout)

    # ======================================================
    # Duration
    # ======================================================

    def get_duration(

        self,

        input_file: Path

    ) -> float:

        info = self.probe(input_file)

        try:

            return float(

                info["format"]["duration"]

            )

        except Exception:

            return 0.0

    # ======================================================
    # Resolution
    # ======================================================

    def get_resolution(

        self,

        input_file: Path

    ) -> Dict:

        info = self.probe(input_file)

        for stream in info["streams"]:

            if stream.get("codec_type") == "video":

                return {

                    "width": stream.get("width", 0),

                    "height": stream.get("height", 0)

                }

        return {

            "width": 0,

            "height": 0

        }

    # ======================================================
    # FPS
    # ======================================================

    def get_fps(

        self,

        input_file: Path

    ) -> float:

        info = self.probe(input_file)

        for stream in info["streams"]:

            if stream.get("codec_type") != "video":

                continue

            rate = stream.get(

                "avg_frame_rate",

                "0/1"

            )

            try:

                a, b = rate.split("/")

                a = float(a)

                b = float(b)

                if b == 0:

                    return 0.0

                return a / b

            except Exception:

                return 0.0

        return 0.0

    # ======================================================
    # Video Codec
    # ======================================================

    def get_video_codec(

        self,

        input_file: Path

    ) -> str:

        info = self.probe(input_file)

        for stream in info["streams"]:

            if stream.get("codec_type") == "video":

                return stream.get(

                    "codec_name",

                    ""

                )

        return ""

    # ======================================================
    # Audio Codec
    # ======================================================

    def get_audio_codec(

        self,

        input_file: Path

    ) -> str:

        info = self.probe(input_file)

        for stream in info["streams"]:

            if stream.get("codec_type") == "audio":

                return stream.get(

                    "codec_name",

                    ""

                )

        return ""

    # ======================================================
    # Media Information
    # ======================================================

    def media_info(

        self,

        input_file: Path

    ) -> Dict:

        return {

            "duration": self.get_duration(

                input_file

            ),

            "resolution": self.get_resolution(

                input_file

            ),

            "fps": self.get_fps(

                input_file

            ),

            "video_codec": self.get_video_codec(

                input_file

            ),

            "audio_codec": self.get_audio_codec(

                input_file

            )

        }

    # ======================================================
    # Thumbnail
    # ======================================================

    def build_thumbnail_command(
        self,
        input_file: Path,
        output_file: Path,
        second: float = 1.0,
        width: int = 640
    ) -> List[str]:
        """
        Build thumbnail generation command.
        """

        command = self.build_base_command()

        command.extend([

            "-ss",
            str(second),

            "-i",
            str(input_file),

            "-frames:v",
            "1",

            "-vf",
            f"scale={width}:-1"

        ])

        command.append(str(output_file))

        return command

    # ======================================================
    # Extract Frame
    # ======================================================

    def build_frame_extract_command(
        self,
        input_file: Path,
        frame_number: int,
        output_file: Path
    ) -> List[str]:
        """
        Extract a specific frame.
        """

        command = self.build_base_command()

        command.extend([

            "-i",
            str(input_file),

            "-vf",
            f"select=eq(n\\,{frame_number})",

            "-frames:v",
            "1"

        ])

        command.append(str(output_file))

        return command

    # ======================================================
    # Preview Image
    # ======================================================

    def build_preview_command(
        self,
        input_file: Path,
        output_file: Path
    ) -> List[str]:
        """
        Generate preview image.
        """

        duration = self.get_duration(input_file)

        second = max(
            duration * 0.25,
            1.0
        )

        return self.build_thumbnail_command(

            input_file=input_file,

            output_file=output_file,

            second=second,

            width=960

        )

    # ======================================================
    # Temporary File
    # ======================================================

    def create_temp_file(
        self,
        suffix: str
    ) -> Path:

        timestamp = int(time.time() * 1000)

        filename = f"{timestamp}{suffix}"

        return (
            settings.TEMP_RENDER_DIR
            / filename
        )

    # ======================================================
    # Cache
    # ======================================================

    def clear_cache(self):

        if not settings.CACHE_DIR.exists():

            return

        for file in settings.CACHE_DIR.iterdir():

            try:

                if file.is_file():

                    file.unlink()

            except Exception:

                continue

    # ======================================================
    # Temp Cleanup
    # ======================================================

    def cleanup_temp(self):

        if not settings.TEMP_RENDER_DIR.exists():

            return

        for file in settings.TEMP_RENDER_DIR.iterdir():

            try:

                if file.is_file():

                    file.unlink()

            except Exception:

                continue

    # ======================================================
    # Render
    # ======================================================

    def render(

        self,

        command: List[str],

        total_duration: float,

        progress_callback=None,

        log_callback=None

    ) -> int:

        """
        Execute FFmpeg render process.

        Parameters
        ----------
        command
            FFmpeg command.

        total_duration
            Duration of media in seconds.

        progress_callback
            Function(progress_dict)

        log_callback
            Function(log_line)
        """

        self.start_process(command)

        try:

            for line in self.read_output():

                print(f"[FFmpeg] {line}")

                if log_callback:

                    log_callback(line)

                progress = self.parse_progress(line)

                progress["percent"] = self.calculate_progress(

                    progress["seconds"],

                    total_duration

                )

                if progress_callback:

                    progress_callback(progress)

                if self.cancel_requested:

                    self.terminate()

                    raise FFmpegProcessError(

                        "Render cancelled."

                    )

            code = self.wait()

            if code != 0:

                raise FFmpegProcessError(

                    f"FFmpeg exited with code {code}"

                )

            return code

        finally:

            self.running = False

            self.process = None

    # ======================================================
    # Retry
    # ======================================================

    def retry(

        self,

        command: List[str],

        total_duration: float,

        retries: int = 1,

        progress_callback=None,

        log_callback=None

    ) -> int:

        """
        Retry render if it fails.
        """

        last_error = None

        for _ in range(retries + 1):

            try:

                return self.render(

                    command,

                    total_duration,

                    progress_callback,

                    log_callback

                )

            except Exception as exc:

                last_error = exc

                time.sleep(1)

        raise last_error

    # ======================================================
    # Stop
    # ======================================================

    def stop(self):

        """
        Gracefully stop FFmpeg.
        """

        self.cancel_requested = True

        self.terminate()

    # ======================================================
    # Force Stop
    # ======================================================

    def force_stop(self):

        """
        Kill FFmpeg immediately.
        """

        self.cancel_requested = True

        self.kill()

    # ======================================================
    # Status
    # ======================================================

    def status(self) -> Dict:

        return {

            "running": self.running,

            "cancel_requested": self.cancel_requested,

            "version": self.version,

            "process_alive": (

                self.process is not None

                and

                self.process.poll() is None

            )

        }

    # ======================================================
    # Batch Render
    # ======================================================

    def batch_render(
        self,
        jobs: List[Dict],
        progress_callback=None,
        log_callback=None
    ) -> List[Dict]:
        """
        Execute multiple render jobs sequentially.
        """

        results: List[Dict] = []

        total_jobs = len(jobs)

        for index, job in enumerate(jobs, start=1):

            command = job["command"]
            duration = job.get("duration", 0.0)

            if log_callback:

                log_callback(
                    f"[Batch] Starting job {index}/{total_jobs}"
                )

            try:

                self.render(
                    command=command,
                    total_duration=duration,
                    progress_callback=progress_callback,
                    log_callback=log_callback
                )

                results.append({

                    "index": index,
                    "success": True,
                    "output": job.get("output")

                })

            except Exception as exc:

                results.append({

                    "index": index,
                    "success": False,
                    "error": str(exc),
                    "output": job.get("output")

                })

        return results

    # ======================================================
    # Export Presets
    # ======================================================

    def get_export_presets(self) -> Dict:

        return {

            "youtube_1080p": {

                "codec": self.get_best_h264_encoder(),

                "bitrate": "12M",

                "preset": "medium",

                "audio": "320k"

            },

            "youtube_4k": {

                "codec": self.get_best_h265_encoder(),

                "bitrate": "40M",

                "preset": "slow",

                "audio": "320k"

            },

            "lossless": {

                "codec": "ffv1",

                "preset": "ultrafast",

                "audio": "pcm_s16le"

            },

            "av1": {

                "codec": self.get_best_av1_encoder(),

                "bitrate": "18M",

                "preset": "medium",

                "audio": "320k"

            }

        }

    # ======================================================
    # Validate Input
    # ======================================================

    def validate_media(
        self,
        input_file: Path
    ) -> bool:

        if not input_file.exists():

            raise FileNotFoundError(str(input_file))

        if input_file.stat().st_size == 0:

            raise FFmpegProcessError(

                "Input file is empty."

            )

        return True

    # ======================================================
    # Validate Output
    # ======================================================

    def prepare_output(
        self,
        output_file: Path
    ):

        output_file.parent.mkdir(

            parents=True,

            exist_ok=True

        )

        return output_file

    # ======================================================
    # Utility
    # ======================================================

    def exists(self) -> bool:

        return (

            Path(self.ffmpeg_path).exists()

            and

            Path(self.ffprobe_path).exists()

        )

    def reset(self):

        self.cancel_requested = False

        self.running = False

        self.process = None

    # ======================================================
    # Health Check
    # ======================================================

    def health_check(self) -> Dict:
        """
        Perform a service health check.
        """

        health = {
            "service": "FFmpegService",
            "status": "healthy",
            "ffmpeg": False,
            "ffprobe": False,
            "version": self.version,
            "running": self.running,
            "encoders": {},
            "hwaccels": []
        }

        try:

            health["ffmpeg"] = (
                self.ffmpeg_path is not None
                and
                Path(self.ffmpeg_path).exists()
            )

            health["ffprobe"] = (
                self.ffprobe_path is not None
                and
                Path(self.ffprobe_path).exists()
            )

            health["encoders"] = {

                "nvenc": self.has_nvenc(),

                "amf": self.has_amf(),

                "qsv": self.has_qsv(),

                "x264": self.has_encoder("libx264"),

                "x265": self.has_encoder("libx265")

            }

            health["hwaccels"] = self.get_hwaccels()

        except Exception as exc:

            health["status"] = "error"

            health["error"] = str(exc)

        return health

    # ======================================================
    # Dispose
    # ======================================================

    def dispose(self):
        """
        Release all resources.
        """

        try:

            if self.running:

                self.force_stop()

        finally:

            self.process = None

            self.running = False

            self.cancel_requested = False

    # ======================================================
    # Context Manager
    # ======================================================

    def __enter__(self):

        return self

    def __exit__(

        self,

        exc_type,

        exc_value,

        traceback

    ):

        self.dispose()

    # ======================================================
    # String Representation
    # ======================================================

    def __repr__(self):

        return (

            f"<FFmpegService "

            f"version='{self.version}' "

            f"running={self.running}>"

        )

    __str__ = __repr__