"""
==========================================================
Easy AI Studio
File    : backend/app.py
Version : 1.0.1
Sprint  : 10
==========================================================
"""

from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse
from fastapi.staticfiles import StaticFiles

from api.routes import api_router
from config.settings import settings
from middleware.error_handler import global_exception_handler
from middleware.request_logger import log_requests
from utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):

    logger.info("========================================")
    logger.info("Easy AI Studio Backend Starting...")
    logger.info("========================================")

    yield

    logger.info("========================================")
    logger.info("Easy AI Studio Backend Stopped.")
    logger.info("========================================")


app = FastAPI(

    title=settings.APP_NAME,

    version=settings.APP_VERSION,

    description=settings.APP_DESCRIPTION,

    default_response_class=ORJSONResponse,

    lifespan=lifespan

)


app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]

)


app.middleware("http")(log_requests)

app.add_exception_handler(

    Exception,

    global_exception_handler

)


app.include_router(

    api_router

)


app.mount(

    "/gallery",

    StaticFiles(directory=settings.GALLERY_DIR),

    name="gallery"

)


app.mount(

    "/exports",

    StaticFiles(directory=settings.EXPORTS_DIR),

    name="exports"

)


@app.get("/", tags=["System"])
async def root():

    return {

        "application": settings.APP_NAME,

        "version": settings.APP_VERSION,

        "status": "running"

    }


@app.get("/health", tags=["System"])
async def health():

    return {

        "status": "healthy"

    }


if __name__ == "__main__":

    uvicorn.run(

        "app:app",

        host=settings.HOST,

        port=settings.PORT,

        reload=settings.DEBUG

    )