"""
Easy AI Studio
GPU Scoring Engine
"""

from __future__ import annotations


class GPUScoring:

    """
    Professional GPU scoring engine.
    """

    def calculate(self, gpu: dict) -> int:

        if gpu is None:
            return 0

        vendor = gpu.get("vendor", "").upper()

        name = gpu.get("name", "").upper()

        memory = gpu.get("memory_gb") or 0

        # ======================================================
        # NVIDIA
        # ======================================================

        if vendor == "NVIDIA":

            if "5090" in name:
                return 100

            if "5080" in name:
                return 99

            if "4090" in name:
                return 99

            if "4080" in name:
                return 98

            if "4070 TI" in name:
                return 95

            if "4070 SUPER" in name:
                return 94

            if "4070" in name:
                return 92

            if "4060 TI" in name:
                return 88

            if "4060" in name:
                return 82

            if "3070 TI" in name:
                return 84

            if "3070" in name:
                return 80

            if "3060 TI" in name:
                return 75

            if "3060" in name:
                return 70

        # ======================================================
        # AMD
        # ======================================================

        if vendor == "AMD":

            if "7900 XTX" in name:
                return 96

            if "7900 XT" in name:
                return 93

            if "7800 XT" in name:
                return 88

            if "7700 XT" in name:
                return 82

            if "7600 XT" in name:
                return 75

            if "7600" in name:
                return 70

        # ======================================================
        # INTEL
        # ======================================================

        if vendor == "INTEL":

            if "B770" in name:
                return 82

            if "A770" in name:
                return 78

            if "A750" in name:
                return 73

            if "A580" in name:
                return 67

        # ======================================================
        # Generic fallback
        # ======================================================

        score = 20

        if memory >= 24:

            score += 50

        elif memory >= 16:

            score += 40

        elif memory >= 12:

            score += 30

        elif memory >= 8:

            score += 20

        elif memory >= 6:

            score += 10

        if gpu.get("cuda"):

            score += 10

        if gpu.get("nvenc"):

            score += 5

        if gpu.get("av1"):

            score += 5

        return min(score, 100)