"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/files.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile
)

from config.settings import settings


router = APIRouter()


ALLOWED_DIRECTORIES = {

    "gallery": settings.GALLERY_DIR,

    "exports": settings.EXPORTS_DIR,

    "prompts": settings.PROMPTS_DIR,

    "settings": settings.SETTINGS_DIR

}


ALLOWED_UPLOAD_EXTENSIONS = {

    ".mp4",
    ".mov",
    ".mkv",
    ".webm",
    ".avi",

    ".mp3",
    ".wav",
    ".flac",
    ".m4a",

    ".png",
    ".jpg",
    ".jpeg",
    ".webp"
}


MAX_UPLOAD_SIZE = 2 * 1024 * 1024 * 1024


def get_directory(name: str) -> Path:

    directory = ALLOWED_DIRECTORIES.get(name)

    if directory is None:

        raise HTTPException(

            status_code=404,

            detail="Directory not found."

        )

    directory.mkdir(

        parents=True,

        exist_ok=True

    )

    return directory


def get_safe_filename(filename: str | None) -> str:

    if not filename:

        raise HTTPException(

            status_code=400,

            detail="Filename is required."

        )

    original_name = Path(filename).name

    if not original_name:

        raise HTTPException(

            status_code=400,

            detail="Invalid filename."

        )

    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_UPLOAD_EXTENSIONS:

        raise HTTPException(

            status_code=400,

            detail=(
                "File type is not supported. "
                f"Allowed extensions: "
                f"{', '.join(sorted(ALLOWED_UPLOAD_EXTENSIONS))}"
            )

        )

    return original_name


def create_temp_upload_path(filename: str) -> Path:

    settings.TEMP_RENDER_DIR.mkdir(

        parents=True,

        exist_ok=True

    )

    extension = Path(filename).suffix.lower()

    unique_name = (
        f"{uuid4().hex}"
        f"{extension}"
    )

    return (
        settings.TEMP_RENDER_DIR
        / unique_name
    )


@router.get("/")
async def get_directories():

    return {

        "directories": list(
            ALLOWED_DIRECTORIES.keys()
        ),

        "temporary_render_directory": str(
            settings.TEMP_RENDER_DIR
        )

    }


@router.get("/{directory}")
async def list_files(directory: str):

    folder = get_directory(directory)

    files = []

    for item in sorted(folder.iterdir()):

        files.append({

            "name": item.name,

            "type": (
                "directory"
                if item.is_dir()
                else "file"
            ),

            "size": item.stat().st_size,

            "path": str(
                item.relative_to(folder)
            )

        })

    return {

        "directory": directory,

        "count": len(files),

        "files": files

    }


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...)
):

    if not file.filename:

        raise HTTPException(

            status_code=400,

            detail="Filename is required."

        )

    filename = get_safe_filename(
        file.filename
    )

    destination = create_temp_upload_path(
        filename
    )

    total_size = 0

    try:

        with destination.open(
            "wb"
        ) as output:

            while True:

                chunk = await file.read(
                    1024 * 1024
                )

                if not chunk:

                    break

                total_size += len(chunk)

                if total_size > MAX_UPLOAD_SIZE:

                    raise HTTPException(

                        status_code=413,

                        detail=(
                            "Uploaded file is too large. "
                            "Maximum size is 2 GB."
                        )

                    )

                output.write(chunk)

    except HTTPException:

        if destination.exists():

            destination.unlink()

        raise

    except Exception as error:

        if destination.exists():

            destination.unlink()

        raise HTTPException(

            status_code=500,

            detail=(
                "File upload failed: "
                f"{error}"
            )

        )

    finally:

        await file.close()

    return {

        "success": True,

        "original_name": filename,

        "filename": destination.name,

        "path": str(destination),

        "size": total_size,

        "directory": "temp/render"

    }


@router.delete("/{directory}/{filename}")
async def delete_file(

    directory: str,

    filename: str

):

    folder = get_directory(directory)

    file_path = folder / filename

    if not file_path.exists():

        raise HTTPException(

            status_code=404,

            detail="File not found."

        )

    if file_path.is_dir():

        raise HTTPException(

            status_code=400,

            detail="Directories cannot be deleted."

        )

    file_path.unlink()

    return {

        "success": True,

        "deleted": filename

    }