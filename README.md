# 💻 PC Component Reporter (Node.js)

A simple, zero-configuration Node.js script designed to export comprehensive information about your computer's hardware and operating system into a single, easy-to-read text file.

This tool uses the powerful `systeminformation` library to gather details that are often difficult to find in one place, such as specific motherboard models, SSD part numbers, and network device names.

---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## ✨ Features

* **Comprehensive Data:** Exports details for the following components:
    * **System/OS:** Operating System, Hostname, Manufacturer.
    * **Motherboard:** Model, Manufacturer, Version.
    * **CPU:** Brand, Speed, Cores, Socket.
    * **Memory (RAM):** Total Size.
    * **Graphics (GPU):** Model, VRAM, Driver.
    * **Network:** Interface Name, Model, MAC Address, Speed.
    * **Storage:** Drive Name, Type (SSD/HDD), Size, Interface.
* **Clean Output:** Formats the data into a structured `.txt` file, converting raw bytes into readable GB and listing components clearly.
* **Easy to Run:** Requires only Node.js and one simple command to execute.

------------------------------------------------------------------------------------------------------------------------------------------

## 🚀 Setup & Installation
Before running the script, ensure you have **Node.js** installed on your system.

### 1. Initialize Project
Open your terminal or command prompt and run the following commands in the folder where you want to keep the script:

# Install the required library
`npm install systeminformation`

# Run the script directly from your terminal:
`node index.js`

### Output
The script will gather the information (which may take a moment) and then output a confirmation message:

`Success! Report saved to: my_pc_specs.txt
Open the file to see your Network Devices and other specs.`

A new file named my_pc_specs.txt will be created in the same directory, containing your full component report.
--------------------------------------------------------------------------------------------------------------

### 📄 Example Output Structure
The output file uses clear headings for easy readability. You will find specific details, like your SATA SSD model, listed under the [ STORAGE ] section, and your motherboard model under [ MOTHERBOARD ].
```
PC COMPONENT REPORT
Generated on: [Date/Time]
==========================================

[ SYSTEM ]
Manufacturer : [System Manufacturer]
Model        : [System Model]
...

[ MOTHERBOARD ]
Manufacturer : [Motherboard Manufacturer]
Model        : [Motherboard Model Number]
Version      : [Version]
...

[ CPU ]
Brand        : [CPU Brand and Model]
Speed        : [Speed] GHz (Base)
...

[ NETWORK ]
Interface    : [e.g., Ethernet or Wi-Fi]
Model        : [Network Adapter Model]
Type         : Wired
...

​[ STORAGE ]
Drive #1     : Samsung 990 PRO 1TB
Type         : M.2 NVMe PCIe 4.0
Size         : 931.51 GB
...
