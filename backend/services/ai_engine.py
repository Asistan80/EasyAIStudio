"""
==========================================================
Easy AI Studio
File    : backend/services/ai_engine.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from datetime import datetime
from uuid import uuid4

from services.provider_manager import provider_manager
from services.model_manager import model_manager


class AIEngine:

    def __init__(self):

        self.history = []

    def generate(

        self,

        provider: str,

        model: str,

        prompt: str,

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

            "parameters": kwargs,

            "status": "completed",

            "response": "AI provider is not connected yet.",

            "created_at": datetime.now().isoformat()

        }

        self.history.append(task)

        return {

            "success": True,

            "task": task

        }

    def history_list(self):

        return self.history

    def get(

        self,

        task_id: str

    ):

        for task in self.history:

            if task["id"] == task_id:

                return task

        return None

    def delete(

        self,

        task_id: str

    ):

        task = self.get(task_id)

        if task:

            self.history.remove(task)

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


ai_engine = AIEngine()