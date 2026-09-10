"""
==========================================================
Easy AI Studio
File    : backend/api/endpoints/workflows.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException


router = APIRouter()


WORKFLOWS = []


@router.get("/")
async def get_workflows():

    return {

        "count": len(WORKFLOWS),

        "workflows": WORKFLOWS

    }


@router.post("/")
async def create_workflow(data: dict):

    workflow = {

        "id": str(uuid4()),

        "name": data.get("name", "New Workflow"),

        "description": data.get("description", ""),

        "nodes": data.get("nodes", []),

        "connections": data.get("connections", []),

        "enabled": data.get("enabled", True),

        "created_at": datetime.now().isoformat(),

        "updated_at": datetime.now().isoformat()

    }

    WORKFLOWS.append(workflow)

    return workflow


@router.get("/{workflow_id}")
async def get_workflow(workflow_id: str):

    for workflow in WORKFLOWS:

        if workflow["id"] == workflow_id:

            return workflow

    raise HTTPException(

        status_code=404,

        detail="Workflow not found."

    )


@router.put("/{workflow_id}")
async def update_workflow(

    workflow_id: str,

    data: dict

):

    for workflow in WORKFLOWS:

        if workflow["id"] == workflow_id:

            workflow.update(data)

            workflow["updated_at"] = datetime.now().isoformat()

            return workflow

    raise HTTPException(

        status_code=404,

        detail="Workflow not found."

    )


@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str):

    for workflow in WORKFLOWS:

        if workflow["id"] == workflow_id:

            WORKFLOWS.remove(workflow)

            return {

                "success": True

            }

    raise HTTPException(

        status_code=404,

        detail="Workflow not found."

    )