"""
==========================================================
Easy AI Studio
Hardware Service
==========================================================
"""

from __future__ import annotations

from typing import Dict
from typing import Optional

from services.hardware.cpu_detector import CPUDetector
from services.hardware.gpu_detector import GPUDetector
from services.hardware.memory_detector import MemoryDetector
from services.hardware.storage_detector import StorageDetector
from services.hardware.cuda_detector import CUDADetector
from services.hardware.opencl_detector import OpenCLDetector
from services.hardware.vulkan_detector import VulkanDetector


class HardwareService:
    """
    Central hardware management service.

    Responsible for managing every hardware detector.
    """

    def __init__(self):

        self.cpu = CPUDetector()

        self.gpu = GPUDetector()

        self.memory = MemoryDetector()

        self.storage = StorageDetector()

        self.cuda = CUDADetector()

        self.opencl = OpenCLDetector()

        self.vulkan = VulkanDetector()

        self._initialized = False

    # ======================================================
    # Initialize
    # ======================================================

    def initialize(self):

        if self._initialized:

            return

        self.cpu.refresh()

        self.gpu.refresh()

        self.memory.refresh()

        self.storage.refresh()

        self.cuda.refresh()

        self.opencl.refresh()

        self.vulkan.refresh()

        self._initialized = True

    # ======================================================
    # Refresh
    # ======================================================

    def refresh(self):

        self._initialized = False

        self.initialize()

    # ======================================================
    # CPU
    # ======================================================

    def cpu_summary(self) -> Dict:

        self.initialize()

        return self.cpu.summary()

    # ======================================================
    # GPU
    # ======================================================

    def gpu_summary(self) -> Dict:

        self.initialize()

        return self.gpu.summary()

    # ======================================================
    # Memory
    # ======================================================

    def memory_summary(self) -> Dict:

        self.initialize()

        return self.memory.summary()

    # ======================================================
    # Storage
    # ======================================================

    def storage_summary(self) -> Dict:

        self.initialize()

        return self.storage.summary()

    # ======================================================
    # CUDA
    # ======================================================

    def cuda_summary(self) -> Dict:

        self.initialize()

        return self.cuda.summary()

    # ======================================================
    # OpenCL
    # ======================================================

    def opencl_summary(self) -> Dict:

        self.initialize()

        return self.opencl.summary()

    # ======================================================
    # Vulkan
    # ======================================================

    def vulkan_summary(self) -> Dict:

        self.initialize()

        return self.vulkan.summary()

    # ======================================================
    # Hardware Summary
    # ======================================================

    def summary(self) -> Dict:
        """
        Return complete hardware summary.
        """

        self.initialize()

        return {

            "cpu": self.cpu.summary(),

            "gpu": self.gpu.summary(),

            "memory": self.memory.summary(),

            "storage": self.storage.summary(),

            "cuda": self.cuda.summary(),

            "opencl": self.opencl.summary(),

            "vulkan": self.vulkan.summary()

        }

    # ======================================================
    # Performance Score
    # ======================================================

    def performance_score(self) -> int:
        """
        Overall hardware score.
        """

        self.initialize()

        scores = [

            self.cpu.performance_score(),

            self.gpu.performance_score(),

            self.memory.performance_score(),

            self.storage.performance_score(),

            self.cuda.performance_score(),

            self.opencl.performance_score(),

            self.vulkan.performance_score()

        ]

        scores = [

            score

            for score in scores

            if score > 0

        ]

        if not scores:

            return 0

        return round(

            sum(scores)

            / len(scores)

        )

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
    # Hardware Profile
    # ======================================================

    def profile(self) -> Dict:

        return {

            "score": self.performance_score(),

            "class": self.performance_class(),

            "cpu": self.cpu.performance_class(),

            "gpu": self.gpu.performance_class(),

            "memory": self.memory.performance_class(),

            "storage": self.storage.performance_class()

        }

    # ======================================================
    # Hardware Ready
    # ======================================================

    def ready(self) -> bool:

        self.initialize()

        return (

            self.cpu is not None

            and

            self.memory.total_gb() > 0

        )

    # ======================================================
    # AI Backend Selection
    # ======================================================

    def preferred_ai_backend(self) -> str:
        """
        Select the best AI compute backend.

        Priority:

            CUDA
            OpenCL
            CPU
        """

        self.initialize()

        if self.cuda.ai_ready():

            return "CUDA"

        if self.opencl.ai_ready():

            return "OpenCL"

        return "CPU"

    # ======================================================
    # Image Generation Backend
    # ======================================================

    def image_backend(self) -> str:
        """
        Recommended backend for image generation.
        """

        backend = self.preferred_ai_backend()

        if backend == "CUDA":

            return "ComfyUI"

        if backend == "OpenCL":

            return "OpenCL"

        return "CPU"

    # ======================================================
    # Video Generation Backend
    # ======================================================

    def video_backend(self) -> str:
        """
        Recommended backend for video generation.
        """

        backend = self.preferred_ai_backend()

        if backend == "CUDA":

            return "CUDA"

        if backend == "OpenCL":

            return "OpenCL"

        return "CPU"

    # ======================================================
    # LLM Backend
    # ======================================================

    def llm_backend(self) -> str:
        """
        Backend used for local language models.
        """

        backend = self.preferred_ai_backend()

        if backend == "CUDA":

            return "CUDA"

        return "CPU"

    # ======================================================
    # Render Backend
    # ======================================================

    def render_backend(self) -> str:

        if self.gpu.supports_nvenc():

            return "NVENC"

        if self.vulkan.ai_ready():

            return "Vulkan"

        if self.opencl.ai_ready():

            return "OpenCL"

        return "CPU"

    # ======================================================
    # AI Profile
    # ======================================================

    def ai_profile(self) -> Dict:

        return {

            "preferred_backend": self.preferred_ai_backend(),

            "image_backend": self.image_backend(),

            "video_backend": self.video_backend(),

            "llm_backend": self.llm_backend(),

            "render_backend": self.render_backend()

        }

    # ======================================================
    # Recommended LLM
    # ======================================================

    def recommended_llm(self) -> Dict:
        """
        Recommend the largest practical local LLM.
        """

        ram = self.memory.total_gb()
        vram = self.gpu.memory_gb()

        if ram >= 128 and vram >= 24:

            return {

                "model": "70B",

                "mode": "Full Precision"

            }

        if ram >= 64 and vram >= 16:

            return {

                "model": "30B",

                "mode": "Quantized"

            }

        if ram >= 32 and vram >= 12:

            return {

                "model": "13B",

                "mode": "Quantized"

            }

        if ram >= 16 and vram >= 8:

            return {

                "model": "7B",

                "mode": "Quantized"

            }

        return {

            "model": "3B",

            "mode": "Small"

        }

    # ======================================================
    # Recommended Image Engine
    # ======================================================

    def recommended_image_engine(self) -> Dict:

        gpu_score = self.gpu.performance_score()

        if gpu_score >= 90:

            return {

                "engine": "Flux",

                "quality": "Ultra"

            }

        if gpu_score >= 70:

            return {

                "engine": "SDXL",

                "quality": "High"

            }

        if gpu_score >= 50:

            return {

                "engine": "Stable Diffusion",

                "quality": "Balanced"

            }

        return {

            "engine": "CPU",

            "quality": "Basic"

        }

    # ======================================================
    # Recommended Video Engine
    # ======================================================

    def recommended_video_engine(self) -> Dict:

        gpu_score = self.gpu.performance_score()

        if gpu_score >= 80:

            return {

                "engine": "Wan",

                "resolution": "1080p"

            }

        if gpu_score >= 60:

            return {

                "engine": "AnimateDiff",

                "resolution": "720p"

            }

        return {

            "engine": "CPU",

            "resolution": "480p"

        }

    # ======================================================
    # Recommended Workers
    # ======================================================

    def recommended_workers(self) -> int:

        cores = self.cpu.logical_cores()

        if cores >= 32:

            return 8

        if cores >= 16:

            return 6

        if cores >= 12:

            return 4

        if cores >= 8:

            return 3

        return 2

    # ======================================================
    # Recommended Cache Size
    # ======================================================

    def recommended_cache_size(self) -> int:
        """
        Cache size in GB.
        """

        ram = self.memory.total_gb()

        if ram >= 128:

            return 32

        if ram >= 64:

            return 16

        if ram >= 32:

            return 8

        if ram >= 16:

            return 4

        return 2

    # ======================================================
    # AI Recommendation
    # ======================================================

    def recommendation(self) -> Dict:

        return {

            "llm": self.recommended_llm(),

            "image": self.recommended_image_engine(),

            "video": self.recommended_video_engine(),

            "workers": self.recommended_workers(),

            "cache_gb": self.recommended_cache_size()

        }

    # ======================================================
    # Complete System Report
    # ======================================================

    def report(self) -> Dict:
        """
        Complete hardware report.
        """

        self.initialize()

        return {

            "hardware": self.summary(),

            "profile": self.profile(),

            "ai_profile": self.ai_profile(),

            "recommendation": self.recommendation(),

            "performance": {

                "score": self.performance_score(),

                "class": self.performance_class()

            }

        }

    # ======================================================
    # Health Check
    # ======================================================

    def health_check(self) -> Dict:

        self.initialize()

        return {

            "cpu": self.cpu.health_check(),

            "gpu": self.gpu.health_check(),

            "memory": self.memory.health_check(),

            "storage": self.storage.health_check(),

            "cuda": self.cuda.health_check(),

            "opencl": self.opencl.health_check(),

            "vulkan": self.vulkan.health_check()

        }

    # ======================================================
    # Export
    # ======================================================

    def export(self) -> Dict:

        self.initialize()

        return {

            "report": self.report(),

            "health": self.health_check()

        }

    # ======================================================
    # Refresh All
    # ======================================================

    def refresh_all(self):

        self.cpu.refresh()

        self.gpu.refresh()

        self.memory.refresh()

        self.storage.refresh()

        self.cuda.refresh()

        self.opencl.refresh()

        self.vulkan.refresh()

        self._initialized = True

    # ======================================================
    # Dispose
    # ======================================================

    def dispose(self):

        self.cpu.dispose()

        self.gpu.dispose()

        self.memory.dispose()

        self.storage.dispose()

        self.cuda.dispose()

        self.opencl.dispose()

        self.vulkan.dispose()

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

            "<HardwareService "

            f"class='{self.performance_class()}' "

            f"backend='{self.preferred_ai_backend()}'>"

        )

    __str__ = __repr__