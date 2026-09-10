"""
==========================================================
Easy AI Studio
File    : backend/services/image_engine.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from datetime import datetime
from uuid import uuid4

from services.provider_manager import provider_manager
from services.model_manager import model_manager


class ImageEngine:

    def __init__(self):

        self.history = []

    def generate(

        self,

        provider: str,

        model: str,

        prompt: str,

        negative_prompt: str = "",

        width: int = 1024,

        height: int = 1024,

        seed: int = -1,

        steps: int = 30,

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

            "negative_prompt": negative_prompt,

            "width": width,

            "height": height,

            "seed": seed,

            "steps": steps,

            "parameters": kwargs,

            "status": "completed",

            "output": "",

            "created_at": datetime.now().isoformat()

        }

        self.history.append(task)

        return {

            "success": True,

            "image": task

        }

    def history_list(self):

        return self.history

    def get(

        self,

        image_id: str

    ):

        for image in self.history:

            if image["id"] == image_id:

                return image

        return None

    def delete(

        self,

        image_id: str

    ):

        image = self.get(image_id)

        if image:

            self.history.remove(image)

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


image_engine = ImageEngine()