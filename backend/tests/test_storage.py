import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from services.hardware.storage_detector import StorageDetector

print("=" * 60)
print("STORAGE TEST")
print("=" * 60)

storage = StorageDetector()

print(storage.summary())