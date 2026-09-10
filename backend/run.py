"""
==========================================================
Easy AI Studio
File    : backend/run.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

import uvicorn

from config.settings import settings


def main():

    uvicorn.run(

        "main:app",

        host=settings.HOST,

        port=settings.PORT,

        reload=settings.DEBUG,

        log_level="info"

    )


if __name__ == "__main__":

    main()