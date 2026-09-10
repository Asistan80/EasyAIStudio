"""
==========================================================
Easy AI Studio
File    : backend/services/workflow_manager.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from datetime import datetime
from typing import Dict
from typing import List
from typing import Optional
from uuid import uuid4


class WorkflowManager:

    def __init__(self):

        self.workflows: Dict[str, dict] = {}

    def create(

        self,

        name: str,

        nodes: list = None,

        connections: list = None

    ) -> dict:

        workflow = {

            "id": str(uuid4()),

            "name": name,

            "nodes": nodes or [],

            "connections": connections or [],

            "enabled": True,

            "created_at": datetime.now().isoformat(),

            "updated_at": datetime.now().isoformat()

        }

        self.workflows[workflow["id"]] = workflow

        return workflow

    def get(

        self,

        workflow_id: str

    ) -> Optional[dict]:

        return self.workflows.get(workflow_id)

    def all(self) -> List[dict]:

        return list(self.workflows.values())

    def update(

        self,

        workflow_id: str,

        data: dict

    ) -> Optional[dict]:

        workflow = self.workflows.get(workflow_id)

        if workflow is None:

            return None

        workflow.update(data)

        workflow["updated_at"] = datetime.now().isoformat()

        return workflow

    def delete(

        self,

        workflow_id: str

    ) -> bool:

        if workflow_id in self.workflows:

            del self.workflows[workflow_id]

            return True

        return False

    def enable(

        self,

        workflow_id: str

    ) -> bool:

        workflow = self.get(workflow_id)

        if workflow:

            workflow["enabled"] = True

            return True

        return False

    def disable(

        self,

        workflow_id: str

    ) -> bool:

        workflow = self.get(workflow_id)

        if workflow:

            workflow["enabled"] = False

            return True

        return False

    def count(self) -> int:

        return len(self.workflows)

    def clear(self):

        self.workflows.clear()


workflow_manager = WorkflowManager()