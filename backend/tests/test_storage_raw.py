import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from services.hardware.storage_windows import WindowsStorageDetector

detector = WindowsStorageDetector()

print("=" * 60)

for disk in detector.summary():

    print(disk)