"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/plugins.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException


router = APIRouter()


PLUGINS = []


@router.get("/")
async def get_plugins():

    return {

        "count": len(PLUGINS),

        "plugins": PLUGINS

    }


@router.post("/")
async def install_plugin(data: dict):

    plugin = {

        "id": str(uuid4()),

        "name": data.get("name", "Unknown Plugin"),

        "version": data.get("version", "1.0.0"),

        "author": data.get("author", ""),

        "description": data.get("description", ""),

        "enabled": data.get("enabled", True),

        "installed_at": datetime.now().isoformat()

    }

    PLUGINS.append(plugin)

    return plugin


@router.get("/{plugin_id}")
async def get_plugin(plugin_id: str):

    for plugin in PLUGINS:

        if plugin["id"] == plugin_id:

            return plugin

    raise HTTPException(

        status_code=404,

        detail="Plugin not found."

    )


@router.put("/{plugin_id}")
async def update_plugin(plugin_id: str, data: dict):

    for plugin in PLUGINS:

        if plugin["id"] == plugin_id:

            plugin.update(data)

            return plugin

    raise HTTPException(

        status_code=404,

        detail="Plugin not found."

    )


@router.delete("/{plugin_id}")
async def uninstall_plugin(plugin_id: str):

    for plugin in PLUGINS:

        if plugin["id"] == plugin_id:

            PLUGINS.remove(plugin)

            return {

                "success": True

            }

    raise HTTPException(

        status_code=404,

        detail="Plugin not found."

    )