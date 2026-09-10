/*
==========================================================
Easy AI Studio
File    : frontend/js/core/backend.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class Backend {

    constructor() {

        this.connected = false;

        this.version = "";

        this.system = null;

    }

    async initialize() {

        try {

            const health = await StatusAPI.getHealth();

            if (health.success) {

                this.connected = true;

            }

            const version = await StatusAPI.getVersion();

            this.version = version.version;

            this.system = await SystemAPI.getSystem();

            console.log(

                "Backend Connected"

            );

            console.log(

                this.system

            );

            return true;

        }

        catch (error) {

            console.error(

                "Backend Connection Failed",

                error

            );

            this.connected = false;

            return false;

        }

    }

    isConnected() {

        return this.connected;

    }

    getVersion() {

        return this.version;

    }

    async refresh() {

        this.system = await SystemAPI.getSystem();

        return this.system;

    }

    getSystem() {

        return this.system;

    }

    async ping() {

        return await SystemAPI.ping();

    }

}

const BackendService = new Backend();

window.Backend = BackendService;