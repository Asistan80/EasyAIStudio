"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/gallery.py
Version : 2.0.0
==========================================================
"""

from pathlib import Path
import subprocess
from fastapi import Body

from fastapi import APIRouter, HTTPException
from fastapi import HTTPException
from fastapi.responses import FileResponse

from services.gallery_service import gallery_service
from pathlib import Path


router = APIRouter(
    prefix="/gallery",
    tags=["Gallery"],
)


@router.get("")
async def list_gallery():

    return {
        "success": True,
        "count": gallery_service.image_count(),
        "images": gallery_service.list_images(),
    }

@router.get("/open-folder")
async def open_gallery_folder():

    folder = Path(__file__).resolve().parents[3] / "gallery"

    subprocess.Popen(
        [
            "explorer",
            str(folder),
        ]
    )

    return {
        "success": True,
    }

@router.get("/{filename}")
async def get_image(filename: str):

    image_path = Path(__file__).resolve().parents[3] / "gallery" / filename

    print("=" * 50)
    print("DELETE PATH :", image_path)
    print("EXISTS      :", image_path.exists())
    print("=" * 50)

    if not image_path.exists():

        raise HTTPException(
            status_code=404,
            detail="Image not found."
        )

    return FileResponse(image_path)

@router.delete("/{filename}")
async def delete_image(filename: str):

    image_path = (
        Path(__file__).resolve().parents[3]
        / "gallery"
        / filename
    )

    if not image_path.exists():

        raise HTTPException(

            status_code=404,

            detail="Image not found."

        )

    image_path.unlink()

    return {

        "success": True,

        "message": "Image deleted."

    }

@router.put(
    "/{filename}/favorite",
)
async def set_favorite(
    filename: str,
    favorite: bool = Body(...),
):

    success = gallery_service.set_favorite(
        filename,
        favorite,
    )

    return {
        "success": success,
    }

