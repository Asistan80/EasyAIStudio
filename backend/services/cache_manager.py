"""
==========================================================
Easy AI Studio
File    : backend/services/cache_manager.py
Version : 1.0.0
Sprint  : 10
==========================================================
"""

import time

from typing import Any
from typing import Dict
from typing import Optional


class CacheManager:

    def __init__(self):

        self.cache: Dict[str, dict] = {}

    def set(

        self,

        key: str,

        value: Any,

        ttl: int = 300

    ) -> None:

        self.cache[key] = {

            "value": value,

            "expires": time.time() + ttl

        }

    def get(

        self,

        key: str

    ) -> Optional[Any]:

        item = self.cache.get(key)

        if item is None:

            return None

        if item["expires"] < time.time():

            del self.cache[key]

            return None

        return item["value"]

    def exists(

        self,

        key: str

    ) -> bool:

        return self.get(key) is not None

    def delete(

        self,

        key: str

    ) -> bool:

        if key in self.cache:

            del self.cache[key]

            return True

        return False

    def clear(self):

        self.cache.clear()

    def cleanup(self):

        now = time.time()

        expired = []

        for key, value in self.cache.items():

            if value["expires"] < now:

                expired.append(key)

        for key in expired:

            del self.cache[key]

    def count(self) -> int:

        self.cleanup()

        return len(self.cache)

    def keys(self):

        self.cleanup()

        return list(self.cache.keys())


cache_manager = CacheManager()