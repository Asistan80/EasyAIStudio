"""
Easy AI Studio
Storage Scoring
"""

from __future__ import annotations


class StorageScoring:

    def calculate(self, disk: dict) -> int:

        if not disk:
            return 0

        media = (disk.get("media_type") or "").upper()
        bus = (disk.get("bus_type") or "").upper()

        # NVMe
        if "NVME" in bus:

            if disk.get("size_gb", 0) >= 1000:
                return 100

            if disk.get("size_gb", 0) >= 500:
                return 95

            return 90

        # SATA SSD
        if media == "SSD":
            return 75

        # HDD
        if media == "HDD":
            return 40

        return 50