"""
==========================================================
Easy AI Studio
File    : backend/services/gallery_service.py
Version : 2.0.0
==========================================================
"""

from __future__ import annotations

import json
import uuid

from pathlib import Path
from typing import Any

import httpx

from config.settings import settings


class GalleryService:

    def __init__(self) -> None:

        self.gallery_dir = settings.GALLERY_DIR

        self.gallery_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

    # --------------------------------------------------
    # Helpers
    # --------------------------------------------------

    def _is_image(
        self,
        path: Path,
    ) -> bool:

        return path.suffix.lower() in {
            ".png",
            ".jpg",
            ".jpeg",
            ".webp",
            ".bmp",
        }

    def _metadata_path(
        self,
        image_path: Path,
    ) -> Path:

        return image_path.with_suffix(".json")

    def _read_metadata(
        self,
        image_path: Path,
    ) -> dict[str, Any]:

        metadata_path = self._metadata_path(
            image_path
        )

        if not metadata_path.exists():

            return {}

        try:

            with open(
                metadata_path,
                "r",
                encoding="utf-8",
            ) as file:

                metadata = json.load(file)

            metadata.setdefault(
                "favorite",
                False,
            )

            return metadata

        except Exception:

            return {}

    # --------------------------------------------------
    # Gallery
    # --------------------------------------------------

    def list_images(
        self,
    ) -> list[dict[str, Any]]:

        if not self.gallery_dir.exists():

            return []

        images: list[dict[str, Any]] = []

        for file in sorted(
            self.gallery_dir.iterdir(),
            key=lambda x: x.stat().st_mtime,
            reverse=True,
        ):

            if not file.is_file():
                continue

            if not self._is_image(file):
                continue

            stat = file.stat()

            metadata = self._read_metadata(
                file
            )

            images.append(
                {
                    "name": file.name,
                    "filename": file.name,
                    "path": str(file),
                    "size": stat.st_size,
                    "modified": stat.st_mtime,
                    "metadata": metadata,
                }
            )

        return images

    def image_count(
        self,
    ) -> int:

        return len(
            self.list_images()
        )

    def exists(
        self,
        filename: str,
    ) -> bool:

        return (
            self.gallery_dir / filename
        ).exists()

    def image_path(
        self,
        filename: str,
    ) -> Path:

        return (
            self.gallery_dir / filename
        )

    def set_favorite(
        self,
        filename: str,
        favorite: bool,
    ) -> bool:

        image_path = self.image_path(
            filename
        )

        if not image_path.exists():

            return False

        metadata = self._read_metadata(
            image_path
        )

        metadata["favorite"] = favorite

        metadata_path = self._metadata_path(
            image_path
        )

        with open(
            metadata_path,
            "w",
            encoding="utf-8",
        ) as file:

            json.dump(
                metadata,
                file,
                indent=4,
                ensure_ascii=False,
            )

        return True

    async def save_from_comfy(
        self,
        image_url: str,
        metadata: dict[str, Any] | None = None,
    ) -> str:

        filename = (
            uuid.uuid4().hex + ".png"
        )

        image_path = (
            self.gallery_dir / filename
        )

        async with httpx.AsyncClient() as client:

            response = await client.get(
                image_url
            )

            response.raise_for_status()

            image_path.write_bytes(
                response.content
            )

        if metadata is not None:

            metadata.setdefault(
                "favorite",
                False,
            )

            metadata_path = self._metadata_path(
                image_path
            )

            with open(
                metadata_path,
                "w",
                encoding="utf-8",
            ) as file:

                json.dump(
                    metadata,
                    file,
                    indent=4,
                    ensure_ascii=False,
                )

        return filename


gallery_service = GalleryService()