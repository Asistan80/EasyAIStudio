"""
==========================================================
Easy AI Studio
CPU Detector
==========================================================
"""

from __future__ import annotations

import os
import platform
from typing import Dict
from typing import Optional

import psutil


class CPUDetector:
    """
    Detect CPU information and capabilities.
    """

    def __init__(self):

        self._cpu_name: Optional[str] = None

        self._platform = platform.system()

        self._architecture = platform.machine()

    # ======================================================
    # Basic Information
    # ======================================================

    def cpu_name(self) -> str:

        if self._cpu_name:

            return self._cpu_name

        if self._platform == "Windows":

            self._cpu_name = platform.processor()

        elif self._platform == "Linux":

            try:

                with open("/proc/cpuinfo", "r", encoding="utf-8") as fp:

                    for line in fp:

                        if "model name" in line:

                            self._cpu_name = (

                                line.split(":")

                                [-1]

                                .strip()

                            )

                            break

            except Exception:

                self._cpu_name = platform.processor()

        else:

            self._cpu_name = platform.processor()

        return self._cpu_name or "Unknown CPU"

    # ======================================================
    # Architecture
    # ======================================================

    def architecture(self) -> str:

        return self._architecture

    # ======================================================
    # Core Count
    # ======================================================

    def physical_cores(self) -> int:

        return psutil.cpu_count(

            logical=False

        ) or 0

    def logical_cores(self) -> int:

        return psutil.cpu_count(

            logical=True

        ) or 0

    # ======================================================
    # Frequency
    # ======================================================

    def frequency(self) -> Dict:

        freq = psutil.cpu_freq()

        if freq is None:

            return {

                "current": 0.0,

                "min": 0.0,

                "max": 0.0

            }

        return {

            "current": round(

                freq.current,

                2

            ),

            "min": round(

                freq.min,

                2

            ),

            "max": round(

                freq.max,

                2

            )

        }

    # ======================================================
    # Operating System
    # ======================================================

    def operating_system(self) -> Dict:

        return {

            "system": platform.system(),

            "release": platform.release(),

            "version": platform.version(),

            "machine": platform.machine(),

            "python": platform.python_version()

        }

    # ======================================================
    # CPU Usage
    # ======================================================

    def usage(
        self,
        interval: float = 0.2
    ) -> float:
        """
        Total CPU usage percentage.
        """

        return psutil.cpu_percent(
            interval=interval
        )

    # ======================================================
    # Per Core Usage
    # ======================================================

    def per_core_usage(
        self,
        interval: float = 0.2
    ) -> list:

        return psutil.cpu_percent(

            interval=interval,

            percpu=True

        )

    # ======================================================
    # CPU Times
    # ======================================================

    def cpu_times(self) -> Dict:

        times = psutil.cpu_times()

        return {

            "user": getattr(times, "user", 0.0),

            "system": getattr(times, "system", 0.0),

            "idle": getattr(times, "idle", 0.0),

            "interrupt": getattr(times, "interrupt", 0.0),

            "dpc": getattr(times, "dpc", 0.0)

            if hasattr(times, "dpc")

            else 0.0

        }

    # ======================================================
    # Load Average
    # ======================================================

    def load_average(self) -> Dict:

        if hasattr(os, "getloadavg"):

            try:

                load = os.getloadavg()

                return {

                    "1min": load[0],

                    "5min": load[1],

                    "15min": load[2]

                }

            except Exception:

                pass

        return {

            "1min": 0.0,

            "5min": 0.0,

            "15min": 0.0

        }

    # ======================================================
    # CPU Temperature
    # ======================================================

    def temperature(self) -> Optional[float]:
        """
        Read CPU temperature if available.
        """

        try:

            temps = psutil.sensors_temperatures()

            if not temps:

                return None

            for _, values in temps.items():

                if values:

                    return float(

                        values[0].current

                    )

        except Exception:

            pass

        return None

    # ======================================================
    # CPU Stats
    # ======================================================

    def statistics(self) -> Dict:

        stats = psutil.cpu_stats()

        return {

            "ctx_switches": stats.ctx_switches,

            "interrupts": stats.interrupts,

            "soft_interrupts": getattr(

                stats,

                "soft_interrupts",

                0

            ),

            "syscalls": getattr(

                stats,

                "syscalls",

                0

            )

        }

    # ======================================================
    # Vendor
    # ======================================================

    def vendor(self) -> str:
        """
        Detect CPU vendor.
        """

        name = self.cpu_name().lower()

        if "intel" in name:

            return "Intel"

        if "amd" in name:

            return "AMD"

        if "apple" in name:

            return "Apple"

        if "arm" in name:

            return "ARM"

        if "qualcomm" in name:

            return "Qualcomm"

        return "Unknown"

    # ======================================================
    # Hyper Threading
    # ======================================================

    def hyper_threading(self) -> bool:

        return (

            self.logical_cores()

            >

            self.physical_cores()

        )

    # ======================================================
    # Virtualization
    # ======================================================

    def virtualization_supported(self) -> bool:
        """
        Best-effort virtualization detection.
        """

        name = self.cpu_name().lower()

        keywords = [

            "vt-x",
            "amd-v",
            "svm",
            "vmx"

        ]

        for keyword in keywords:

            if keyword in name:

                return True

        return False

    # ======================================================
    # Instruction Set Support
    # ======================================================

    def instruction_sets(self) -> Dict:
        """
        Best-effort instruction set detection.
        """

        name = self.cpu_name().lower()

        return {

            "sse": "sse" in name,

            "sse2": "sse2" in name,

            "sse3": "sse3" in name,

            "ssse3": "ssse3" in name,

            "sse4": (

                "sse4" in name

                or

                "sse4.1" in name

                or

                "sse4.2" in name

            ),

            "avx": "avx" in name,

            "avx2": "avx2" in name,

            "avx512": "avx512" in name

        }

    # ======================================================
    # Full Information
    # ======================================================

    def full_info(self) -> Dict:

        return {

            "name": self.cpu_name(),

            "vendor": self.vendor(),

            "architecture": self.architecture(),

            "physical_cores": self.physical_cores(),

            "logical_cores": self.logical_cores(),

            "hyper_threading": self.hyper_threading(),

            "frequency": self.frequency(),

            "usage": self.usage(0),

            "per_core_usage": self.per_core_usage(0),

            "temperature": self.temperature(),

            "statistics": self.statistics(),

            "instruction_sets": self.instruction_sets(),

            "virtualization": self.virtualization_supported(),

            "operating_system": self.operating_system()

        }

    # ======================================================
    # Performance Score
    # ======================================================

    def performance_score(self) -> int:
        """
        Calculate an estimated CPU performance score.

        Score Range:
            0 - 100
        """

        score = 0

        physical = self.physical_cores()
        logical = self.logical_cores()

        freq = self.frequency()["max"]

        score += min(physical * 6, 48)

        score += min(logical * 2, 24)

        score += min(int(freq / 100), 20)

        instructions = self.instruction_sets()

        if instructions["avx"]:
            score += 2

        if instructions["avx2"]:
            score += 3

        if instructions["avx512"]:
            score += 3

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
    # AI Recommendation
    # ======================================================

    def ai_recommendation(self) -> Dict:

        level = self.performance_class()

        recommendations = {

            "Low": [
                "Small LLM models",
                "Image generation (CPU fallback)",
                "Basic automation"
            ],

            "Medium": [
                "7B LLM models",
                "Stable Diffusion",
                "Video encoding"
            ],

            "High": [
                "13B LLM models",
                "Multiple AI providers",
                "Large image generation",
                "Fast rendering"
            ],

            "Extreme": [
                "Large LLM models",
                "Heavy AI workflows",
                "Professional rendering",
                "Parallel encoding"
            ]

        }

        return {

            "class": level,

            "recommended": recommendations[level]

        }

    # ======================================================
    # Render Recommendation
    # ======================================================

    def render_recommendation(self) -> Dict:

        level = self.performance_class()

        workers = {

            "Low": 1,

            "Medium": 2,

            "High": 4,

            "Extreme": 8

        }

        return {

            "performance": level,

            "recommended_workers": workers[level],

            "hardware_encoding": (

                level != "Low"

            )

        }

    # ======================================================
    # Summary
    # ======================================================

    def summary(self) -> Dict:

        return {

            "cpu": self.cpu_name(),

            "vendor": self.vendor(),

            "class": self.performance_class(),

            "score": self.performance_score(),

            "cores": self.physical_cores(),

            "threads": self.logical_cores(),

            "frequency": self.frequency()["max"],

            "ai": self.ai_recommendation(),

            "render": self.render_recommendation()

        }

    # ======================================================
    # Health Check
    # ======================================================

    def health_check(self) -> Dict:
        """
        Health information for CPU detector.
        """

        try:

            return {

                "service": "CPUDetector",

                "status": "healthy",

                "cpu_detected": self.cpu_name() != "Unknown CPU",

                "vendor": self.vendor(),

                "architecture": self.architecture(),

                "physical_cores": self.physical_cores(),

                "logical_cores": self.logical_cores(),

                "performance_class": self.performance_class()

            }

        except Exception as exc:

            return {

                "service": "CPUDetector",

                "status": "error",

                "error": str(exc)

            }

    # ======================================================
    # Refresh
    # ======================================================

    def refresh(self):
        """
        Refresh cached CPU information.
        """

        self._cpu_name = None

    # ======================================================
    # Export
    # ======================================================

    def export(self) -> Dict:
        """
        Export complete CPU information.
        """

        return {

            "summary": self.summary(),

            "details": self.full_info(),

            "health": self.health_check()

        }

    # ======================================================
    # Dispose
    # ======================================================

    def dispose(self):
        """
        Release cached resources.
        """

        self._cpu_name = None

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

            "<CPUDetector "

            f"vendor='{self.vendor()}' "

            f"cpu='{self.cpu_name()}' "

            f"class='{self.performance_class()}'>"

        )

    __str__ = __repr__