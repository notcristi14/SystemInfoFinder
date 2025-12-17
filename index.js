const si = require('systeminformation');
const fs = require('fs');
const path = require('path');

// --- HELPER FUNCTIONS ---

// Convert bytes to readable formats
const formatBytes = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Safe string printer (handles null/undefined)
const print = (val) => (val !== null && val !== undefined && val !== '') ? val : 'N/A';

// Section Header Formatter
const header = (title) => {
    return `\n${'='.repeat(60)}\n[ ${title} ]\n${'='.repeat(60)}\n`;
};

// --- MAIN SCRIPT ---

async function generateDeepDiveReport() {
    console.log("🚀 Starting Deep Dive System Scan...");
    console.log("   (This scans everything: USB, Audio, BIOS, Disks...)");
    console.log("   Please wait, this might take 10-15 seconds.");

    try {
        // Fetch ALL data concurrently
        // We separate these to handle errors in specific sections without crashing the whole report
        const data = await Promise.all([
            si.time(),              // 0
            si.system(),            // 1
            si.bios(),              // 2
            si.baseboard(),         // 3
            si.chassis(),           // 4
            si.osInfo(),            // 5
            si.uuid(),              // 6
            si.cpu(),               // 7
            si.cpuCache(),          // 8
            si.mem(),               // 9
            si.memLayout(),         // 10
            si.graphics(),          // 11
            si.diskLayout(),        // 12
            si.fsSize(),            // 13
            si.networkInterfaces(), // 14
            si.audio(),             // 15
            si.usb(),               // 16
            si.bluetoothDevices()   // 17
        ]);

        let report = `FULL SYSTEM DIAGNOSTIC REPORT\n`;
        report += `Generated on: ${new Date(data[0].current).toLocaleString()}\n`;
        report += `Uptime      : ${(data[0].uptime / 3600).toFixed(2)} Hours\n`;

        // 1. SYSTEM HARDWARE
        report += header('SYSTEM HARDWARE');
        report += `Manufacturer : ${print(data[1].manufacturer)}\n`;
        report += `Model        : ${print(data[1].model)}\n`;
        report += `Version      : ${print(data[1].version)}\n`;
        report += `Serial Num   : ${print(data[1].serial)}\n`;
        report += `UUID         : ${print(data[6].os)}\n`;
        report += `SKU          : ${print(data[1].sku)}\n`;

        // 2. BIOS / FIRMWARE
        report += header('BIOS / FIRMWARE');
        report += `Vendor       : ${print(data[2].vendor)}\n`;
        report += `Version      : ${print(data[2].version)}\n`;
        report += `Release Date : ${print(data[2].releaseDate)}\n`;
        report += `Revision     : ${print(data[2].revision)}\n`;

        // 3. MOTHERBOARD (BASEBOARD)
        report += header('MOTHERBOARD');
        report += `Manufacturer : ${print(data[3].manufacturer)}\n`;
        report += `Model        : ${print(data[3].model)}\n`;
        report += `Version      : ${print(data[3].version)}\n`;
        report += `Serial Num   : ${print(data[3].serial)}\n`;
        report += `Asset Tag    : ${print(data[3].assetTag)}\n`;

        // 4. CHASSIS (CASE)
        report += header('CHASSIS / CASE');
        report += `Type         : ${print(data[4].type)}\n`;
        report += `Manufacturer : ${print(data[4].manufacturer)}\n`;
        report += `Model        : ${print(data[4].model)}\n`;
        report += `Serial Num   : ${print(data[4].serial)}\n`;

        // 5. OPERATING SYSTEM
        report += header('OPERATING SYSTEM');
        report += `Platform     : ${print(data[5].platform)}\n`;
        report += `Distro       : ${print(data[5].distro)}\n`;
        report += `Release      : ${print(data[5].release)}\n`;
        report += `Codename     : ${print(data[5].codename)}\n`;
        report += `Kernel       : ${print(data[5].kernel)}\n`;
        report += `Arch         : ${print(data[5].arch)}\n`;
        report += `Hostname     : ${print(data[5].hostname)}\n`;
        report += `UEFI         : ${data[5].uefi ? 'Yes' : 'No'}\n`;

        // 6. PROCESSOR (CPU)
        report += header('PROCESSOR (CPU)');
        report += `Manufacturer : ${print(data[7].manufacturer)}\n`;
        report += `Brand        : ${print(data[7].brand)}\n`;
        report += `Socket       : ${print(data[7].socket)}\n`;
        report += `Speed        : ${data[7].speed} GHz (Base) / ${data[7].speedMax} GHz (Max)\n`;
        report += `Cores        : ${data[7].physicalCores} Physical / ${data[7].cores} Logical\n`;
        report += `Governor     : ${print(data[7].governor)}\n`;
        report += `Family/Model : ${data[7].family} / ${data[7].model}\n`;
        report += `Virtualiz.   : ${data[7].virtualization ? 'Supported' : 'No'}\n`;
        
        report += `\n--- CPU CACHE ---\n`;
        report += `L1 Data      : ${formatBytes(data[8].l1d)}\n`;
        report += `L1 Instruct  : ${formatBytes(data[8].l1i)}\n`;
        report += `L2 Cache     : ${formatBytes(data[8].l2)}\n`;
        report += `L3 Cache     : ${formatBytes(data[8].l3)}\n`;

        // 7. MEMORY (RAM)
        report += header('MEMORY (RAM) SUMMARY');
        report += `Total Size   : ${formatBytes(data[9].total)}\n`;
        report += `Available    : ${formatBytes(data[9].available)}\n`;
        report += `Used         : ${formatBytes(data[9].used)}\n`;
        
        report += `\n--- PHYSICAL MEMORY STICKS (DIMMS) ---\n`;
        data[10].forEach((stick, i) => {
            report += `[Stick #${i + 1}]\n`;
            report += `  Size       : ${formatBytes(stick.size)}\n`;
            report += `  Type       : ${print(stick.type)}\n`;
            report += `  Clock Speed: ${print(stick.clockSpeed)} MHz\n`;
            report += `  Manuf      : ${print(stick.manufacturer)}\n`;
            report += `  Part Num   : ${print(stick.partNum)}\n`;
            report += `  Voltage    : ${print(stick.voltageConfigured)}v\n`;
        });

        // 8. GRAPHICS (GPU & DISPLAYS)
        report += header('GRAPHICS CONTROLLERS (GPU)');
        data[11].controllers.forEach((gpu, i) => {
            report += `[GPU #${i + 1}]\n`;
            report += `  Model      : ${print(gpu.model)}\n`;
            report += `  Vendor     : ${print(gpu.vendor)}\n`;
            report += `  VRAM       : ${gpu.vram ? formatBytes(gpu.vram * 1024 * 1024) : 'Shared/Dynamic'}\n`;
            report += `  Bus        : ${print(gpu.bus)}\n`;
            report += `  Driver     : ${print(gpu.driverVersion)}\n`;
        });

        report += `\n--- DISPLAYS (MONITORS) ---\n`;
        data[11].displays.forEach((disp, i) => {
            report += `[Display #${i + 1}]\n`;
            report += `  Model      : ${print(disp.model)}\n`;
            report += `  Resolution : ${disp.resolutionX} x ${disp.resolutionY}\n`;
            report += `  Refresh    : ${print(disp.currentRefreshRate)} Hz\n`;
            report += `  Connection : ${print(disp.connection)}\n`;
            report += `  Main       : ${disp.main ? 'Yes (Primary)' : 'No'}\n`;
        });

        // 9. STORAGE DEVICES
        report += header('PHYSICAL STORAGE (DISKS)');
        data[12].forEach((disk, i) => {
            report += `[Disk #${i + 1}] -> ${print(disk.name)}\n`;
            report += `  Type       : ${print(disk.type)} (${print(disk.interfaceType)})\n`;
            report += `  Size       : ${formatBytes(disk.size)}\n`;
            report += `  Vendor     : ${print(disk.vendor)}\n`;
            report += `  Firmware   : ${print(disk.firmwareRevision)}\n`;
            report += `  Serial     : ${print(disk.serialNum)}\n`; // Warning: Usually hidden by OS permissions
        });

        // 10. FILE SYSTEMS (VOLUMES)
        report += header('LOGICAL VOLUMES (DRIVES)');
        data[13].forEach((fs, i) => {
            report += `[Volume: ${print(fs.fs)}]\n`;
            report += `  Mount Point: ${print(fs.mount)}\n`;
            report += `  Type       : ${print(fs.type)}\n`;
            report += `  Size       : ${formatBytes(fs.size)}\n`;
            report += `  Used       : ${formatBytes(fs.used)} (${fs.use}%)\n`;
        });

        // 11. NETWORK
        report += header('NETWORK INTERFACES');
        data[14].forEach((net, i) => {
            report += `[Interface: ${print(net.iface)}]\n`;
            report += `  Name       : ${print(net.ifaceName)}\n`;
            report += `  Model      : ${print(net.model)}\n`;
            report += `  Type       : ${print(net.type)}\n`;
            report += `  MAC Addr   : ${print(net.mac)}\n`;
            report += `  IPv4       : ${print(net.ip4)}\n`;
            report += `  IPv4 Mask  : ${print(net.ip4subnet)}\n`;
            report += `  State      : ${print(net.operstate)}\n`;
            report += `  Speed      : ${net.speed ? net.speed + ' Mbit/s' : 'N/A'}\n`;
            report += `-----------------\n`;
        });

        // 12. AUDIO
        report += header('AUDIO DEVICES');
        data[15].forEach((audio, i) => {
            report += `[Device #${i + 1}]\n`;
            report += `  Name       : ${print(audio.name)}\n`;
            report += `  Manuf      : ${print(audio.manufacturer)}\n`;
            report += `  Status     : ${print(audio.status)}\n`;
        });

        // 13. USB DEVICES
        report += header('USB DEVICES');
        data[16].forEach((usb, i) => {
            report += `[USB #${i + 1}]\n`;
            report += `  Name       : ${print(usb.name)}\n`;
            report += `  Type       : ${print(usb.type)}\n`;
            report += `  Manuf      : ${print(usb.manufacturer)}\n`;
            report += `  Vendor     : ${print(usb.vendor)}\n`;
        });

        // 14. BLUETOOTH
        report += header('BLUETOOTH');
        if (data[17].length === 0) {
            report += "No connected Bluetooth devices found.\n";
        } else {
            data[17].forEach((bt, i) => {
                report += `[Device #${i + 1}]\n`;
                report += `  Name       : ${print(bt.name)}\n`;
                report += `  MAC        : ${print(bt.macDevice)}\n`;
                report += `  Connected  : ${bt.connected ? 'Yes' : 'No'}\n`;
            });
        }

        // OUTPUT TO FILE
        const fileName = 'full_pc_report.txt';
        const filePath = path.join(__dirname, fileName);
        fs.writeFileSync(filePath, report);

        console.log(`\n✅ DONE!`);
        console.log(`Detailed report saved to: ${fileName}`);

    } catch (e) {
        console.error("Error generating report:", e);
    }
}

generateDeepDiveReport();
