"""
==========================================================
Easy AI Studio
File    : backend/services/service_registry.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from services.ai_engine import ai_engine
from services.cache_manager import cache_manager
from services.download_manager import download_manager
from services.export_manager import export_manager
from services.image_engine import image_engine
from services.model_manager import model_manager
from services.prompt_manager import prompt_manager
from services.provider_manager import provider_manager
from services.video_engine import video_engine
from services.workflow_manager import workflow_manager


class ServiceRegistry:

    def __init__(self):

        self.services = {}

        self.register(

            "provider",

            provider_manager

        )

        self.register(

            "model",

            model_manager

        )

        self.register(

            "cache",

            cache_manager

        )

        self.register(

            "download",

            download_manager

        )

        self.register(

            "prompt",

            prompt_manager

        )

        self.register(

            "export",

            export_manager

        )

        self.register(

            "workflow",

            workflow_manager

        )

        self.register(

            "ai",

            ai_engine

        )

        self.register(

            "image",

            image_engine

        )

        self.register(

            "video",

            video_engine

        )

    def register(

        self,

        name: str,

        service

    ):

        self.services[name] = service

    def unregister(

        self,

        name: str

    ):

        if name in self.services:

            del self.services[name]

            return True

        return False

    def get(

        self,

        name: str

    ):

        return self.services.get(name)

    def exists(

        self,

        name: str

    ):

        return name in self.services

    def all(self):

        return self.services

    def names(self):

        return sorted(

            self.services.keys()

        )

    def count(self):

        return len(

            self.services

        )

    def clear(self):

        self.services.clear()


service_registry = ServiceRegistry()