"""
Easy AI Studio
Storage Detector
"""

from __future__ import annotations

from .storage_windows import WindowsStorageDetector
from .storage_scoring import StorageScoring
from .storage_ai_profile import StorageAIProfile


class StorageDetector:

    def __init__(self):

        self.detector = WindowsStorageDetector()

        self.score_engine = StorageScoring()

        self.ai_engine = StorageAIProfile()

        self.drives = []

        self.primary_drive = None

        self.detect()

    # ---------------------------------------------------------

    def detect(self):

        self.drives = self.detector.summary()

        for drive in self.drives:

            drive["score"] = self.score_engine.calculate(drive)

            drive["ai"] = self.ai_engine.build(drive)

        self._select_primary()

    # ---------------------------------------------------------

    def _select_primary(self):

        if not self.drives:

            self.primary_drive = None

            return

        self.drives.sort(

            key=lambda x: x["score"],

            reverse=True

        )

        self.primary_drive = self.drives[0]

    # ---------------------------------------------------------

    def summary(self):

        if self.primary_drive is None:

            return None

        return self.primary_drive.copy()

    # ---------------------------------------------------------

    def report(self):

        return {

            "storage_count": len(self.drives),

            "primary_storage": self.primary_drive,

            "drives": self.drives

        }