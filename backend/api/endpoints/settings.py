"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/settings.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

import json

from fastapi import APIRouter, HTTPException

from config.settings import settings


router = APIRouter()


SETTINGS_FILE = settings.SETTINGS_DIR / "settings.json"


DEFAULT_SETTINGS = {

    "theme": "dark",

    "language": "tr",

    "provider": "openai",

    "model": "",

    "autosave": True,

    "notifications": True

}


def load_settings():

    if not SETTINGS_FILE.exists():

        save_settings(DEFAULT_SETTINGS)

        return DEFAULT_SETTINGS

    try:

        with open(

            SETTINGS_FILE,

            "r",

            encoding="utf-8"

        ) as file:

            return json.load(file)

    except Exception:

        return DEFAULT_SETTINGS


def save_settings(data):

    SETTINGS_FILE.parent.mkdir(

        parents=True,

        exist_ok=True

    )

    with open(

        SETTINGS_FILE,

        "w",

        encoding="utf-8"

    ) as file:

        json.dump(

            data,

            file,

            indent=4,

            ensure_ascii=False

        )


@router.get("/")
async def get_settings():

    return load_settings()


@router.put("/")
async def update_settings(data: dict):

    current = load_settings()

    current.update(data)

    save_settings(current)

    return {

        "success": True,

        "settings": current

    }


@router.post("/reset")
async def reset_settings():

    save_settings(DEFAULT_SETTINGS)

    return {

        "success": True,

        "settings": DEFAULT_SETTINGS

    }


@router.get("/{key}")
async def get_setting(key: str):

    data = load_settings()

    if key not in data:

        raise HTTPException(

            status_code=404,

            detail="Setting not found."

        )

    return {

        "key": key,

        "value": data[key]

    }