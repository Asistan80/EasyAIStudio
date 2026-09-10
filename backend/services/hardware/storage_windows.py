"""
Easy AI Studio
Windows Storage Detector
"""

from __future__ import annotations

import subprocess


class WindowsStorageDetector:

    def __init__(self):

        self.drives = []

        self.detect()

    # ---------------------------------------------------------

    def detect(self):

        self.drives.clear()

        try:

            command = [

                "powershell",

                "-NoProfile",

                "-Command",

                (
                    "Get-PhysicalDisk | "
                    "Select-Object FriendlyName,MediaType,BusType,Size,HealthStatus | "
                    "ConvertTo-Csv -NoTypeInformation"
                )

            ]

            output = subprocess.check_output(

                command,

                text=True,

                encoding="utf-8",

                errors="ignore"

            )

            for line in output.splitlines():

                line = line.strip()

                if not line:
                    continue

                if line.startswith('"FriendlyName"'):
                    continue

                parts = [

                    p.strip().replace('"', "")

                    for p in line.split(",")

                ]

                if len(parts) < 5:
                    continue

                name = parts[0]

                media = parts[1]

                bus = parts[2]

                size = parts[3]

                health = parts[4]

                try:

                    size_gb = round(

                        int(size) / 1024 / 1024 / 1024,

                        2

                    )

                except Exception:

                    size_gb = 0

                self.drives.append({

                    "name": name,

                    "media_type": media,

                    "bus_type": bus,

                    "size_gb": size_gb,

                    "health": health

                })

        except Exception:

            pass

    # ---------------------------------------------------------

    def summary(self):

        return self.drives.copy()