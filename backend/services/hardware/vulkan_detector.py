"""
==========================================================
Easy AI Studio
Vulkan Detector
==========================================================
"""

from __future__ import annotations

import subprocess
from typing import Dict
from typing import List
from typing import Optional


class VulkanDetector:
    """
    Detect Vulkan Runtime and Devices.
    """

    def __init__(self):

        self._loaded = False

        self._runtime_version = ""

        self._devices: List[str] = []

    # ======================================================
    # Detect
    # ======================================================

    def detect(self):

        if self._loaded:

            return

        self._loaded = True

        self._detect_vulkan()

    # ======================================================
    # Vulkan Info
    # ======================================================

    def _detect_vulkan(self):

        try:

            output = subprocess.check_output(

                [

                    "vulkaninfo"

                ],

                text=True,

                stderr=subprocess.DEVNULL

            )

            for line in output.splitlines():

                text = line.strip()

                if text.startswith("Vulkan Instance Version"):

                    self._runtime_version = (

                        text

                        .split(":")

                        [-1]

                        .strip()

                    )

                elif text.startswith("GPU id"):

                    self._devices.append(text)

                elif text.startswith("deviceName"):

                    name = text.split("=")[-1].strip()

                    self._devices.append(name)

        except Exception:

            pass

    # ======================================================
    # Installed
    # ======================================================

    def installed(self) -> bool:

        self.detect()

        return self._runtime_version != ""

    # ======================================================
    # Runtime Version
    # ======================================================

    def runtime_version(self) -> str:

        self.detect()

        return self._runtime_version

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

        if "arc" in name:
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
    # Vulkan SDK
    # ======================================================

    def sdk_installed(self) -> bool:

        try:

            subprocess.check_output(

                ["glslc", "--version"],

                text=True,

                stderr=subprocess.DEVNULL

            )

            return True

        except Exception:

            return False

    # ======================================================
    # API Version
    # ======================================================

    def api_version(self) -> str:

        version = self.runtime_version()

        if version:

            return version

        return "Unknown"

    # ======================================================
    # Platform Information
    # ======================================================

    def platform_info(self) -> Dict:

        return {

            "runtime": self.runtime_version(),

            "api_version": self.api_version(),

            "sdk_installed": self.sdk_installed(),

            "vendor": self.vendor(),

            "device_count": self.device_count(),

            "devices": self.devices()

        }

    # ======================================================
    # Ray Tracing Support
    # ======================================================

    def supports_ray_tracing(self) -> bool:
        """
        Estimate Vulkan Ray Tracing support.

        NOTE:
        Future versions will use Vulkan API directly.
        """

        device = self.primary_device()

        if device is None:

            return False

        name = device.lower()

        if "rtx" in name:

            return True

        if "rx 6" in name:

            return True

        if "rx 7" in name:

            return True

        if "arc" in name:

            return True

        return False

    # ======================================================
    # Mesh Shader Support
    # ======================================================

    def supports_mesh_shader(self) -> bool:

        device = self.primary_device()

        if device is None:

            return False

        gpu = device.lower()

        if "rtx 40" in gpu:

            return True

        if "rtx 50" in gpu:

            return True

        if "arc" in gpu:

            return True

        if "rx 7" in gpu:

            return True

        return False

    # ======================================================
    # Compute Queue
    # ======================================================

    def supports_compute(self) -> bool:
        """
        Every Vulkan capable GPU supports compute.

        Future:
            VK_QUEUE_COMPUTE_BIT detection.
        """

        return self.installed()

    # ======================================================
    # Graphics Queue
    # ======================================================

    def supports_graphics(self) -> bool:

        return self.installed()

    # ======================================================
    # Transfer Queue
    # ======================================================

    def supports_transfer(self) -> bool:

        return self.installed()

    # ======================================================
    # Vulkan Features
    # ======================================================

    def features(self) -> Dict:

        return {

            "graphics": self.supports_graphics(),

            "compute": self.supports_compute(),

            "transfer": self.supports_transfer(),

            "ray_tracing": self.supports_ray_tracing(),

            "mesh_shader": self.supports_mesh_shader()

        }

    # ======================================================
    # Performance Score
    # ======================================================

    def performance_score(self) -> int:

        score = 0

        if self.installed():

            score += 35

        if self.sdk_installed():

            score += 20

        if self.supports_compute():

            score += 15

        if self.supports_ray_tracing():

            score += 15

        if self.supports_mesh_shader():

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
    # AI Ready
    # ======================================================

    def ai_ready(self) -> bool:
        """
        Vulkan compute ready.
        """

        return (

            self.installed()

            and

            self.supports_compute()

        )

    # ======================================================
    # Summary
    # ======================================================

    def summary(self) -> Dict:

        return {

            "runtime": self.runtime_version(),

            "vendor": self.vendor(),

            "device": self.primary_device(),

            "device_count": self.device_count(),

            "sdk": self.sdk_installed(),

            "features": self.features(),

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

                "service": "VulkanDetector",

                "status": "healthy",

                "installed": self.installed(),

                "vendor": self.vendor(),

                "runtime": self.runtime_version(),

                "performance_class": self.performance_class()

            }

        except Exception as exc:

            return {

                "service": "VulkanDetector",

                "status": "error",

                "error": str(exc)

            }

    # ======================================================
    # Export
    # ======================================================

    def export(self) -> Dict:

        return {

            "summary": self.summary(),

            "platform": self.platform_info(),

            "health": self.health_check()

        }

    # ======================================================
    # Refresh
    # ======================================================

    def refresh(self):

        self._loaded = False

        self._runtime_version = ""

        self._devices.clear()

        self.detect()

    # ======================================================
    # Dispose
    # ======================================================

    def dispose(self):

        self._loaded = False

        self._runtime_version = ""

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

            "<VulkanDetector "

            f"vendor='{self.vendor()}' "

            f"class='{self.performance_class()}'>"

        )

    __str__ = __repr__