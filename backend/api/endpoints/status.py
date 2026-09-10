"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/status.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

import platform
import sys
from datetime import datetime

import psutil
from fastapi import APIRouter

from config.settings import settings


router = APIRouter()


@router.get("/")
async def get_status():

    return {

        "application": settings.APP_NAME,

        "version": settings.APP_VERSION,

        "status": "running",

        "debug": settings.DEBUG,

        "python": sys.version.split()[0],

        "platform": platform.platform(),

        "cpu_percent": psutil.cpu_percent(interval=0.1),

        "cpu_cores": psutil.cpu_count(),

        "memory": {

            "total": psutil.virtual_memory().total,

            "used": psutil.virtual_memory().used,

            "available": psutil.virtual_memory().available,

            "percent": psutil.virtual_memory().percent

        },

        "boot_time": datetime.fromtimestamp(

            psutil.boot_time()

        ).isoformat()

    }


@router.get("/ping")
async def ping():

    return {

        "message": "pong"

    }