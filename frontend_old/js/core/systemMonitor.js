/*
==========================================================
Easy AI Studio
File    : frontend/js/core/systemMonitor.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class SystemMonitor {

    constructor() {

        this.status = {

            backend: false,

            cpu: 0,

            memory: 0,

            disk: 0,

            platform: "",

            version: ""

        };

    }

    async refresh() {

        try {

            const data = await SystemAPI.getSystem();

            this.status.backend = true;

            this.status.cpu = data.cpu.usage;

            this.status.memory = data.memory.percent;

            this.status.disk = data.disk.percent;

            this.status.platform = data.platform;

            this.status.version = Backend.getVersion();

            return this.status;

        }

        catch (error) {

            this.status.backend = false;

            console.error(

                "System Monitor Error",

                error

            );

            return this.status;

        }

    }

    async isOnline() {

        try {

            const result = await SystemAPI.ping();

            return result.success === true;

        }

        catch {

            return false;

        }

    }

    getCPU() {

        return this.status.cpu;

    }

    getMemory() {

        return this.status.memory;

    }

    getDisk() {

        return this.status.disk;

    }

    getPlatform() {

        return this.status.platform;

    }

    getVersion() {

        return this.status.version;

    }

    getStatus() {

        return this.status;

    }

}

const MonitorService = new SystemMonitor();

window.SystemMonitor = MonitorService;