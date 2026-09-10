"""
==========================================================
Easy AI Studio
File    : backend/services/export_manager.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

from datetime import datetime
from pathlib import Path
from typing import Dict
from typing import List
from uuid import uuid4

from config.settings import settings


class ExportManager:

    def __init__(self):

        self.exports: Dict[str, dict] = {}

    def create(

        self,

        filename: str,

        export_type: str

    ) -> dict:

        export = {

            "id": str(uuid4()),

            "filename": filename,

            "type": export_type,

            "path": str(

                settings.EXPORTS_DIR / filename

            ),

            "created_at": datetime.now().isoformat()

        }

        self.exports[export["id"]] = export

        return export

    def get(

        self,

        export_id: str

    ):

        return self.exports.get(export_id)

    def all(self) -> List[dict]:

        return list(self.exports.values())

    def exists(

        self,

        export_id: str

    ) -> bool:

        return export_id in self.exports

    def delete(

        self,

        export_id: str

    ) -> bool:

        item = self.exports.get(export_id)

        if item is None:

            return False

        file = Path(item["path"])

        if file.exists():

            file.unlink()

        del self.exports[export_id]

        return True

    def clear(self):

        self.exports.clear()

    def count(self) -> int:

        return len(self.exports)

    def export_directory(self) -> str:

        return str(settings.EXPORTS_DIR)

    def list_files(self):

        files = []

        settings.EXPORTS_DIR.mkdir(

            parents=True,

            exist_ok=True

        )

        for file in settings.EXPORTS_DIR.iterdir():

            if file.is_file():

                files.append(

                    {

                        "name": file.name,

                        "size": file.stat().st_size

                    }

                )

        return sorted(

            files,

            key=lambda x: x["name"]

        )


export_manager = ExportManager()