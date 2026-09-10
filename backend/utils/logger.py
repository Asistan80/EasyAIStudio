"""
==========================================================
Easy AI Studio
File    : backend/utils/logger.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path

from config.settings import BASE_DIR, settings


LOG_DIR = BASE_DIR / "logs"

LOG_DIR.mkdir(

    parents=True,

    exist_ok=True

)


LOG_FILE = LOG_DIR / "easy_ai_studio.log"


logger = logging.getLogger("EasyAIStudio")


logger.setLevel(

    getattr(

        logging,

        settings.LOG_LEVEL.upper(),

        logging.INFO

    )

)


logger.handlers.clear()


formatter = logging.Formatter(

    "[%(asctime)s] "

    "[%(levelname)s] "

    "[%(name)s] "

    "%(message)s",

    "%Y-%m-%d %H:%M:%S"

)


file_handler = RotatingFileHandler(

    LOG_FILE,

    maxBytes=5 * 1024 * 1024,

    backupCount=5,

    encoding="utf-8"

)

file_handler.setFormatter(

    formatter

)


console_handler = logging.StreamHandler()

console_handler.setFormatter(

    formatter

)


logger.addHandler(

    file_handler

)

logger.addHandler(

    console_handler

)


logger.propagate = False


logger.info(

    "Logger initialized."

)