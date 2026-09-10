import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)

from services.hardware.cpu_detector import CPUDetector

cpu = CPUDetector()

print("=" * 50)
print("CPU TEST")
print("=" * 50)

print(cpu.summary())


