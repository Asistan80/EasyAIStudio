"""
==========================================================
Easy AI Studio
File    : backend/middleware/error_handler.py
==========================================================
"""

import traceback

from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from core.logger import logger


class ErrorHandlerMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request, call_next):

        try:

            return await call_next(request)

        except Exception as exc:

            logger.error("Unhandled Exception")
            logger.error(str(exc))
            logger.error(traceback.format_exc())

            return JSONResponse(

                status_code=500,

                content={

                    "success": False,

                    "message": str(exc)

                }

            )