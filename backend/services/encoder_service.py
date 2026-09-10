# ==========================================================
# Easy AI Studio
# File    : backend/services/encoder_service.py
# Version : 1.0.1
# ==========================================================

from __future__ import annotations

import threading
import time

from pathlib import Path
from typing import Dict
from typing import List
from typing import Optional
from typing import Callable

from config.settings import settings

from services.ffmpeg_service import (
    FFmpegService,
    FFmpegProcessError,
)


class EncoderService:

    """
    High level encoding service.

    This service manages render jobs and delegates all
    FFmpeg operations to FFmpegService.
    """

    def __init__(self):

        self.ffmpeg = FFmpegService()

        self.current_job: Optional[Dict] = None

        self.running: bool = False

        self.paused: bool = False

        self.cancel_requested: bool = False

        self.thread: Optional[threading.Thread] = None

        self.progress: Dict = {}

        self.log_history: List[str] = []

        self.lock = threading.Lock()

        # --------------------------------------------------
        # Render result state
        # --------------------------------------------------

        self.last_render_success: Optional[bool] = None

        self.last_render_error: Optional[str] = None

        self.last_render_output: Optional[str] = None

        self.last_render_finished_at: Optional[float] = None

    # ======================================================
    # State
    # ======================================================

    def is_running(self) -> bool:

        return self.running

    def is_paused(self) -> bool:

        return self.paused

    def is_idle(self) -> bool:

        return not self.running

    # ======================================================
    # Progress
    # ======================================================

    def get_progress(self) -> Dict:

        return dict(self.progress)

    def clear_progress(self):

        self.progress.clear()

    # ======================================================
    # Logs
    # ======================================================

    def add_log(

        self,

        line: str

    ):

        self.log_history.append(line)

        if len(self.log_history) > 500:

            self.log_history.pop(0)

    def get_logs(self) -> List[str]:

        return list(self.log_history)

    def clear_logs(self):

        self.log_history.clear()

    # ======================================================
    # Start Render
    # ======================================================

    def start_render(

        self,

        command: List[str],

        total_duration: float,

        job: Optional[Dict] = None,

        progress_callback: Optional[Callable] = None,

        log_callback: Optional[Callable] = None

    ):

        """
        Start render in a background thread.

        The render result is explicitly stored so callers
        can distinguish a successful FFmpeg completion from
        a stopped/failed process.
        """

        with self.lock:

            if self.running:

                raise FFmpegProcessError(

                    "A render is already running."

                )

            self.running = True

            self.paused = False

            self.cancel_requested = False

            self.current_job = job

            self.last_render_success = None

            self.last_render_error = None

            self.last_render_finished_at = None

            self.last_render_output = None

            self.clear_progress()

            self.clear_logs()

            if job is not None:

                output = job.get("output")

                if output is not None:

                    self.last_render_output = str(output)

        def _worker():

            success = False

            error_message = None

            output_path = None

            try:

                if job is not None:

                    output = job.get("output")

                    if output is not None:

                        output_path = Path(output)

                # --------------------------------------------------
                # FFmpeg render
                # --------------------------------------------------

                result = self.ffmpeg.render(

                    command=command,

                    total_duration=total_duration,

                    progress_callback=self._progress_handler(

                        progress_callback

                    ),

                    log_callback=self._log_handler(

                        log_callback

                    )

                )

                # --------------------------------------------------
                # FFmpegService may return None on normal completion.
                #
                # Therefore normal return is considered successful
                # unless an explicit False result is returned.
                # --------------------------------------------------

                if result is False:

                    error_message = (

                        "FFmpeg returned a failed render result."

                    )

                    success = False

                else:

                    success = True

                # --------------------------------------------------
                # Verify output file when available.
                # --------------------------------------------------

                if success and output_path is not None:

                    try:

                        if not output_path.exists():

                            success = False

                            error_message = (

                                "FFmpeg completed without creating "

                                f"the output file: {output_path}"

                            )

                        elif output_path.stat().st_size <= 0:

                            success = False

                            error_message = (

                                "FFmpeg completed but the output "

                                f"file is empty: {output_path}"

                            )

                    except OSError as exc:

                        success = False

                        error_message = (

                            f"Unable to verify output file: {exc}"

                        )

                # --------------------------------------------------
                # Successful completion
                # --------------------------------------------------

                if success:

                    completed_progress = {

                        "frame": (

                            self.progress.get("frame")

                            if self.progress

                            else None

                        ),

                        "fps": (

                            self.progress.get("fps")

                            if self.progress

                            else None

                        ),

                        "time": (

                            total_duration

                            if total_duration is not None

                            else (

                                self.progress.get("time")

                                if self.progress

                                else None

                            )

                        ),

                        "seconds": (

                            float(total_duration)

                            if total_duration is not None

                            else (

                                self.progress.get(

                                    "seconds",

                                    0.0

                                )

                                if self.progress

                                else 0.0

                            )

                        ),

                        "speed": (

                            self.progress.get("speed")

                            if self.progress

                            else None

                        ),

                        "bitrate": (

                            self.progress.get("bitrate")

                            if self.progress

                            else None

                        ),

                        "percent": 100.0

                    }

                    self.progress = completed_progress

                    if progress_callback:

                        try:

                            progress_callback(

                                completed_progress

                            )

                        except Exception:

                            pass

                    self.update_log(

                        "[Encoder] Render completed successfully."

                    )

                else:

                    if error_message:

                        self.update_log(

                            f"[Encoder] Render failed: "

                            f"{error_message}"

                        )

            except Exception as exc:

                success = False

                error_message = str(exc)

                self.update_log(

                    f"[Encoder] Render exception: {exc}"

                )

            finally:

                with self.lock:

                    self.last_render_success = success

                    self.last_render_error = error_message

                    self.last_render_finished_at = time.time()

                    self.running = False

                    self.paused = False

                    self.cancel_requested = (

                        self.cancel_requested

                    )

                # --------------------------------------------------
                # Session handling
                # --------------------------------------------------

                try:

                    self.finish_session(success)

                except Exception:

                    pass

                # --------------------------------------------------
                # Notify listeners
                # --------------------------------------------------

                try:

                    self.notify_complete(success)

                except Exception:

                    pass

                try:

                    self.broadcast_state()

                except Exception:

                    pass

                # --------------------------------------------------
                # Keep current_job available for status/history
                # until the next render starts.
                # --------------------------------------------------
                #
                # The previous implementation cleared current_job
                # immediately. We intentionally keep the completed
                # job reference so the API can inspect the result.
                #
                # It will be replaced by the next start_render call.
                # --------------------------------------------------

        self.thread = threading.Thread(

            target=_worker,

            daemon=True

        )

        self.thread.start()

        return True

    # ======================================================
    # Internal Progress Handler
    # ======================================================

    def _progress_handler(

        self,

        callback

    ):

        def handler(progress: Dict):

            self.progress = progress

            self.update_progress(progress)

            if callback:

                callback(progress)

        return handler

    # ======================================================
    # Internal Log Handler
    # ======================================================

    def _log_handler(

        self,

        callback

    ):

        def handler(line: str):

            self.add_log(line)

            self.emit_log(line)

            if callback:

                callback(line)

        return handler

    # ======================================================
    # Wait
    # ======================================================

    def wait(self):

        if self.thread:

            self.thread.join()

    # ======================================================
    # Pause
    # ======================================================

    def pause(self):
        """
        Pause render.

        NOTE:
        FFmpeg does not support a true cross-platform pause.
        This flag is exposed for future platform-specific
        implementations.
        """

        with self.lock:

            if not self.running:

                return

            self.paused = True

    # ======================================================
    # Resume
    # ======================================================

    def resume(self):
        """
        Resume render.
        """

        with self.lock:

            if not self.running:

                return

            self.paused = False

    # ======================================================
    # Cancel
    # ======================================================

    def cancel(self):
        """
        Cancel current render.
        """

        with self.lock:

            if not self.running:

                return

            self.cancel_requested = True

        self.ffmpeg.stop()

    # ======================================================
    # Force Stop
    # ======================================================

    def force_stop(self):
        """
        Immediately terminate FFmpeg.
        """

        with self.lock:

            self.cancel_requested = True

        self.ffmpeg.force_stop()

    # ======================================================
    # Retry
    # ======================================================

    def retry(

        self,

        retries: int = 1

    ):

        if self.current_job is None:

            raise FFmpegProcessError(

                "No render job available."

            )

        job = self.current_job

        self.start_render(

            command=job["command"],

            total_duration=job["duration"],

            job=job

        )

    # ======================================================
    # Status
    # ======================================================

    def status(self) -> Dict:

        return {

            "running": self.running,

            "paused": self.paused,

            "cancel_requested": self.cancel_requested,

            "job": self.current_job,

            "progress": self.progress,

            "last_render_success": (

                self.last_render_success

            ),

            "last_render_error": (

                self.last_render_error

            ),

            "last_render_output": (

                self.last_render_output

            ),

            "last_render_finished_at": (

                self.last_render_finished_at

            ),

            "thread_alive": (

                self.thread is not None

                and

                self.thread.is_alive()

            ),

            "ffmpeg": self.ffmpeg.status()

        }

    # ======================================================
    # Build Render Job
    # ======================================================

    def build_render_job(

        self,

        input_file: Path,

        output_file: Path,

        codec: Optional[str] = None,

        bitrate: str = "20M",

        preset: str = "medium",

        crf: int = 18

    ) -> Dict:

        """
        Build a render job dictionary.
        """

        input_file = Path(input_file)

        output_file = Path(output_file)

        self.ffmpeg.validate_media(input_file)

        self.ffmpeg.prepare_output(output_file)

        duration = self.ffmpeg.get_duration(input_file)

        command = self.ffmpeg.build_video_encode_command(

            input_file=input_file,

            output_file=output_file,

            codec=codec,

            bitrate=bitrate,

            preset=preset,

            crf=crf

        )

        media = self.ffmpeg.media_info(input_file)

        return {

            "input": input_file,

            "output": output_file,

            "command": command,

            "duration": duration,

            "media": media,

            "codec": codec,

            "bitrate": bitrate,

            "preset": preset,

            "crf": crf

        }

    # ======================================================
    # Build Timeline Render Job
    # ======================================================

    def build_timeline_render_job(
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
    ) -> Dict:
        """
        Build a complete timeline render job.

        The timeline is composed by FFmpeg in a single render
        operation instead of exporting only the first clip.
        """

        if not clips:
            raise FFmpegProcessError(
                "Timeline contains no video clips."
            )

        output_file = Path(output_file)

        self.ffmpeg.prepare_output(output_file)

        normalized_clips: List[Dict] = []

        total_duration = 0.0

        # --------------------------------------------------
        # Validate and normalize clips
        # --------------------------------------------------

        for index, clip in enumerate(clips):

            if not isinstance(clip, dict):
                continue

            input_file = (
                clip.get("input")
                or clip.get("path")
                or clip.get("input_path")
            )

            if not input_file:
                continue

            input_file = Path(input_file)

            self.ffmpeg.validate_media(input_file)

            duration = clip.get("duration")

            if duration is None:
                duration = self.ffmpeg.get_duration(
                    input_file
                )

            try:
                duration = float(duration)
            except (TypeError, ValueError):
                duration = self.ffmpeg.get_duration(
                    input_file
                )

            if duration <= 0:
                continue

            start = clip.get(
                "start",
                clip.get("trimStart", 0)
            )

            try:
                start = float(start or 0)
            except (TypeError, ValueError):
                start = 0.0

            normalized_clip = dict(clip)

            normalized_clip["input"] = input_file
            normalized_clip["duration"] = duration
            normalized_clip["start"] = max(
                0.0,
                start
            )

            normalized_clips.append(
                normalized_clip
            )

            total_duration += duration

        if not normalized_clips:

            raise FFmpegProcessError(
                "Timeline contains no valid video inputs."
            )

        # --------------------------------------------------
        # Build FFmpeg command
        # --------------------------------------------------

        command = self.ffmpeg.build_timeline_encode_command(

            clips=normalized_clips,

            output_file=output_file,

            width=int(width),

            height=int(height),

            fps=int(fps),

            codec=codec,

            bitrate=bitrate,

            preset=preset,

            crf=int(crf),

            audio_codec=audio_codec,

            audio_bitrate=audio_bitrate,

            transitions=transitions or []

        )

        return {

            "input": [

                str(clip["input"])

                for clip in normalized_clips

            ],

            "output": output_file,

            "command": command,

            "duration": total_duration,

            "clips": normalized_clips,

            "clip_count": len(normalized_clips),

            "transitions": transitions or [],

            "codec": codec,

            "bitrate": bitrate,

            "preset": preset,

            "crf": crf,

            "resolution": {

                "width": int(width),

                "height": int(height)

            },

            "fps": int(fps),

            "audio_codec": audio_codec,

            "audio_bitrate": audio_bitrate,

            "timeline": True

        }

    # ======================================================
    # Start Timeline Job
    # ======================================================

    def start_timeline_job(

        self,

        job: Dict,

        progress_callback=None,

        log_callback=None

    ):

        """
        Start a timeline composition/export job.
        """

        if not job.get("timeline"):

            raise FFmpegProcessError(
                "Invalid timeline render job."
            )

        return self.start_render(

            command=job["command"],

            total_duration=float(
                job.get("duration", 0.0)
            ),

            job=job,

            progress_callback=progress_callback,

            log_callback=log_callback

        )

    # ======================================================
    # Start Job
    # ======================================================

    def start_job(

        self,

        job: Dict,

        progress_callback=None,

        log_callback=None

    ):

        result = self.start_render(

            command=job["command"],

            total_duration=job["duration"],

            job=job,

            progress_callback=progress_callback,

            log_callback=log_callback

        )

        return result

    # ======================================================
    # Export Preset
    # ======================================================

    def build_preset_job(

        self,

        input_file: Path,

        output_file: Path,

        preset_name: str

    ) -> Dict:

        presets = self.ffmpeg.get_export_presets()

        if preset_name not in presets:

            raise FFmpegProcessError(

                f"Unknown preset '{preset_name}'."

            )

        preset = presets[preset_name]

        return self.build_render_job(

            input_file=input_file,

            output_file=output_file,

            codec=preset["codec"],

            bitrate=preset["bitrate"],

            preset=preset["preset"]

        )

    # ======================================================
    # Quick Export
    # ======================================================

    def quick_export(

        self,

        input_file: Path,

        output_file: Path,

        preset_name: str = "youtube_1080p",

        progress_callback=None,

        log_callback=None

    ):

        job = self.build_preset_job(

            input_file=input_file,

            output_file=output_file,

            preset_name=preset_name

        )

        return self.start_job(

            job,

            progress_callback,

            log_callback

        )

    # ======================================================
    # Queue
    # ======================================================

    def create_queue(self):

        self.queue: List[Dict] = []

        self.completed_jobs: List[Dict] = []

        self.failed_jobs: List[Dict] = []

    # ======================================================
    # Add Job
    # ======================================================

    def add_job(

        self,

        job: Dict

    ):

        if not hasattr(self, "queue"):

            self.create_queue()

        self.queue.append(job)

    # ======================================================
    # Remove Job
    # ======================================================

    def remove_job(

        self,

        index: int

    ):

        if not hasattr(self, "queue"):

            return

        if index < 0:

            return

        if index >= len(self.queue):

            return

        self.queue.pop(index)

    # ======================================================
    # Clear Queue
    # ======================================================

    def clear_queue(self):

        if not hasattr(self, "queue"):

            return

        self.queue.clear()

    # ======================================================
    # Queue Status
    # ======================================================

    def queue_status(self) -> Dict:

        if not hasattr(self, "queue"):

            self.create_queue()

        return {

            "waiting": len(self.queue),

            "completed": len(self.completed_jobs),

            "failed": len(self.failed_jobs),

            "running": self.running

        }

    # ======================================================
    # Process Queue
    # ======================================================

    def process_queue(

        self,

        progress_callback=None,

        log_callback=None

    ):

        if not hasattr(self, "queue"):

            self.create_queue()

        while self.queue:

            if self.cancel_requested:

                break

            job = self.queue.pop(0)

            try:

                self.start_job(

                    job,

                    progress_callback,

                    log_callback

                )

                self.wait()

                if self.last_render_success:

                    self.completed_jobs.append(job)

                else:

                    if self.last_render_error:

                        job["error"] = (

                            self.last_render_error

                        )

                    else:

                        job["error"] = (

                            "Render failed."

                        )

                    self.failed_jobs.append(job)

            except Exception as exc:

                job["error"] = str(exc)

                self.failed_jobs.append(job)

                if log_callback:

                    log_callback(

                        f"[Queue] Job failed: {exc}"

                    )

    # ======================================================
    # Retry Failed Jobs
    # ======================================================

    def retry_failed(

        self,

        progress_callback=None,

        log_callback=None

    ):

        if not self.failed_jobs:

            return

        jobs = self.failed_jobs.copy()

        self.failed_jobs.clear()

        for job in jobs:

            self.add_job(job)

        self.process_queue(

            progress_callback,

            log_callback

        )

    # ======================================================
    # Worker Configuration
    # ======================================================

    def configure_workers(

        self,

        max_workers: int = 1

    ):

        """
        Configure maximum concurrent render workers.
        """

        if max_workers < 1:

            max_workers = 1

        self.max_workers = max_workers

    # ======================================================
    # Worker Status
    # ======================================================

    def active_workers(self) -> int:

        if not hasattr(self, "_workers"):

            self._workers = []

        alive = []

        for worker in self._workers:

            if worker.is_alive():

                alive.append(worker)

        self._workers = alive

        return len(self._workers)

    # ======================================================
    # Queue Worker
    # ======================================================

    def _queue_worker(

        self,

        job: Dict,

        progress_callback=None,

        log_callback=None

    ):

        try:

            self.start_job(

                job,

                progress_callback,

                log_callback

            )

            self.wait()

            if self.last_render_success:

                self.completed_jobs.append(job)

            else:

                if self.last_render_error:

                    job["error"] = (

                        self.last_render_error

                    )

                else:

                    job["error"] = (

                        "Render failed."

                    )

                self.failed_jobs.append(job)

        except Exception as exc:

            job["error"] = str(exc)

            self.failed_jobs.append(job)

            if log_callback:

                log_callback(

                    f"[Worker] Render failed: {exc}"

                )

    # ======================================================
    # Parallel Queue
    # ======================================================

    def process_parallel_queue(

        self,

        progress_callback=None,

        log_callback=None

    ):

        if not hasattr(self, "queue"):

            self.create_queue()

        if not hasattr(self, "_workers"):

            self._workers = []

        if not hasattr(self, "max_workers"):

            self.configure_workers(1)

        while self.queue:

            if self.cancel_requested:

                break

            while (

                self.active_workers()

                >=

                self.max_workers

            ):

                time.sleep(0.2)

            job = self.queue.pop(0)

            worker = threading.Thread(

                target=self._queue_worker,

                args=(

                    job,

                    progress_callback,

                    log_callback

                ),

                daemon=True

            )

            self._workers.append(worker)

            worker.start()

        for worker in self._workers:

            worker.join()

    # ======================================================
    # Statistics
    # ======================================================

    def statistics(self) -> Dict:

        return {

            "waiting": (

                len(self.queue)

                if hasattr(self, "queue")

                else 0

            ),

            "completed": (

                len(self.completed_jobs)

                if hasattr(

                    self,

                    "completed_jobs"

                )

                else 0

            ),

            "failed": (

                len(self.failed_jobs)

                if hasattr(

                    self,

                    "failed_jobs"

                )

                else 0

            ),

            "running": self.running,

            "active_workers": self.active_workers(),

            "max_workers": (

                self.max_workers

                if hasattr(self, "max_workers")

                else 1

            )

        }

    # ======================================================
    # Reset Service
    # ======================================================

    def reset(self):

        self.cancel_requested = False

        self.running = False

        self.paused = False

        self.current_job = None

        self.last_render_success = None

        self.last_render_error = None

        self.last_render_output = None

        self.last_render_finished_at = None

        self.clear_progress()

        self.clear_logs()

        if hasattr(self, "queue"):

            self.queue.clear()

        if hasattr(self, "completed_jobs"):

            self.completed_jobs.clear()

        if hasattr(self, "failed_jobs"):

            self.failed_jobs.clear()

        if hasattr(self, "_workers"):

            self._workers.clear()

    # ======================================================
    # Hardware Profile
    # ======================================================

    def detect_hardware_profile(self) -> Dict:

        """
        Detect the preferred hardware profile using FFmpeg
        capabilities.
        """

        capabilities = self.ffmpeg.get_capabilities()

        profile = {

            "backend": "cpu",

            "video_codec": "libx264",

            "supports_av1": False,

            "supports_h265": False,

            "supports_h264": True

        }

        if capabilities["encoders"]["nvenc"]:

            profile["backend"] = "nvenc"

            profile["video_codec"] = (

                self.ffmpeg.get_best_h264_encoder()

            )

            profile["supports_h265"] = True

            profile["supports_av1"] = True

            return profile

        if capabilities["encoders"]["qsv"]:

            profile["backend"] = "qsv"

            profile["video_codec"] = (

                self.ffmpeg.get_best_h264_encoder()

            )

            profile["supports_h265"] = True

            profile["supports_av1"] = True

            return profile

        if capabilities["encoders"]["amf"]:

            profile["backend"] = "amf"

            profile["video_codec"] = (

                self.ffmpeg.get_best_h264_encoder()

            )

            profile["supports_h265"] = True

            profile["supports_av1"] = True

            return profile

        if capabilities["encoders"]["x265"]:

            profile["supports_h265"] = True

        if capabilities["encoders"]["av1"]:

            profile["supports_av1"] = True

        return profile

    # ======================================================
    # Recommended Codec
    # ======================================================

    def recommended_codec(

        self,

        target: str = "h264"

    ) -> str:

        profile = self.detect_hardware_profile()

        if target == "av1" and profile["supports_av1"]:

            return self.ffmpeg.get_best_av1_encoder()

        if target == "h265" and profile["supports_h265"]:

            return self.ffmpeg.get_best_h265_encoder()

        return self.ffmpeg.get_best_h264_encoder()

    # ======================================================
    # Build Smart Job
    # ======================================================

    def build_smart_job(

        self,

        input_file: Path,

        output_file: Path,

        target_codec: str = "h264",

        bitrate: str = "20M"

    ) -> Dict:

        codec = self.recommended_codec(target_codec)

        return self.build_render_job(

            input_file=input_file,

            output_file=output_file,

            codec=codec,

            bitrate=bitrate

        )

    # ======================================================
    # Hardware Information
    # ======================================================

    def hardware_info(self) -> Dict:

        profile = self.detect_hardware_profile()

        return {

            "backend": profile["backend"],

            "codec": profile["video_codec"],

            "supports_h264": profile["supports_h264"],

            "supports_h265": profile["supports_h265"],

            "supports_av1": profile["supports_av1"]

        }

    # ======================================================
    # Session
    # ======================================================

    def create_session(self) -> Dict:

        return {

            "id": int(time.time() * 1000),

            "started": time.time(),

            "finished": None,

            "status": "waiting",

            "input": None,

            "output": None,

            "codec": None,

            "backend": None,

            "duration": 0.0,

            "elapsed": 0.0,

            "success": False

        }

    # ======================================================
    # Begin Session
    # ======================================================

    def begin_session(

        self,

        job: Dict

    ) -> Dict:

        session = self.create_session()

        session["status"] = "running"

        session["input"] = str(

            job["input"]

        )

        session["output"] = str(

            job["output"]

        )

        session["codec"] = job["codec"]

        session["backend"] = (

            self.hardware_info()["backend"]

        )

        session["duration"] = (

            job["duration"]

        )

        self.current_session = session

        return session

    # ======================================================
    # Finish Session
    # ======================================================

    def finish_session(

        self,

        success: bool

    ):

        if not hasattr(

            self,

            "current_session"

        ):

            return

        session = self.current_session

        session["finished"] = time.time()

        session["elapsed"] = (

            session["finished"]

            -

            session["started"]

        )

        session["success"] = success

        session["status"] = (

            "completed"

            if success

            else

            "failed"

        )

        if not hasattr(

            self,

            "history"

        ):

            self.history = []

        self.history.append(session)

        self.current_session = None

    # ======================================================
    # History
    # ======================================================

    def render_history(

        self

    ) -> List[Dict]:

        if not hasattr(

            self,

            "history"

        ):

            self.history = []

        return list(self.history)

    def clear_history(

        self

    ):

        if hasattr(

            self,

            "history"

        ):

            self.history.clear()

    # ======================================================
    # Last Export
    # ======================================================

    def last_export(

        self

    ) -> Optional[Dict]:

        if not hasattr(

            self,

            "history"

        ):

            return None

        if not self.history:

            return None

        return self.history[-1]

    # ======================================================
    # Cleanup
    # ======================================================

    def cleanup(

        self

    ):

        self.ffmpeg.cleanup_temp()

        self.ffmpeg.clear_cache()

    # ======================================================
    # Event System
    # ======================================================

    def register_progress_listener(

        self,

        callback: Callable

    ):

        if not hasattr(

            self,

            "_progress_listeners"

        ):

            self._progress_listeners = []

        self._progress_listeners.append(callback)

    def register_log_listener(

        self,

        callback: Callable

    ):

        if not hasattr(

            self,

            "_log_listeners"

        ):

            self._log_listeners = []

        self._log_listeners.append(callback)

    def register_status_listener(

        self,

        callback: Callable

    ):

        if not hasattr(

            self,

            "_status_listeners"

        ):

            self._status_listeners = []

        self._status_listeners.append(callback)

    # ======================================================
    # Emit Progress
    # ======================================================

    def emit_progress(

        self,

        progress: Dict

    ):

        if not hasattr(

            self,

            "_progress_listeners"

        ):

            return

        for listener in self._progress_listeners:

            try:

                listener(progress)

            except Exception:

                continue

    # ======================================================
    # Emit Log
    # ======================================================

    def emit_log(

        self,

        line: str

    ):

        if not hasattr(

            self,

            "_log_listeners"

        ):

            return

        for listener in self._log_listeners:

            try:

                listener(line)

            except Exception:

                continue

    # ======================================================
    # Emit Status
    # ======================================================

    def emit_status(

        self,

        status: Dict

    ):

        if not hasattr(

            self,

            "_status_listeners"

        ):

            return

        for listener in self._status_listeners:

            try:

                listener(status)

            except Exception:

                continue

    # ======================================================
    # Broadcast
    # ======================================================

    def broadcast_state(self):

        self.emit_status(

            self.status()

        )

    # ======================================================
    # Update Progress
    # ======================================================

    def update_progress(

        self,

        progress: Dict

    ):

        self.progress = progress

        self.emit_progress(progress)

    # ======================================================
    # Update Log
    # ======================================================

    def update_log(

        self,

        line: str

    ):

        self.add_log(line)

        self.emit_log(line)

    # ======================================================
    # Notify Complete
    # ======================================================

    def notify_complete(

        self,

        success: bool

    ):

        self.emit_status({

            "event": "render_finished",

            "success": success,

            "output": self.last_render_output,

            "error": self.last_render_error,

            "history": self.render_history()

        })

    # ======================================================
    # Health Check
    # ======================================================

    def health_check(self) -> Dict:

        """
        Encoder service health information.
        """

        return {

            "service": "EncoderService",

            "status": (

                "running"

                if self.running

                else

                "idle"

            ),

            "ffmpeg": self.ffmpeg.health_check(),

            "hardware": self.hardware_info(),

            "statistics": self.statistics(),

            "queue": self.queue_status(),

            "history": len(

                self.render_history()

            ),

            "last_render_success": (

                self.last_render_success

            ),

            "last_render_error": (

                self.last_render_error

            )

        }

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

        except Exception:

            pass

        try:

            self.cleanup()

        except Exception:

            pass

        self.reset()

        self.ffmpeg.dispose()

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

            "<EncoderService "

            f"running={self.running} "

            f"queue={len(self.queue) if hasattr(self,'queue') else 0}>"

        )

    __str__ = __repr__