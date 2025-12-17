#🔎 SystemInfoFinder

**SystemInfoFinder** is a powerful, zero-configuration Node.js utility designed to generate a "Deep Dive" diagnostic report of your computer's hardware and software environment.

Unlike basic system checks, this tool utilizes the `systeminformation` library to extract granular details—from individual RAM stick timings and BIOS versions to connected USB peripherals and audio drivers—exporting everything into a clean, categorized text file.

-----------------------------------

## ✨ Features

Generates a `full_pc_report.txt` containing detailed metrics across **14+ categories**:

* **🖥️ System & Chassis:** Manufacturer, Model, Serial Numbers, Chassis Type.
* **⚙️ BIOS/Firmware:** Vendor, Version, Release Date.
* **🧠 CPU:** Socket type, Cache sizes (L1/L2/L3), Governor, Virtualization support.
* **💾 Memory (RAM):** Total vs. Available, plus **individual stick details** (Clock Speed, Voltage, Manufacturer).
* **🎮 Graphics:** GPU VRAM, Driver versions, and **Monitor** refresh rates/resolutions.
* **🔌 Peripherals:** Connected **USB devices** (Mice, Keyboards) and **Audio** inputs/outputs.
* **🖧 Network:** Active Interfaces, MAC Addresses, IP, and Link Speeds.
* **📂 Storage:** Physical Disk specs (Model, Firmware) and Logical Volume usage (C: drive usage %).

-----------------------------------

## 🚀 Setup & Installation

Ensure you have **Node.js** installed on your machine.

Open your terminal or command prompt in your project folder and run:

# Install the systeminformation library
`npm install systeminformation`

---------------------------------------

## ⚠️ Note: The scan may take 5-10 seconds to complete as it queries detailed hardware controllers.

---------------------------------------

​## 2. View Report

A file named `full_pc_report.txt` will be generated in the same directory.

​# 📄 Example Output Structure

FULL SYSTEM DIAGNOSTIC REPORT
Generated on: 12/17/2025, 10:45:00 AM
Uptime      : 4.50 Hours
============================================================
[ SYSTEM HARDWARE ]
============================================================
Manufacturer : Dell Inc.
Model        : XPS 8940
Serial Num   : 8J9K...
...

============================================================
[ BIOS / FIRMWARE ]
============================================================
Vendor       : Dell Inc.
Version      : 2.13.0
Release Date : 2023-11-15
...

============================================================
[ MEMORY (RAM) SUMMARY ]
============================================================
Total Size   : 31.70 GB
Available    : 16.40 GB

--- PHYSICAL MEMORY STICKS (DIMMS) ---
[Stick #1]
  Size       : 16.00 GB
  Type       : DDR4
  Clock Speed: 3200 MHz
  Manuf      : Samsung
...

============================================================
[ GRAPHICS CONTROLLERS (GPU) ]
============================================================
[GPU #1]
  Model      : NVIDIA GeForce RTX 3070
  VRAM       : 8.00 GB
  Driver     : 536.23
...

--- DISPLAYS (MONITORS) ---
[Display #1]
  Model      : LG UltraGear
  Resolution : 2560 x 1440
  Refresh    : 144 Hz
...

============================================================
[ PHYSICAL STORAGE (DISKS) ]
============================================================
[Disk #1] -> Samsung 990 PRO 1TB
  Type       : SSD (NVMe)
  Size       : 931.51 GB
  Firmware   : 2B2QEXM7
...

============================================================
[ USB DEVICES ]
============================================================
[USB #1]
  Name       : Razer DeathAdder V2
  Type       : HID
...
