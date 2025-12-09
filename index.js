const si = require('systeminformation');
const fs = require('fs');
const path = require('path');

// Helper to convert bytes to Gigabytes (GB)
const toGB = (bytes) => (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';

async function generatePCReport() {
    console.log("Gathering system information... (this may take a second)");

    try {
        // Added 'si.networkInterfaces()' to fetch network devices
        const [cpu, mem, osInfo, system, graphics, diskLayout, baseboard, network] = await Promise.all([
            si.cpu(),
            si.mem(),
            si.osInfo(),
            si.system(),
            si.graphics(),
            si.diskLayout(),
            si.baseboard(),
            si.networkInterfaces()
        ]);

        // Build the text report
        let report = `PC COMPONENT REPORT\n`;
        report += `Generated on: ${new Date().toLocaleString()}\n`;
        report += `==========================================\n\n`;

        // 1. SYSTEM & OS
        report += `[ SYSTEM ]\n`;
        report += `Manufacturer : ${system.manufacturer}\n`;
        report += `Model        : ${system.model}\n`;
        report += `OS           : ${osInfo.distro} ${osInfo.release} (${osInfo.arch})\n`;
        report += `Hostname     : ${osInfo.hostname}\n\n`;

        // 2. MOTHERBOARD
        report += `[ MOTHERBOARD ]\n`;
        report += `Manufacturer : ${baseboard.manufacturer}\n`;
        report += `Model        : ${baseboard.model}\n`;
        report += `Version      : ${baseboard.version}\n`;
        report += `Serial       : ${baseboard.serial}\n\n`;

        // 3. CPU
        report += `[ CPU ]\n`;
        report += `Brand        : ${cpu.manufacturer} ${cpu.brand}\n`;
        report += `Speed        : ${cpu.speed} GHz (Base) / ${cpu.speedMax} GHz (Max)\n`;
        report += `Cores        : ${cpu.physicalCores} Physical / ${cpu.cores} Logical\n`;
        report += `Socket       : ${cpu.socket}\n\n`;

        // 4. MEMORY (RAM)
        report += `[ MEMORY ]\n`;
        report += `Total Size   : ${toGB(mem.total)}\n`;
        report += `Available    : ${toGB(mem.available)}\n`;
        report += `Type         : ${mem.swaptotal > 0 ? 'Detected' : 'Unknown'}\n\n`;

        // 5. GRAPHICS (GPU)
        report += `[ GRAPHICS ]\n`;
        graphics.controllers.forEach((gpu, index) => {
            report += `GPU #${index + 1}      : ${gpu.model}\n`;
            report += `Vendor       : ${gpu.vendor}\n`;
            report += `VRAM         : ${gpu.vram ? gpu.vram + ' MB' : 'Shared/Unknown'}\n`;
            report += `Driver       : ${gpu.driverVersion}\n`;
            report += `-----------------\n`;
        });
        report += `\n`;

        // 6. NETWORK (New Section)
        report += `[ NETWORK ]\n`;
        network.forEach((net, index) => {
            // Only show physical interfaces or active ones usually, but listing all is safer
            report += `Interface    : ${net.ifaceName}\n`;
            report += `Model        : ${net.model || 'Generic/Virtual'}\n`;
            report += `Type         : ${net.type}\n`;
            report += `MAC Address  : ${net.mac}\n`;
            report += `IP Address   : ${net.ip4 || 'Not Connected'}\n`;
            report += `Speed        : ${net.speed ? net.speed + ' Mbit/s' : 'N/A'}\n`;
            report += `-----------------\n`;
        });
        report += `\n`;

        // 7. STORAGE (DISKS)
        report += `[ STORAGE ]\n`;
        diskLayout.forEach((disk, index) => {
            report += `Drive #${index + 1}    : ${disk.name}\n`;
            report += `Type         : ${disk.type} ${disk.interfaceType}\n`;
            report += `Size         : ${toGB(disk.size)}\n`;
            report += `Vendor       : ${disk.vendor}\n`;
            report += `-----------------\n`;
        });

        // Write to file
        const fileName = 'my_pc_specs.txt';
        const filePath = path.join(__dirname, fileName);
        
        fs.writeFileSync(filePath, report);

        console.log(`\nSuccess! Report saved to: ${fileName}`);
        console.log(`Open the file to see your Network Devices and other specs.`);

    } catch (error) {
        console.error("Error gathering system info:", error);
    }
}

generatePCReport();