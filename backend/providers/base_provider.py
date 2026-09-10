from abc import ABC, abstractmethod

from schemas.image import (
    ImageRequest,
    ImageResponse,
)


class BaseProvider(ABC):

    provider_name: str = "Unknown"

    @abstractmethod
    async def initialize(self) -> None:
        ...

    @abstractmethod
    async def health(self) -> bool:
        ...

    @abstractmethod
    async def generate_image(
        self,
        request: ImageRequest,
    ) -> ImageResponse:
        ...

    @abstractmethod
    async def generate_video(
        self,
        request: dict,
    ) -> dict:
        ...

    @abstractmethod
    async def generate_text(
        self,
        request: dict,
    ) -> dict:
        ...

    @abstractmethod
    async def models(self) -> list[dict]:
        ...