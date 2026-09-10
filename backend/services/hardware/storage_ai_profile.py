"""
Easy AI Studio
Storage AI Profile
"""

from __future__ import annotations


class StorageAIProfile:

    def build(self, disk: dict) -> dict:

        if disk is None:

            return {

                "performance": "Unknown",

                "recommended": []

            }

        score = disk.get("score", 0)

        # =====================================================
        # EXTREME
        # =====================================================

        if score >= 95:

            return {

                "performance": "Extreme",

                "recommended": [

                    "Flux Cache",

                    "SDXL Cache",

                    "ComfyUI Models",

                    "CogVideoX Cache",

                    "Wan Cache",

                    "Dataset Storage",

                    "Large AI Models",

                    "Fast Model Loading"

                ]

            }

        # =====================================================
        # HIGH
        # =====================================================

        if score >= 80:

            return {

                "performance": "High",

                "recommended": [

                    "Stable Diffusion XL",

                    "Flux",

                    "ComfyUI",

                    "Video Cache",

                    "13B LLM",

                    "Model Storage"

                ]

            }

        # =====================================================
        # MEDIUM
        # =====================================================

        if score >= 60:

            return {

                "performance": "Medium",

                "recommended": [

                    "Stable Diffusion",

                    "7B LLM",

                    "Basic Video Cache"

                ]

            }

        # =====================================================
        # LOW
        # =====================================================

        return {

            "performance": "Low",

            "recommended": [

                "Basic Image Generation",

                "CPU Models"

            ]

        }