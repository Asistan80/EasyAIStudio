from __future__ import annotations

from typing import Dict
from providers.base_provider import BaseProvider


class ProviderManager:
    def __init__(self) -> None:
        self._providers: Dict[str, BaseProvider] = {}
        self._default_provider: str | None = None

    async def register(self, provider: BaseProvider) -> None:
        await provider.initialize()
        self._providers[provider.provider_name] = provider
        if self._default_provider is None:
            self._default_provider = provider.provider_name

    def unregister(self, name: str) -> bool:
        if name not in self._providers:
            return False
        del self._providers[name]
        if self._default_provider == name:
            self._default_provider = next(iter(self._providers), None)
        return True

    def clear(self) -> None:
        self._providers.clear()
        self._default_provider = None

    def get(self, name: str | None = None) -> BaseProvider:
        provider_name = name or self._default_provider
        if not provider_name:
            raise ValueError("No default provider is configured.")
        provider = self._providers.get(provider_name)
        if provider is None:
            raise ValueError(f"Provider '{provider_name}' not found.")
        return provider

    def exists(self, name: str) -> bool:
        return name in self._providers

    def set_default(self, name: str) -> None:
        if name not in self._providers:
            raise ValueError(f"Provider '{name}' is not registered.")
        self._default_provider = name

    def default_name(self) -> str | None:
        return self._default_provider

    def names(self) -> list[str]:
        return sorted(self._providers.keys())

    async def health(self) -> dict[str, bool]:
        result: dict[str, bool] = {}
        for name, provider in self._providers.items():
            try:
                result[name] = await provider.health()
            except Exception:
                result[name] = False
        return result

    def count(self) -> int:
        return len(self._providers)


provider_manager = ProviderManager()
