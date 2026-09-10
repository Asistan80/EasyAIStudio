"""
==========================================================
Easy AI Studio
File    : backend/middleware/request_logger.py
==========================================================
"""

import time

from starlette.middleware.base import BaseHTTPMiddleware

from core.logger import logger


class RequestLoggerMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request, call_next):

        start_time = time.perf_counter()

        response = await call_next(request)

        process_time = round(

            (time.perf_counter() - start_time) * 1000,

            2

        )

        logger.info(

            "%s %s %s %.2fms",

            request.method,

            request.url.path,

            response.status_code,

            process_time

        )

        response.headers["X-Process-Time"] = str(process_time)

        return response