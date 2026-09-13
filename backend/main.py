"""
==========================================================
Easy AI Studio
File    : backend/main.py
Version : 1.1.0
Sprint  : 10
==========================================================
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.routes import api_router
from config.settings import settings
from core.logger import logger
from middleware.error_handler import ErrorHandlerMiddleware
from middleware.request_logger import RequestLoggerMiddleware
from services.bootstrap import bootstrap
from services.provider_service import provider_service


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)


# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ==========================================================
# MIDDLEWARE
# ==========================================================

app.add_middleware(
    RequestLoggerMiddleware
)

app.add_middleware(
    ErrorHandlerMiddleware
)


# ==========================================================
# API ROUTES
# ==========================================================

app.include_router(
    api_router
)


# ==========================================================
# STATIC FILES
# ==========================================================

app.mount(
    "/exports",
    StaticFiles(
        directory=str(settings.EXPORTS_DIR)
    ),
    name="exports"
)


# ==========================================================
# STARTUP
# ==========================================================

@app.on_event("startup")
async def startup():

    await provider_service.initialize()

    result = bootstrap()

    logger.info(
        "Bootstrap completed."
    )

    logger.info(
        f"Providers : {result['providers']}"
    )

    logger.info(
        f"Models    : {result['models']}"
    )

    logger.info(
        f"Services  : {result['services']}"
    )


# ==========================================================
# ROOT
# ==========================================================

@app.get("/")
async def root():

    return {
        "application": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }


# ==========================================================
# HEALTH
# ==========================================================

@app.get("/health")
async def health():

    return {
        "success": True
    }


# ==========================================================
# VERSION
# ==========================================================

@app.get("/version")
async def version():

    return {
        "version": settings.APP_VERSION
    }