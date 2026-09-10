"""
==========================================================
Easy AI Studio
System Analyzer
==========================================================
"""

from __future__ import annotations

from typing import Dict

from services.hardware.hardware_service import HardwareService


class SystemAnalyzer:
    """
    Analyze the system and build
    automatic application settings.
    """

    def __init__(self):

        self.hardware = HardwareService()

        self._initialized = False

    # ======================================================
    # Initialize
    # ======================================================

    def initialize(self):

        if self._initialized:

            return

        self.hardware.initialize()

        self._initialized = True

    # ======================================================
    # Refresh
    # ======================================================

    def refresh(self):

        self._initialized = False

        self.hardware.refresh_all()

        self.initialize()

    # ======================================================
    # Hardware
    # ======================================================

    def hardware_report(self) -> Dict:

        self.initialize()

        return self.hardware.report()

    # ======================================================
    # Hardware Profile
    # ======================================================

    def hardware_profile(self) -> Dict:

        self.initialize()

        return self.hardware.profile()

    # ======================================================
    # AI Profile
    # ======================================================

    def ai_profile(self) -> Dict:

        self.initialize()

        return self.hardware.ai_profile()

    # ======================================================
    # Recommendation
    # ======================================================

    def recommendation(self) -> Dict:

        self.initialize()

        return self.hardware.recommendation()

    # ======================================================
    # Default AI Provider
    # ======================================================

    def default_ai_provider(self) -> str:
        """
        Select default AI provider.
        """

        profile = self.ai_profile()

        backend = profile.get(

            "preferred_backend",

            "CPU"

        )

        if backend == "CUDA":

            return "Ollama"

        if backend == "OpenCL":

            return "OpenCL"

        return "CPU"

    # ======================================================
    # Default Image Engine
    # ======================================================

    def default_image_engine(self) -> str:

        recommendation = self.recommendation()

        return recommendation["image"]["engine"]

    # ======================================================
    # Default Video Engine
    # ======================================================

    def default_video_engine(self) -> str:

        recommendation = self.recommendation()

        return recommendation["video"]["engine"]

    # ======================================================
    # Default LLM
    # ======================================================

    def default_llm(self) -> str:

        recommendation = self.recommendation()

        return recommendation["llm"]["model"]

    # ======================================================
    # Default Workers
    # ======================================================

    def default_workers(self) -> int:

        recommendation = self.recommendation()

        return recommendation["workers"]

    # ======================================================
    # Default Cache Size
    # ======================================================

    def default_cache_size(self) -> int:

        recommendation = self.recommendation()

        return recommendation["cache_gb"]

    # ======================================================
    # Default Export Directory
    # ======================================================

    def default_export_directory(self) -> str:

        return "exports"

    # ======================================================
    # Default Cache Directory
    # ======================================================

    def default_cache_directory(self) -> str:

        return "cache"

    # ======================================================
    # Default Temp Directory
    # ======================================================

    def default_temp_directory(self) -> str:

        return "temp"

    # ======================================================
    # Default Settings
    # ======================================================

    def default_settings(self) -> Dict:
        """
        Automatically generated settings.
        """

        return {

            "provider": self.default_ai_provider(),

            "image_engine": self.default_image_engine(),

            "video_engine": self.default_video_engine(),

            "llm": self.default_llm(),

            "workers": self.default_workers(),

            "cache_size_gb": self.default_cache_size(),

            "cache_directory": self.default_cache_directory(),

            "export_directory": self.default_export_directory(),

            "temp_directory": self.default_temp_directory()

        }

    # ======================================================
    # Performance Profile
    # ======================================================

    def performance_profile(self) -> Dict:
        """
        Build automatic performance profile.
        """

        hardware = self.hardware_profile()

        overall = hardware["class"]

        if overall == "Extreme":

            return {

                "profile": "Ultra",

                "batch_size": 8,

                "image_resolution": "2048x2048",

                "video_resolution": "1920x1080",

                "enable_gpu_acceleration": True,

                "enable_parallel_jobs": True,

                "enable_large_models": True,

                "precision": "fp16"

            }

        if overall == "High":

            return {

                "profile": "Performance",

                "batch_size": 4,

                "image_resolution": "1536x1536",

                "video_resolution": "1280x720",

                "enable_gpu_acceleration": True,

                "enable_parallel_jobs": True,

                "enable_large_models": True,

                "precision": "fp16"

            }

        if overall == "Medium":

            return {

                "profile": "Balanced",

                "batch_size": 2,

                "image_resolution": "1024x1024",

                "video_resolution": "1280x720",

                "enable_gpu_acceleration": True,

                "enable_parallel_jobs": False,

                "enable_large_models": False,

                "precision": "fp16"

            }

        return {

            "profile": "Eco",

            "batch_size": 1,

            "image_resolution": "768x768",

            "video_resolution": "854x480",

            "enable_gpu_acceleration": False,

            "enable_parallel_jobs": False,

            "enable_large_models": False,

            "precision": "fp32"

        }

    # ======================================================
    # Memory Optimization
    # ======================================================

    def memory_profile(self) -> Dict:

        ram = self.hardware.memory.total_gb()

        return {

            "ram_gb": ram,

            "recommended_cache_gb": self.default_cache_size(),

            "preload_models": ram >= 32,

            "keep_models_loaded": ram >= 64

        }

    # ======================================================
    # GPU Optimization
    # ======================================================

    def gpu_profile(self) -> Dict:

        gpu = self.hardware.gpu.summary()

        return {

            "gpu_available": gpu["performance_score"] > 0,

            "vendor": gpu["vendor"],

            "nvenc": self.hardware.gpu.supports_nvenc(),

            "av1": self.hardware.gpu.supports_av1(),

            "cuda": self.hardware.cuda.ai_ready(),

            "opencl": self.hardware.opencl.ai_ready(),

            "vulkan": self.hardware.vulkan.ai_ready()

        }

    # ======================================================
    # CPU Optimization
    # ======================================================

    def cpu_profile(self) -> Dict:

        return {

            "threads": self.default_workers(),

            "logical_cores": self.hardware.cpu.logical_cores(),

            "physical_cores": self.hardware.cpu.physical_cores(),

            "turbo": self.hardware.cpu.max_frequency() > 4000

        }

    # ======================================================
    # Optimization Summary
    # ======================================================

    def optimization(self) -> Dict:

        return {

            "performance": self.performance_profile(),

            "memory": self.memory_profile(),

            "gpu": self.gpu_profile(),

            "cpu": self.cpu_profile()

        }

    # ======================================================
    # Provider Priority
    # ======================================================

    def provider_priority(self) -> list[str]:
        """
        Provider priority order.
        """

        backend = self.default_ai_provider()

        if backend == "Ollama":

            return [

                "Ollama",

                "ComfyUI",

                "OpenCL",

                "CPU"

            ]

        if backend == "OpenCL":

            return [

                "OpenCL",

                "CPU"

            ]

        return [

            "CPU"

        ]

    # ======================================================
    # Startup Configuration
    # ======================================================

    def startup_configuration(self) -> Dict:

        self.initialize()

        return {

            "hardware": self.hardware_profile(),

            "ai": self.ai_profile(),

            "defaults": self.default_settings(),

            "optimization": self.optimization(),

            "provider_priority": self.provider_priority()

        }

    # ======================================================
    # Validation
    # ======================================================

    def validate(self) -> Dict:

        config = self.startup_configuration()

        errors = []

        if not self.hardware.ready():

            errors.append(

                "Hardware not initialized."

            )

        if config["defaults"]["workers"] <= 0:

            errors.append(

                "Invalid worker configuration."

            )

        return {

            "valid": len(errors) == 0,

            "errors": errors

        }

    # ======================================================
    # Export
    # ======================================================

    def export(self) -> Dict:

        return {

            "configuration": self.startup_configuration(),

            "validation": self.validate()

        }

    # ======================================================
    # Dispose
    # ======================================================

    def dispose(self):

        self.hardware.dispose()

        self._initialized = False

    # ======================================================
    # Context Manager
    # ======================================================

    def __enter__(self):

        self.initialize()

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

            "<SystemAnalyzer "

            f"profile='{self.performance_profile()['profile']}' "

            f"provider='{self.default_ai_provider()}'>"

        )

    __str__ = __repr__