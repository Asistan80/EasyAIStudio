"""
==========================================================
Easy AI Studio
Memory Detector
==========================================================
"""

from __future__ import annotations

from typing import Dict
from typing import Optional

import psutil


class MemoryDetector:
    """
    Detect system memory information.
    """

    def __init__(self):

        self._virtual: Optional[psutil._common.svmem] = None

        self._swap: Optional[psutil._common.sswap] = None

    # ======================================================
    # Refresh
    # ======================================================

    def refresh(self):

        self._virtual = psutil.virtual_memory()

        self._swap = psutil.swap_memory()

    # ======================================================
    # Virtual Memory
    # ======================================================

    def virtual_memory(self):

        if self._virtual is None:

            self.refresh()

        return self._virtual

    # ======================================================
    # Swap Memory
    # ======================================================

    def swap_memory(self):

        if self._swap is None:

            self.refresh()

        return self._swap

    # ======================================================
    # Total RAM
    # ======================================================

    def total_bytes(self) -> int:

        return self.virtual_memory().total

    def total_gb(self) -> float:

        return round(

            self.total_bytes()

            / 1024

            / 1024

            / 1024,

            2

        )

    # ======================================================
    # Used RAM
    # ======================================================

    def used_bytes(self) -> int:

        return self.virtual_memory().used

    def used_gb(self) -> float:

        return round(

            self.used_bytes()

            / 1024

            / 1024

            / 1024,

            2

        )

    # ======================================================
    # Available RAM
    # ======================================================

    def available_bytes(self) -> int:

        return self.virtual_memory().available

    def available_gb(self) -> float:

        return round(

            self.available_bytes()

            / 1024

            / 1024

            / 1024,

            2

        )

    # ======================================================
    # Memory Usage
    # ======================================================

    def usage_percent(self) -> float:
        """
        Current RAM usage percentage.
        """

        return round(

            self.virtual_memory().percent,

            2

        )

    # ======================================================
    # Free Memory
    # ======================================================

    def free_bytes(self) -> int:

        return self.virtual_memory().free

    def free_gb(self) -> float:

        return round(

            self.free_bytes()

            / 1024

            / 1024

            / 1024,

            2

        )

    # ======================================================
    # Cached Memory
    # ======================================================

    def cached_bytes(self) -> int:

        return getattr(

            self.virtual_memory(),

            "cached",

            0

        )

    def cached_gb(self) -> float:

        return round(

            self.cached_bytes()

            / 1024

            / 1024

            / 1024,

            2

        )

    # ======================================================
    # Buffers
    # ======================================================

    def buffers_bytes(self) -> int:

        return getattr(

            self.virtual_memory(),

            "buffers",

            0

        )

    def buffers_gb(self) -> float:

        return round(

            self.buffers_bytes()

            / 1024

            / 1024

            / 1024,

            2

        )

    # ======================================================
    # Swap
    # ======================================================

    def swap_total_gb(self) -> float:

        return round(

            self.swap_memory().total

            / 1024

            / 1024

            / 1024,

            2

        )

    def swap_used_gb(self) -> float:

        return round(

            self.swap_memory().used

            / 1024

            / 1024

            / 1024,

            2

        )

    def swap_percent(self) -> float:

        return round(

            self.swap_memory().percent,

            2

        )

    # ======================================================
    # Live Statistics
    # ======================================================

    def statistics(self) -> Dict:

        self.refresh()

        return {

            "total_gb": self.total_gb(),

            "used_gb": self.used_gb(),

            "available_gb": self.available_gb(),

            "free_gb": self.free_gb(),

            "cached_gb": self.cached_gb(),

            "buffers_gb": self.buffers_gb(),

            "usage_percent": self.usage_percent(),

            "swap_total_gb": self.swap_total_gb(),

            "swap_used_gb": self.swap_used_gb(),

            "swap_percent": self.swap_percent()

        }

    # ======================================================
    # Performance Score
    # ======================================================

    def performance_score(self) -> int:
        """
        Estimate memory performance score.

        Score Range:
            0 - 100
        """

        total = self.total_gb()

        score = 0

        if total >= 128:
            score = 100

        elif total >= 96:
            score = 95

        elif total >= 64:
            score = 88

        elif total >= 48:
            score = 80

        elif total >= 32:
            score = 70

        elif total >= 24:
            score = 60

        elif total >= 16:
            score = 48

        elif total >= 12:
            score = 36

        elif total >= 8:
            score = 25

        else:
            score = 10

        return score

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

        ram = self.total_gb()

        recommendation = {

            "recommended_models": [],

            "warning": None

        }

        if ram < 8:

            recommendation["recommended_models"] = [

                "Tiny Models",

                "3B LLM"

            ]

            recommendation["warning"] = (

                "RAM is limited."

            )

        elif ram < 16:

            recommendation["recommended_models"] = [

                "3B",

                "7B Quantized"

            ]

        elif ram < 32:

            recommendation["recommended_models"] = [

                "7B",

                "13B Quantized",

                "Stable Diffusion XL"

            ]

        elif ram < 64:

            recommendation["recommended_models"] = [

                "13B",

                "30B Quantized",

                "Flux",

                "ComfyUI"

            ]

        else:

            recommendation["recommended_models"] = [

                "70B Remote",

                "Large AI Pipelines",

                "Multiple Models",

                "Heavy Workflows"

            ]

        return recommendation

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

            "memory_class": level,

            "recommended_workers": workers[level],

            "large_projects": (

                level in [

                    "High",

                    "Extreme"

                ]

            )

        }

    # ======================================================
    # Summary
    # ======================================================

    def summary(self) -> Dict:

        return {

            "total_ram_gb": self.total_gb(),

            "available_ram_gb": self.available_gb(),

            "used_ram_gb": self.used_gb(),

            "usage_percent": self.usage_percent(),

            "performance_score": self.performance_score(),

            "performance_class": self.performance_class(),

            "ai": self.ai_recommendation(),

            "render": self.render_recommendation()

        }

    # ======================================================
    # Health Check
    # ======================================================

    def health_check(self) -> Dict:
        """
        Memory detector health information.
        """

        try:

            return {

                "service": "MemoryDetector",

                "status": "healthy",

                "total_ram_gb": self.total_gb(),

                "available_ram_gb": self.available_gb(),

                "usage_percent": self.usage_percent(),

                "performance_class": self.performance_class()

            }

        except Exception as exc:

            return {

                "service": "MemoryDetector",

                "status": "error",

                "error": str(exc)

            }

    # ======================================================
    # Export
    # ======================================================

    def export(self) -> Dict:
        """
        Export complete memory information.
        """

        return {

            "summary": self.summary(),

            "statistics": self.statistics(),

            "health": self.health_check()

        }

    # ======================================================
    # Dispose
    # ======================================================

    def dispose(self):
        """
        Release cached resources.
        """

        self._virtual = None

        self._swap = None

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

            "<MemoryDetector "

            f"ram={self.total_gb()}GB "

            f"class='{self.performance_class()}'>"

        )

    __str__ = __repr__