"""
==========================================================
Easy AI Studio
File    : backend/api/routes.py
Version : 1.1.0
Sprint  : 10
==========================================================
"""

from fastapi import APIRouter

from api.endpoints.chat import router as chat_router
from api.endpoints.files import router as files_router
from api.endpoints.images import router as images_router
from api.endpoints.models import router as models_router
from api.endpoints.plugins import router as plugins_router
from api.endpoints.projects import router as projects_router
from api.endpoints.providers import router as providers_router
from api.endpoints.settings import router as settings_router
from api.endpoints.status import router as status_router
from api.endpoints.system import router as system_router
from api.endpoints.tasks import router as tasks_router
from api.endpoints.videos import router as videos_router
from api.endpoints.workflows import router as workflows_router
from api.endpoints.gallery import router as gallery_router


api_router = APIRouter(

    prefix="/api"

)


api_router.include_router(

    status_router,

    prefix="/status",

    tags=["Status"]

)


api_router.include_router(

    system_router,

    prefix="/system",

    tags=["System"]

)


api_router.include_router(

    settings_router,

    prefix="/settings",

    tags=["Settings"]

)


api_router.include_router(

    projects_router,

    prefix="/projects",

    tags=["Projects"]

)


api_router.include_router(

    files_router,

    prefix="/files",

    tags=["Files"]

)


api_router.include_router(

    providers_router,

    prefix="/providers",

    tags=["Providers"]

)


api_router.include_router(

    models_router,

    prefix="/models",

    tags=["Models"]

)


api_router.include_router(

    chat_router,

    prefix="/chat",

    tags=["Chat"]

)


api_router.include_router(

    images_router,

    prefix="/images",

    tags=["Images"]

)

api_router.include_router(
    gallery_router
)

api_router.include_router(

    videos_router,

    prefix="/videos",

    tags=["Videos"]

)


api_router.include_router(

    workflows_router,

    prefix="/workflows",

    tags=["Workflows"]

)


api_router.include_router(

    tasks_router,

    prefix="/tasks",

    tags=["Tasks"]

)


api_router.include_router(

    plugins_router,

    prefix="/plugins",

    tags=["Plugins"]

)