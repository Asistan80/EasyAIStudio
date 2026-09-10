import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)

from services.hardware.gpu_detector import GPUDetector

gpu = GPUDetector()

print("=" * 50)
print("GPU TEST")
print("=" * 50)

print(gpu.summary())