"""
==========================================================
Easy AI Studio
CUDA Detector
==========================================================
"""

from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Dict
from typing import Optional


class CUDADetector:
    """
    NVIDIA CUDA Toolkit detection.
    """

    def __init__(self):

        self._loaded = False

        self._driver_version: Optional[str] = None

        self._cuda_version: Optional[str] = None

        self._gpu_name: Optional[str] = None

    # ======================================================
    # Detect
    # ======================================================

    def detect(self):

        if self._loaded:

            return

        self._loaded = True

        self._detect_nvidia_smi()

    # ======================================================
    # nvidia-smi
    # ======================================================

    def _detect_nvidia_smi(self):

        try:

            output = subprocess.check_output(

                [

                    "nvidia-smi",

                    "--query-gpu=name,driver_version",

                    "--format=csv,noheader"

                ],

                text=True,

                stderr=subprocess.DEVNULL

            )

            row = output.strip().split(",")

            if len(row) >= 2:

                self._gpu_name = row[0].strip()

                self._driver_version = row[1].strip()

        except Exception:

            pass

        try:

            output = subprocess.check_output(

                [

                    "nvidia-smi"

                ],

                text=True,

                stderr=subprocess.DEVNULL

            )

            for line in output.splitlines():

                if "CUDA Version" in line:

                    part = line.split("CUDA Version:")

                    if len(part) > 1:

                        self._cuda_version = (

                            part[1]

                            .split()

                            [0]

                            .strip()

                        )

                        break

        except Exception:

            pass

    # ======================================================
    # GPU
    # ======================================================

    def gpu_name(self) -> str:

        self.detect()

        return self._gpu_name or "Unknown"

    # ======================================================
    # Driver
    # ======================================================

    def driver_version(self) -> str:

        self.detect()

        return self._driver_version or ""

    # ======================================================
    # CUDA Version
    # ======================================================

    def cuda_version(self) -> str:

        self.detect()

        return self._cuda_version or ""

    # ======================================================
    # Installed
    # ======================================================

    def installed(self) -> bool:

        return self.cuda_version() != ""

    # ======================================================
    # CUDA Toolkit (nvcc)
    # ======================================================

    def nvcc_version(self) -> str:
        """
        Detect installed CUDA Toolkit version using nvcc.
        """

        try:

            output = subprocess.check_output(

                ["nvcc", "--version"],

                text=True,

                stderr=subprocess.DEVNULL

            )

            for line in output.splitlines():

                if "release" in line:

                    section = line.split("release")

                    if len(section) > 1:

                        version = (

                            section[1]

                            .split(",")

                            [0]

                            .strip()

                        )

                        return version

        except Exception:

            pass

        return ""

    # ======================================================
    # Toolkit Installed
    # ======================================================

    def toolkit_installed(self) -> bool:

        return self.nvcc_version() != ""

    # ======================================================
    # CUDA Paths
    # ======================================================

    def toolkit_paths(self) -> Dict:

        paths = {

            "CUDA_PATH": "",

            "CUDA_BIN": "",

            "CUDA_LIB": ""

        }

        base = Path("C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA")

        if base.exists():

            versions = sorted(base.iterdir())

            if versions:

                latest = versions[-1]

                paths["CUDA_PATH"] = str(latest)

                paths["CUDA_BIN"] = str(

                    latest / "bin"

                )

                paths["CUDA_LIB"] = str(

                    latest / "lib"

                )

        return paths

    # ======================================================
    # Installed Versions
    # ======================================================

    def installed_versions(self):

        versions = []

        base = Path(

            "C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA"

        )

        if base.exists():

            for folder in base.iterdir():

                if folder.is_dir():

                    versions.append(

                        folder.name

                    )

        return sorted(versions)

    # ======================================================
    # Latest Version
    # ======================================================

    def latest_version(self) -> str:

        versions = self.installed_versions()

        if not versions:

            return ""

        return versions[-1]

    # ======================================================
    # cuDNN
    # ======================================================

    def cudnn_installed(self) -> bool:
        """
        Detect cuDNN installation.
        """

        paths = self.toolkit_paths()

        cuda_path = paths.get("CUDA_PATH")

        if not cuda_path:

            return False

        candidates = [

            Path(cuda_path) / "bin" / "cudnn64*.dll",

            Path(cuda_path) / "lib" / "x64" / "cudnn.lib",

            Path(cuda_path) / "include" / "cudnn.h"

        ]

        for item in candidates:

            if "*" in str(item):

                parent = item.parent

                pattern = item.name

                if parent.exists():

                    if list(parent.glob(pattern)):

                        return True

            elif item.exists():

                return True

        return False

    # ======================================================
    # TensorRT
    # ======================================================

    def tensorrt_installed(self) -> bool:
        """
        Detect TensorRT installation.
        """

        folders = [

            Path("C:/Program Files/NVIDIA TensorRT"),

            Path("C:/TensorRT"),

        ]

        for folder in folders:

            if folder.exists():

                return True

        return False

    # ======================================================
    # Compute Capability
    # ======================================================

    def compute_capability(self) -> str:
        """
        Placeholder.

        Will later use CUDA Runtime API.
        """

        gpu = self.gpu_name().lower()

        if "rtx 50" in gpu:

            return "12.x"

        if "rtx 40" in gpu:

            return "8.9"

        if "rtx 30" in gpu:

            return "8.6"

        if "rtx 20" in gpu:

            return "7.5"

        if "gtx 16" in gpu:

            return "7.5"

        if "gtx 10" in gpu:

            return "6.1"

        return "Unknown"

    # ======================================================
    # Runtime Information
    # ======================================================

    def runtime(self) -> Dict:

        return {

            "cuda": self.cuda_version(),

            "nvcc": self.nvcc_version(),

            "driver": self.driver_version(),

            "compute": self.compute_capability(),

            "toolkit": self.toolkit_installed(),

            "cudnn": self.cudnn_installed(),

            "tensorrt": self.tensorrt_installed()

        }

    # ======================================================
    # AI Ready
    # ======================================================

    def ai_ready(self) -> bool:

        return (

            self.installed()

            and

            self.toolkit_installed()

        )

    # ======================================================
    # Performance Score
    # ======================================================

    def performance_score(self) -> int:
        """
        Estimate CUDA environment score.
        """

        score = 0

        if self.installed():
            score += 25

        if self.toolkit_installed():
            score += 25

        if self.cudnn_installed():
            score += 20

        if self.tensorrt_installed():
            score += 15

        if self.compute_capability() != "Unknown":
            score += 15

        return min(score, 100)

    # ======================================================
    # Performance Class
    # ======================================================

    def performance_class(self) -> str:

        score = self.performance_score()

        if score >= 90:
            return "Extreme"

        if score >= 75:
            return "High"

        if score >= 55:
            return "Medium"

        return "Low"

    # ======================================================
    # Summary
    # ======================================================

    def summary(self) -> Dict:

        return {

            "gpu": self.gpu_name(),

            "driver": self.driver_version(),

            "cuda_runtime": self.cuda_version(),

            "cuda_toolkit": self.nvcc_version(),

            "compute_capability": self.compute_capability(),

            "cudnn": self.cudnn_installed(),

            "tensorrt": self.tensorrt_installed(),

            "performance_score": self.performance_score(),

            "performance_class": self.performance_class(),

            "ai_ready": self.ai_ready()

        }

    # ======================================================
    # Health Check
    # ======================================================

    def health_check(self) -> Dict:

        try:

            return {

                "service": "CUDADetector",

                "status": "healthy",

                "cuda": self.installed(),

                "toolkit": self.toolkit_installed(),

                "cudnn": self.cudnn_installed(),

                "performance_class": self.performance_class()

            }

        except Exception as exc:

            return {

                "service": "CUDADetector",

                "status": "error",

                "error": str(exc)

            }

    # ======================================================
    # Export
    # ======================================================

    def export(self) -> Dict:

        return {

            "summary": self.summary(),

            "runtime": self.runtime(),

            "health": self.health_check()

        }

    # ======================================================
    # Refresh
    # ======================================================

    def refresh(self):

        self._loaded = False

        self._driver_version = None

        self._cuda_version = None

        self._gpu_name = None

        self.detect()

    # ======================================================
    # Dispose
    # ======================================================

    def dispose(self):

        self._loaded = False

        self._driver_version = None

        self._cuda_version = None

        self._gpu_name = None

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

            "<CUDADetector "

            f"cuda='{self.cuda_version()}' "

            f"class='{self.performance_class()}'>"

        )

    __str__ = __repr__