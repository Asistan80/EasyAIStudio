"""
==========================================================
Easy AI Studio
File    : backend/services/provider_manager.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from typing import Dict
from typing import List
from typing import Optional


class ProviderManager:

    def __init__(self):

        self.providers: Dict[str, dict] = {}

    def register(

        self,

        provider_id: str,

        provider: dict

    ) -> None:

        self.providers[provider_id] = provider

    def unregister(

        self,

        provider_id: str

    ) -> bool:

        if provider_id in self.providers:

            del self.providers[provider_id]

            return True

        return False

    def get(

        self,

        provider_id: str

    ) -> Optional[dict]:

        return self.providers.get(provider_id)

    def exists(

        self,

        provider_id: str

    ) -> bool:

        return provider_id in self.providers

    def all(self) -> List[dict]:

        return list(self.providers.values())

    def ids(self) -> List[str]:

        return list(self.providers.keys())

    def count(self) -> int:

        return len(self.providers)

    def clear(self):

        self.providers.clear()

    def default(self):

        if "openai" in self.providers:

            return self.providers["openai"]

        if len(self.providers) > 0:

            return next(

                iter(

                    self.providers.values()

                )

            )

        return None


provider_manager = ProviderManager()