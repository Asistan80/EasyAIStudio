"""
Easy AI Studio
GPU AI Profile
"""

from __future__ import annotations


class GPUAIProfile:

    """
    AI capability profiler.
    """

    def build(self, gpu: dict) -> dict:

        if gpu is None:

            return {

                "performance": "Unknown",

                "recommended": []

            }

        score = gpu.get("score", 0)

        # ======================================================
        # EXTREME
        # ======================================================

        if score >= 95:

            return {

                "performance": "Extreme",

                "recommended": [

                    "Flux",

                    "SDXL",

                    "SD 3.5",

                    "ComfyUI",

                    "Wan",

                    "CogVideoX",

                    "AnimateDiff",

                    "Hunyuan Video",

                    "13B LLM",

                    "30B Quantized",

                    "Large Image Generation",

                    "Large Video Generation",

                    "Multiple AI Providers"

                ]

            }

        # ======================================================
        # HIGH
        # ======================================================

        if score >= 85:

            return {

                "performance": "High",

                "recommended": [

                    "Flux",

                    "SDXL",

                    "ComfyUI",

                    "AnimateDiff",

                    "Wan",

                    "13B LLM",

                    "Image Generation",

                    "Video Generation"

                ]

            }

        # ======================================================
        # MEDIUM
        # ======================================================

        if score >= 70:

            return {

                "performance": "Medium",

                "recommended": [

                    "Stable Diffusion XL",

                    "Stable Diffusion 1.5",

                    "ComfyUI",

                    "7B LLM",

                    "Basic Video Generation"

                ]

            }

        # ======================================================
        # LOW
        # ======================================================

        return {

            "performance": "Low",

            "recommended": [

                "CPU Inference",

                "Small AI Models",

                "Basic Stable Diffusion",

                "Basic Image Generation"

            ]

        }