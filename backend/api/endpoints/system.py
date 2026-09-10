"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/system.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

import os
import platform
import socket
import sys
from datetime import datetime

import psutil
from fastapi import APIRouter

from config.settings import settings


router = APIRouter()


@router.get("/")
async def get_system():

    vm = psutil.virtual_memory()
    disk = psutil.disk_usage("/")

    return {

        "application": settings.APP_NAME,

        "version": settings.APP_VERSION,

        "datetime": datetime.now().isoformat(),

        "hostname": socket.gethostname(),

        "platform": platform.system(),

        "platform_release": platform.release(),

        "architecture": platform.machine(),

        "python": sys.version,

        "cpu": {

            "cores": psutil.cpu_count(),

            "usage": psutil.cpu_percent(interval=0.1)

        },

        "memory": {

            "total": vm.total,

            "used": vm.used,

            "available": vm.available,

            "percent": vm.percent

        },

        "disk": {

            "total": disk.total,

            "used": disk.used,

            "free": disk.free,

            "percent": disk.percent

        }

    }


@router.get("/environment")
async def get_environment():

    return {

        "cwd": os.getcwd(),

        "debug": settings.DEBUG,

        "host": settings.HOST,

        "port": settings.PORT

    }


@router.get("/directories")
async def get_directories():

    return {

        "frontend": str(settings.FRONTEND_DIR),

        "gallery": str(settings.GALLERY_DIR),

        "exports": str(settings.EXPORTS_DIR),

        "prompts": str(settings.PROMPTS_DIR),

        "settings": str(settings.SETTINGS_DIR),

        "tests": str(settings.TESTS_DIR)

    }


@router.get("/ping")
async def ping():

    return {

        "success": True,

        "message": "System API Online"

    }