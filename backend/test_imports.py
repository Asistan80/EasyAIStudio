from services.hardware.cpu_detector import CPUDetector
from services.hardware.gpu_detector import GPUDetector
from services.hardware.memory_detector import MemoryDetector
from services.hardware.storage_detector import StorageDetector
from services.hardware.cuda_detector import CUDADetector
from services.hardware.opencl_detector import OpenCLDetector
from services.hardware.vulkan_detector import VulkanDetector
from services.hardware.hardware_service import HardwareService
from services.system.system_analyzer import SystemAnalyzer

print("===================================")
print(" Easy AI Studio Import Test")
print("===================================")

print("CPU OK")
print("GPU OK")
print("Memory OK")
print("Storage OK")
print("CUDA OK")
print("OpenCL OK")
print("Vulkan OK")
print("HardwareService OK")
print("SystemAnalyzer OK")

print("\nALL IMPORTS SUCCESSFUL")