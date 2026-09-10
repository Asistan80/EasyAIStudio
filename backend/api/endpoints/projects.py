"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/projects.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

import json
from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from config.settings import settings


router = APIRouter()


PROJECTS_FILE = settings.SETTINGS_DIR / "projects.json"


def load_projects():

    if not PROJECTS_FILE.exists():

        save_projects([])

        return []

    try:

        with open(

            PROJECTS_FILE,

            "r",

            encoding="utf-8"

        ) as file:

            return json.load(file)

    except Exception:

        return []


def save_projects(data):

    PROJECTS_FILE.parent.mkdir(

        parents=True,

        exist_ok=True

    )

    with open(

        PROJECTS_FILE,

        "w",

        encoding="utf-8"

    ) as file:

        json.dump(

            data,

            file,

            indent=4,

            ensure_ascii=False

        )


@router.get("/")
async def get_projects():

    return load_projects()


@router.get("/{project_id}")
async def get_project(project_id: str):

    projects = load_projects()

    for project in projects:

        if project["id"] == project_id:

            return project

    raise HTTPException(

        status_code=404,

        detail="Project not found."

    )


@router.post("/")
async def create_project(data: dict):

    projects = load_projects()

    project = {

        "id": str(uuid4()),

        "name": data.get("name", "New Project"),

        "description": data.get("description", ""),

        "type": data.get("type", "general"),

        "created_at": datetime.now().isoformat(),

        "updated_at": datetime.now().isoformat()

    }

    projects.append(project)

    save_projects(projects)

    return project


@router.put("/{project_id}")
async def update_project(project_id: str, data: dict):

    projects = load_projects()

    for project in projects:

        if project["id"] == project_id:

            project.update(data)

            project["updated_at"] = datetime.now().isoformat()

            save_projects(projects)

            return project

    raise HTTPException(

        status_code=404,

        detail="Project not found."

    )


@router.delete("/{project_id}")
async def delete_project(project_id: str):

    projects = load_projects()

    for project in projects:

        if project["id"] == project_id:

            projects.remove(project)

            save_projects(projects)

            return {

                "success": True

            }

    raise HTTPException(

        status_code=404,

        detail="Project not found."

    )