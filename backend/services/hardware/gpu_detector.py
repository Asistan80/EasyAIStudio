"""
Easy AI Studio
GPU Detector
"""

from __future__ import annotations

import platform
import subprocess

from .gpu_nvidia import NvidiaDetector
from .gpu_scoring import GPUScoring
from .gpu_ai_profile import GPUAIProfile


class GPUDetector:

    def __init__(self):

        self.platform = platform.system()

        self.gpus = []

        self.primary_gpu = None

        self.score_engine = GPUScoring()

        self.ai_engine = GPUAIProfile()

        self.detect()

    # ---------------------------------------------------------

    def detect(self):

        self.gpus.clear()

        if self.platform == "Windows":

            self._detect_windows()

        elif self.platform == "Linux":

            self._detect_linux()

        elif self.platform == "Darwin":

            self._detect_macos()

        self._select_primary_gpu()

    # ---------------------------------------------------------

    def _detect_windows(self):

        self._detect_windows_gpus()

        nvidia = NvidiaDetector()

        info = nvidia.summary()

        if info:

            self._replace_or_add_gpu(info)

    # ---------------------------------------------------------

    def _detect_linux(self):

        pass

    # ---------------------------------------------------------

    def _detect_macos(self):

        pass

    # ---------------------------------------------------------

    def _detect_windows_gpus(self):

        try:

            command = [

                "powershell",

                "-NoProfile",

                "-Command",

                "Get-CimInstance Win32_VideoController | "
                "Select-Object Name,DriverVersion | "
                "ConvertTo-Csv -NoTypeInformation"

            ]

            output = subprocess.check_output(

                command,

                text=True,

                encoding="utf-8",

                errors="ignore"

            )

            for line in output.splitlines():

                line = line.strip()

                if not line:

                    continue

                if line.startswith('"Name"'):

                    continue

                parts = [

                    p.strip().replace('"', "")

                    for p in line.split(",")

                ]

                if len(parts) < 2:

                    continue

                name = parts[0]

                driver = parts[1]

                vendor = self._vendor(name)

                self.gpus.append({

                    "name": name,

                    "driver": driver,

                    "vendor": vendor,

                    "memory_gb": None,

                    "cuda": False,

                    "nvenc": False,

                    "av1": False,

                    "opencl": False,

                    "vulkan": False

                })

        except Exception:

            pass

    # ---------------------------------------------------------

    def _replace_or_add_gpu(self, gpu):

        for i, existing in enumerate(self.gpus):

            if existing["vendor"] == gpu["vendor"]:

                self.gpus[i] = gpu

                return

        self.gpus.append(gpu)

    # ---------------------------------------------------------

    def _vendor(self, name):

        upper = name.upper()

        if "NVIDIA" in upper:

            return "NVIDIA"

        if "AMD" in upper or "RADEON" in upper:

            return "AMD"

        if "INTEL" in upper:

            return "Intel"

        return "Unknown"

    # ---------------------------------------------------------

    def _select_primary_gpu(self):

        if not self.gpus:

            return

        for gpu in self.gpus:

            gpu["score"] = self.score_engine.calculate(gpu)

        self.gpus.sort(

            key=lambda g: g["score"],

            reverse=True

        )

        self.primary_gpu = self.gpus[0]

    # ---------------------------------------------------------

    def summary(self):

        if self.primary_gpu is None:

            return None

        gpu = self.primary_gpu.copy()

        gpu["ai"] = self.ai_engine.build(gpu)

        return gpu

    # ---------------------------------------------------------

    def report(self):

        return {

            "platform": self.platform,

            "gpu_count": len(self.gpus),

            "primary_gpu": self.primary_gpu,

            "gpus": self.gpus

        }