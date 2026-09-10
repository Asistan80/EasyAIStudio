"""
==========================================================
Easy AI Studio
File    : backend/services/prompt_manager.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from datetime import datetime
from uuid import uuid4

from typing import Dict
from typing import List
from typing import Optional


class PromptManager:

    def __init__(self):

        self.prompts: Dict[str, dict] = {}

    def create(

        self,

        title: str,

        prompt: str,

        category: str = "General"

    ) -> dict:

        item = {

            "id": str(uuid4()),

            "title": title,

            "prompt": prompt,

            "category": category,

            "created_at": datetime.now().isoformat(),

            "updated_at": datetime.now().isoformat()

        }

        self.prompts[item["id"]] = item

        return item

    def get(

        self,

        prompt_id: str

    ) -> Optional[dict]:

        return self.prompts.get(prompt_id)

    def all(self) -> List[dict]:

        return list(self.prompts.values())

    def update(

        self,

        prompt_id: str,

        data: dict

    ) -> Optional[dict]:

        item = self.prompts.get(prompt_id)

        if item is None:

            return None

        item.update(data)

        item["updated_at"] = datetime.now().isoformat()

        return item

    def delete(

        self,

        prompt_id: str

    ) -> bool:

        if prompt_id in self.prompts:

            del self.prompts[prompt_id]

            return True

        return False

    def clear(self):

        self.prompts.clear()

    def count(self) -> int:

        return len(self.prompts)

    def categories(self) -> List[str]:

        categories = {

            item["category"]

            for item in self.prompts.values()

        }

        return sorted(categories)

    def search(

        self,

        keyword: str

    ) -> List[dict]:

        keyword = keyword.lower()

        return [

            item

            for item in self.prompts.values()

            if keyword in item["title"].lower()

            or keyword in item["prompt"].lower()

        ]


prompt_manager = PromptManager()