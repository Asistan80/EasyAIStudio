"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/tasks.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException


router = APIRouter()


TASKS = []


@router.get("/")
async def get_tasks():

    return {

        "count": len(TASKS),

        "tasks": TASKS

    }


@router.post("/")
async def create_task(data: dict):

    task = {

        "id": str(uuid4()),

        "title": data.get("title", "New Task"),

        "description": data.get("description", ""),

        "status": data.get("status", "pending"),

        "priority": data.get("priority", "normal"),

        "progress": data.get("progress", 0),

        "created_at": datetime.now().isoformat(),

        "updated_at": datetime.now().isoformat()

    }

    TASKS.append(task)

    return task


@router.get("/{task_id}")
async def get_task(task_id: str):

    for task in TASKS:

        if task["id"] == task_id:

            return task

    raise HTTPException(

        status_code=404,

        detail="Task not found."

    )


@router.put("/{task_id}")
async def update_task(task_id: str, data: dict):

    for task in TASKS:

        if task["id"] == task_id:

            task.update(data)

            task["updated_at"] = datetime.now().isoformat()

            return task

    raise HTTPException(

        status_code=404,

        detail="Task not found."

    )


@router.delete("/{task_id}")
async def delete_task(task_id: str):

    for task in TASKS:

        if task["id"] == task_id:

            TASKS.remove(task)

            return {

                "success": True

            }

    raise HTTPException(

        status_code=404,

        detail="Task not found."

    )