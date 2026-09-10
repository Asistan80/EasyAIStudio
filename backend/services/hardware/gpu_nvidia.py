"""
Easy AI Studio
GPU NVIDIA Detector
"""

from __future__ import annotations

import shutil
import subprocess


class NvidiaDetector:

    def __init__(self):

        self.available = False

        self.info = None

        self.detect()

    # ---------------------------------------------------------

    def detect(self):

        self.available = shutil.which("nvidia-smi") is not None

        if not self.available:
            return

        try:

            command = [

                "nvidia-smi",

                "--query-gpu="
                "name,"
                "driver_version,"
                "memory.total,"
                "temperature.gpu,"
                "utilization.gpu,"
                "power.draw",

                "--format=csv,noheader,nounits"

            ]

            result = subprocess.run(

                command,

                capture_output=True,

                text=True,

                timeout=5

            )

            if result.returncode != 0:
                return

            line = result.stdout.strip().splitlines()[0]

            parts = [x.strip() for x in line.split(",")]

            self.info = {

                "name": parts[0],

                "driver": parts[1],

                "memory_gb": round(float(parts[2]) / 1024, 2),

                "temperature": float(parts[3]),

                "utilization": float(parts[4]),

                "power_draw": float(parts[5]),

                "vendor": "NVIDIA",

                "cuda": True,

                "nvenc": True,

                "av1": True,

                "opencl": True,

                "vulkan": True

            }

        except Exception:

            self.info = None

    # ---------------------------------------------------------

    def summary(self):

        if self.info is None:

            return None

        return self.info.copy()