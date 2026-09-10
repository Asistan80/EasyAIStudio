"""
==========================================================
Easy AI Studio
File    : backend/services/download_manager.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from pathlib import Path
from typing import List


class DownloadManager:

    def __init__(self):

        self.queue = []

    def add(

        self,

        url: str,

        output: str

    ) -> dict:

        item = {

            "url": url,

            "output": output,

            "status": "queued"

        }

        self.queue.append(item)

        return item

    def all(self) -> List[dict]:

        return self.queue

    def get(

        self,

        index: int

    ):

        if 0 <= index < len(self.queue):

            return self.queue[index]

        return None

    def remove(

        self,

        index: int

    ) -> bool:

        if 0 <= index < len(self.queue):

            self.queue.pop(index)

            return True

        return False

    def clear(self):

        self.queue.clear()

    def count(self) -> int:

        return len(self.queue)

    def mark_running(

        self,

        index: int

    ):

        item = self.get(index)

        if item:

            item["status"] = "running"

    def mark_finished(

        self,

        index: int

    ):

        item = self.get(index)

        if item:

            item["status"] = "finished"

    def mark_failed(

        self,

        index: int

    ):

        item = self.get(index)

        if item:

            item["status"] = "failed"

    def output_exists(

        self,

        path: str

    ) -> bool:

        return Path(path).exists()


download_manager = DownloadManager()