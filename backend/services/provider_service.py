"""
==========================================================
Easy AI Studio
File    : backend/services/provider_service.py
Version : 4.0.0
==========================================================
"""

from providers.provider_manager import provider_manager
from providers.mock_provider import MockProvider
from providers.ollama_provider import OllamaProvider
from providers.comfyui_provider import ComfyUIProvider


class ProviderService:

    def __init__(self) -> None:

        self._initialized = False

    async def initialize(self) -> None:

        if self._initialized:
            return

        #
        # Register Providers
        #

        await provider_manager.register(
            MockProvider()
        )

        await provider_manager.register(
            OllamaProvider()
        )

        await provider_manager.register(
            ComfyUIProvider()
        )

        #
        # Default Provider
        #

        provider_manager.set_default(
            "Ollama"
        )

        self._initialized = True

    def manager(self):

        return provider_manager

    async def health(self):

        return await provider_manager.health()

    def providers(self):

        return provider_manager.names()

    def count(self):

        return provider_manager.count()


provider_service = ProviderService()