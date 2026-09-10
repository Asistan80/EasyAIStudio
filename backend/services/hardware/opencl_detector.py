"""
==========================================================
Easy AI Studio
OpenCL Detector
==========================================================
"""

from __future__ import annotations

import subprocess
from typing import Dict
from typing import List
from typing import Optional


class OpenCLDetector:
    """
    Detect OpenCL platforms and devices.
    """

    def __init__(self):

        self._loaded = False

        self._platforms: List[str] = []

        self._devices: List[str] = []

    # ======================================================
    # Detect
    # ======================================================

    def detect(self):

        if self._loaded:

            return

        self._loaded = True

        self._detect_clinfo()

    # ======================================================
    # clinfo
    # ======================================================

    def _detect_clinfo(self):

        try:

            output = subprocess.check_output(

                ["clinfo"],

                text=True,

                stderr=subprocess.DEVNULL

            )

            for line in output.splitlines():

                text = line.strip()

                if text.startswith("Platform Name"):

                    value = text.split(":", 1)[1].strip()

                    self._platforms.append(value)

                    continue

                if text.startswith("Device Name"):

                    value = text.split(":", 1)[1].strip()

                    self._devices.append(value)

        except Exception:

            pass

    # ======================================================
    # Installed
    # ======================================================

    def installed(self) -> bool:

        self.detect()

        return len(self._platforms) > 0

    # ======================================================
    # Platforms
    # ======================================================

    def platforms(self) -> List[str]:

        self.detect()

        return list(self._platforms)

    # ======================================================
    # Devices
    # ======================================================

    def devices(self) -> List[str]:

        self.detect()

        return list(self._devices)

    # ======================================================
    # Primary Device
    # ======================================================

    def primary_device(self) -> Optional[str]:

        self.detect()

        if not self._devices:

            return None

        return self._devices[0]

    # ======================================================
    # Platform Count
    # ======================================================

    def platform_count(self) -> int:

        self.detect()

        return len(self._platforms)

    # ======================================================
    # Device Count
    # ======================================================

    def device_count(self) -> int:

        self.detect()

        return len(self._devices)

    # ======================================================
    # Vendor Detection
    # ======================================================

    def vendor(self) -> str:

        device = self.primary_device()

        if device is None:

            return "Unknown"

        name = device.lower()

        if "nvidia" in name:

            return "NVIDIA"

        if "amd" in name:

            return "AMD"

        if "radeon" in name:

            return "AMD"

        if "intel" in name:

            return "Intel"

        if "apple" in name:

            return "Apple"

        if "qualcomm" in name:

            return "Qualcomm"

        if "arm" in name:

            return "ARM"

        return "Unknown"

    # ======================================================
    # Vendor Helpers
    # ======================================================

    def is_nvidia(self) -> bool:

        return self.vendor() == "NVIDIA"

    def is_amd(self) -> bool:

        return self.vendor() == "AMD"

    def is_intel(self) -> bool:

        return self.vendor() == "Intel"

    # ======================================================
    # OpenCL Version
    # ======================================================

    def version(self) -> str:

        try:

            output = subprocess.check_output(

                ["clinfo"],

                text=True,

                stderr=subprocess.DEVNULL

            )

            for line in output.splitlines():

                text = line.strip()

                if text.startswith("Platform Version"):

                    value = text.split(":", 1)[1].strip()

                    return value

        except Exception:

            pass

        return ""

    # ======================================================
    # Platform Information
    # ======================================================

    def platform_info(self) -> Dict:

        return {

            "platforms": self.platforms(),

            "devices": self.devices(),

            "platform_count": self.platform_count(),

            "device_count": self.device_count(),

            "vendor": self.vendor(),

            "version": self.version()

        }

    # ======================================================
    # Performance Score
    # ======================================================

    def performance_score(self) -> int:
        """
        Estimate OpenCL performance score.
        """

        score = 0

        if self.installed():

            score += 40

        if self.is_nvidia():

            score += 35

        elif self.is_amd():

            score += 30

        elif self.is_intel():

            score += 20

        if self.device_count() >= 2:

            score += 15

        elif self.device_count() == 1:

            score += 10

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
    # AI Ready
    # ======================================================

    def ai_ready(self) -> bool:

        return self.installed()

    # ======================================================
    # Summary
    # ======================================================

    def summary(self) -> Dict:

        return {

            "vendor": self.vendor(),

            "version": self.version(),

            "platform_count": self.platform_count(),

            "device_count": self.device_count(),

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

                "service": "OpenCLDetector",

                "status": "healthy",

                "installed": self.installed(),

                "vendor": self.vendor(),

                "performance_class": self.performance_class()

            }

        except Exception as exc:

            return {

                "service": "OpenCLDetector",

                "status": "error",

                "error": str(exc)

            }

    # ======================================================
    # Export
    # ======================================================

    def export(self) -> Dict:

        return {

            "summary": self.summary(),

            "platform_info": self.platform_info(),

            "health": self.health_check()

        }

    # ======================================================
    # Refresh
    # ======================================================

    def refresh(self):

        self._loaded = False

        self._platforms.clear()

        self._devices.clear()

        self.detect()

    # ======================================================
    # Dispose
    # ======================================================

    def dispose(self):

        self._loaded = False

        self._platforms.clear()

        self._devices.clear()

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

            "<OpenCLDetector "

            f"vendor='{self.vendor()}' "

            f"class='{self.performance_class()}'>"

        )

    __str__ = __repr__