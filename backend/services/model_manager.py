"""
==========================================================
Easy AI Studio
File    : backend/services/model_manager.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from typing import Dict
from typing import List
from typing import Optional


class ModelManager:

    def __init__(self):

        self.models: Dict[str, List[dict]] = {}

    def register(

        self,

        provider: str,

        model: dict

    ) -> None:

        provider = provider.lower()

        if provider not in self.models:

            self.models[provider] = []

        self.models[provider].append(model)

    def register_many(

        self,

        provider: str,

        models: List[dict]

    ) -> None:

        provider = provider.lower()

        self.models[provider] = models

    def get(

        self,

        provider: str

    ) -> List[dict]:

        return self.models.get(

            provider.lower(),

            []

        )

    def get_model(

        self,

        provider: str,

        model_id: str

    ) -> Optional[dict]:

        provider = provider.lower()

        for model in self.models.get(

            provider,

            []

        ):

            if model.get("id") == model_id:

                return model

        return None

    def exists(

        self,

        provider: str,

        model_id: str

    ) -> bool:

        return self.get_model(

            provider,

            model_id

        ) is not None

    def providers(self) -> List[str]:

        return list(self.models.keys())

    def count(self) -> int:

        return sum(

            len(models)

            for models in self.models.values()

        )

    def clear(self):

        self.models.clear()


model_manager = ModelManager()