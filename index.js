const si = require('systeminformation');
const fs = require('fs');
const path = require('path');

// --- HELPER FUNCTIONS ---
const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const print = (val) => (val !== null && val !== undefined && val !== '') ? val : 'N/A';

const header = (title) => `\n${'='.repeat(60)}\n[ ${title} ]\n${'='.repeat(60)}\n`;

async function generateDeepDiveReport() {
    console.log("🚀 Starting Deep Dive System Scan...");

    try {
        const [
            time,               // 0
            system,             // 1
            bios,               // 2
            baseboard,          // 3
            chassis,            // 4
            osInfo,             // 5
            uuid,               // 6
            cpu,                // 7
            cpuCache,           // 8
            mem,                // 9
            memLayout,          // 10
            graphics,           // 11
            diskLayout,         // 12
            fsSize,             // 13
            networkInterfaces,  // 14
            audio,              // 15
            usb,                // 16
            bluetoothDevices,   // 17
            battery             // 18 (battery/power info)
        ] = await Promise.all([
            si.time(),
            si.system(),
            si.bios(),
            si.baseboard(),
            si.chassis(),
            si.osInfo(),
            si.uuid(),
            si.cpu(),
            si.cpuCache(),
            si.mem(),
            si.memLayout(),
            si.graphics(),
            si.diskLayout(),
            si.fsSize(),
            si.networkInterfaces(),
            si.audio(),
            si.usb(),
            si.bluetoothDevices(),
            si.battery()
        ]);

        let report = `FULL SYSTEM DIAGNOSTIC REPORT\n`;
        report += `Generated on: ${new Date(time.current).toLocaleString()}\n`;
        report += `Uptime      : ${(time.uptime / 3600).toFixed(2)} Hours\n`;

        // 1. SYSTEM HARDWARE
        report += header('SYSTEM HARDWARE');
        report += `Manufacturer : ${print(system.manufacturer)}\n`;
        report += `Model        : ${print(system.model)}\n`;
        report += `Version      : ${print(system.version)}\n`;
        report += `Serial Num   : ${print(system.serial)}\n`;
        report += `UUID         : ${print(uuid.os)}\n`;
        report += `SKU          : ${print(system.sku)}\n`;

        // 2. BIOS / FIRMWARE
        report += header('BIOS / FIRMWARE');
        report += `Vendor       : ${print(bios.vendor)}\n`;
        report += `Version      : ${print(bios.version)}\n`;
        report += `Release Date : ${print(bios.releaseDate)}\n`;
        report += `Revision     : ${print(bios.revision)}\n`;

        // 3. MOTHERBOARD (BASEBOARD)
        report += header('MOTHERBOARD');
        report += `Manufacturer : ${print(baseboard.manufacturer)}\n`;
        report += `Model        : ${print(baseboard.model)}\n`;
        report += `Version      : ${print(baseboard.version)}\n`;
        report += `Serial Num   : ${print(baseboard.serial)}\n`;
        report += `Asset Tag    : ${print(baseboard.assetTag)}\n`;

        // 4. CHASSIS (CASE)
        report += header('CHASSIS / CASE');
        report += `Type         : ${print(chassis.type)}\n`;
        report += `Manufacturer : ${print(chassis.manufacturer)}\n`;
        report += `Model        : ${print(chassis.model)}\n`;
        report += `Serial Num   : ${print(chassis.serial)}\n`;

        // 5. OPERATING SYSTEM
        report += header('OPERATING SYSTEM');
        report += `Platform     : ${print(osInfo.platform)}\n`;
        report += `Distro       : ${print(osInfo.distro)}\n`;
        report += `Release      : ${print(osInfo.release)}\n`;
        report += `Codename     : ${print(osInfo.codename)}\n`;
        report += `Kernel       : ${print(osInfo.kernel)}\n`;
        report += `Arch         : ${print(osInfo.arch)}\n`;
        report += `Hostname     : ${print(osInfo.hostname)}\n`;
        report += `UEFI         : ${osInfo.uefi ? 'Yes' : 'No'}\n`;

        // 6. PROCESSOR (CPU)
        report += header('PROCESSOR (CPU)');
        report += `Manufacturer : ${print(cpu.manufacturer)}\n`;
        report += `Brand        : ${print(cpu.brand)}\n`;
        report += `Socket       : ${print(cpu.socket)}\n`;
        report += `Speed        : ${print(cpu.speed)} GHz (Base) / ${print(cpu.speedMax)} GHz (Max)\n`;
        report += `Cores        : ${print(cpu.physicalCores)} Physical / ${print(cpu.cores)} Logical\n`;
        report += `Governor     : ${print(cpu.governor)}\n`;
        report += `Family/Model : ${print(cpu.family)} / ${print(cpu.model)}\n`;
        report += `Virtualiz.   : ${cpu.virtualization ? 'Supported' : 'No'}\n`;

        report += `\n--- CPU CACHE ---\n`;
        report += `L1 Data      : ${formatBytes(cpuCache.l1d || 0)}\n`;
        report += `L1 Instruct  : ${formatBytes(cpuCache.l1i || 0)}\n`;
        report += `L2 Cache     : ${formatBytes(cpuCache.l2 || 0)}\n`;
        report += `L3 Cache     : ${formatBytes(cpuCache.l3 || 0)}\n`;

        // 7. MEMORY (RAM)
        report += header('MEMORY (RAM) SUMMARY');
        report += `Total Size   : ${formatBytes(mem.total)}\n`;
        report += `Available    : ${formatBytes(mem.available)}\n`;
        report += `Used         : ${formatBytes(mem.used)}\n`;

        report += `\n--- PHYSICAL MEMORY STICKS (DIMMS) ---\n`;
        if (Array.isArray(memLayout) && memLayout.length) {
            memLayout.forEach((stick, i) => {
                report += `[Stick #${i + 1}]\n`;
                report += `  Size       : ${formatBytes(stick.size)}\n`;
                report += `  Type       : ${print(stick.type)}\n`;
                report += `  Clock Speed: ${print(stick.clockSpeed)} MHz\n`;
                report += `  Manuf      : ${print(stick.manufacturer)}\n`;
                report += `  Part Num   : ${print(stick.partNum)}\n`;
                report += `  Voltage    : ${print(stick.voltageConfigured)}v\n`;
            });
        } else {
            report += 'No DIMM details available.\n';
        }

        // 8. GRAPHICS (GPU & DISPLAYS)
        report += header('GRAPHICS CONTROLLERS (GPU)');
        if (graphics && Array.isArray(graphics.controllers)) {
            graphics.controllers.forEach((gpu, i) => {
                report += `[GPU #${i + 1}]\n`;
                report += `  Model      : ${print(gpu.model)}\n`;
                report += `  Vendor     : ${print(gpu.vendor)}\n`;
                report += `  VRAM       : ${gpu.vram ? formatBytes(gpu.vram * 1024 * 1024) : 'Shared/Dynamic'}\n`;
                report += `  Bus        : ${print(gpu.bus)}\n`;
                report += `  Driver     : ${print(gpu.driverVersion)}\n`;
            });
        }

        report += `\n--- DISPLAYS (MONITORS) ---\n`;
        if (graphics && Array.isArray(graphics.displays)) {
            graphics.displays.forEach((disp, i) => {
                report += `[Display #${i + 1}]\n`;
                report += `  Model      : ${print(disp.model)}\n`;
                report += `  Resolution : ${disp.resolutionX || 'N/A'} x ${disp.resolutionY || 'N/A'}\n`;
                report += `  Refresh    : ${print(disp.currentRefreshRate)} Hz\n`;
                report += `  Connection : ${print(disp.connection)}\n`;
                report += `  Main       : ${disp.main ? 'Yes (Primary)' : 'No'}\n`;
            });
        }

        // 9. STORAGE DEVICES
        report += header('PHYSICAL STORAGE (DISKS)');
        if (Array.isArray(diskLayout) && diskLayout.length) {
            diskLayout.forEach((disk, i) => {
                report += `[Disk #${i + 1}] -> ${print(disk.name)}\n`;
                report += `  Type       : ${print(disk.type)} (${print(disk.interfaceType)})\n`;
                report += `  Size       : ${formatBytes(disk.size)}\n`;
                report += `  Vendor     : ${print(disk.vendor)}\n`;
                report += `  Firmware   : ${print(disk.firmwareRevision)}\n`;
                report += `  Serial     : ${print(disk.serialNum)}\n`;
            });
        }

        // 10. FILE SYSTEMS (VOLUMES)
        report += header('LOGICAL VOLUMES (DRIVES)');
        if (Array.isArray(fsSize) && fsSize.length) {
            fsSize.forEach((fs, i) => {
                report += `[Volume: ${print(fs.fs)}]\n`;
                report += `  Mount Point: ${print(fs.mount)}\n`;
                report += `  Type       : ${print(fs.type)}\n`;
                report += `  Size       : ${formatBytes(fs.size)}\n`;
                report += `  Used       : ${formatBytes(fs.used)} (${fs.use || 'N/A'}%)\n`;
            });
        }

        // 11. NETWORK
        report += header('NETWORK INTERFACES');
        if (Array.isArray(networkInterfaces) && networkInterfaces.length) {
            networkInterfaces.forEach((net, i) => {
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
        }

        // 12. AUDIO
        report += header('AUDIO DEVICES');
        if (Array.isArray(audio) && audio.length) {
            audio.forEach((a, i) => {
                report += `[Device #${i + 1}]\n`;
                report += `  Name       : ${print(a.name)}\n`;
                report += `  Manuf      : ${print(a.manufacturer)}\n`;
                report += `  Status     : ${print(a.status)}\n`;
            });
        }

        // 13. USB DEVICES
        report += header('USB DEVICES');
        if (Array.isArray(usb) && usb.length) {
            usb.forEach((u, i) => {
                report += `[USB #${i + 1}]\n`;
                report += `  Name       : ${print(u.name)}\n`;
                report += `  Type       : ${print(u.type)}\n`;
                report += `  Manuf      : ${print(u.manufacturer)}\n`;
                report += `  Vendor     : ${print(u.vendor)}\n`;
            });
        }

        // 14. BLUETOOTH
        report += header('BLUETOOTH');
        if (Array.isArray(bluetoothDevices) && bluetoothDevices.length) {
            bluetoothDevices.forEach((bt, i) => {
                report += `[Device #${i + 1}]\n`;
                report += `  Name       : ${print(bt.name)}\n`;
                report += `  MAC        : ${print(bt.macDevice)}\n`;
                report += `  Connected  : ${bt.connected ? 'Yes' : 'No'}\n`;
            });
        } else {
            report += "No connected Bluetooth devices found.\n";
        }

        // 15. POWER & BATTERY (New Section)
        report += header('POWER & BATTERY');
        if (battery && battery.hasBattery) {
            report += `Has Battery     : Yes\n`;
            report += `Battery Model   : ${print(battery.model)}\n`;
            report += `Manufacturer    : ${print(battery.manufacturer)}\n`;
            report += `Type            : ${print(battery.type)}\n`;
            report += `Designed Cap    : ${print(battery.designedCapacity)}\n`;
            report += `Max Capacity    : ${print(battery.maxCapacity)}\n`;
            report += `Current Charge  : ${print(battery.percent)}%\n`;
            report += `Cycle Count     : ${print(battery.cycleCount)}\n`;
            report += `Charging        : ${battery.isCharging ? 'Yes' : 'No'}\n`;

            // Calculate wear if both values are available
            if (battery.designedCapacity && battery.maxCapacity) {
                const wear = ((battery.designedCapacity - battery.maxCapacity) / battery.designedCapacity) * 100;
                report += `Health/Wear     : ${wear.toFixed(2)}% (approx)\n`;
            } else {
                report += `Health/Wear     : N/A\n`;
            }
        } else {
            report += `Has Battery     : No\n`;
            report += `Power Source    : AC Adapter (Desktop Mode)\n`;
            report += `Note            : Standard Desktop PSUs do not usually report data to the OS.\n`;
        }

        // OUTPUT TO FILE
        const fileName = 'full_pc_report.txt';
        const filePath = path.join(__dirname, fileName);
        fs.writeFileSync(filePath, report);

        console.log(`\n✅ DONE! Detailed report saved to: ${fileName}`);

    } catch (e) {
        console.error("Error generating report:", e);
    }
}

generateDeepDiveReport();
