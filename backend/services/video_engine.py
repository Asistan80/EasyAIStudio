"""
==========================================================
Easy AI Studio
File    : backend/services/video_engine.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from datetime import datetime
from uuid import uuid4

from services.provider_manager import provider_manager
from services.model_manager import model_manager


class VideoEngine:

    def __init__(self):

        self.history = []

    def generate(

        self,

        provider: str,

        model: str,

        prompt: str,

        duration: int = 10,

        width: int = 1280,

        height: int = 720,

        fps: int = 30,

        **kwargs

    ):

        if not provider_manager.exists(provider):

            return {

                "success": False,

                "message": "Provider not found."

            }

        if not model_manager.exists(

            provider,

            model

        ):

            return {

                "success": False,

                "message": "Model not found."

            }

        task = {

            "id": str(uuid4()),

            "provider": provider,

            "model": model,

            "prompt": prompt,

            "duration": duration,

            "width": width,

            "height": height,

            "fps": fps,

            "parameters": kwargs,

            "status": "completed",

            "output": "",

            "created_at": datetime.now().isoformat()

        }

        self.history.append(task)

        return {

            "success": True,

            "video": task

        }

    def history_list(self):

        return self.history

    def get(

        self,

        video_id: str

    ):

        for video in self.history:

            if video["id"] == video_id:

                return video

        return None

    def delete(

        self,

        video_id: str

    ):

        video = self.get(video_id)

        if video:

            self.history.remove(video)

            return True

        return False

    def clear(self):

        self.history.clear()

    def count(self):

        return len(self.history)

    def last(self):

        if not self.history:

            return None

        return self.history[-1]


video_engine = VideoEngine()