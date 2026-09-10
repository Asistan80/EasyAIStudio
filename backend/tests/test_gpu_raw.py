import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)

import wmi

c = wmi.WMI()

print("=" * 60)

for gpu in c.Win32_VideoController():

    print("Name           :", gpu.Name)

    print("DriverVersion  :", gpu.DriverVersion)

    print("VideoProcessor :", gpu.VideoProcessor)

    print("AdapterRAM     :", gpu.AdapterRAM)

    print("PNPDeviceID    :", gpu.PNPDeviceID)

    print("VideoMode      :", gpu.VideoModeDescription)

    print("-" * 60)