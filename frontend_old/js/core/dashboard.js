/*
==========================================================
Easy AI Studio
File    : frontend/js/core/dashboard.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class Dashboard {

    constructor() {

        this.data = null;

    }

    async initialize() {

        if (

            !Backend.isConnected()

        ) {

            return false;

        }

        await this.refresh();

        return true;

    }

    async refresh() {

        try {

            this.data = await SystemAPI.getStatus();

            this.render();

            return true;

        }

        catch (error) {

            console.error(

                error

            );

            return false;

        }

    }

    render() {

        this.renderVersion();

        this.renderPlatform();

        this.renderCPU();

        this.renderMemory();

        this.renderDisk();

    }

    renderVersion() {

        const element = document.getElementById(

            "dashboard-version"

        );

        if (!element) return;

        element.textContent =

            Backend.getVersion();

    }

    renderPlatform() {

        const element = document.getElementById(

            "dashboard-platform"

        );

        if (!element) return;

        element.textContent =

            this.data.system.platform;

    }

    renderCPU() {

        const element = document.getElementById(

            "dashboard-cpu"

        );

        if (!element) return;

        element.textContent =

            this.data.system.cpu.usage + "%";

    }

    renderMemory() {

        const element = document.getElementById(

            "dashboard-memory"

        );

        if (!element) return;

        element.textContent =

            this.data.system.memory.percent + "%";

    }

    renderDisk() {

        const element = document.getElementById(

            "dashboard-disk"

        );

        if (!element) return;

        element.textContent =

            this.data.system.disk.percent + "%";

    }

    getData() {

        return this.data;

    }

}

const DashboardService = new Dashboard();

window.Dashboard = DashboardService;