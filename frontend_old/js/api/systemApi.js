/*
==========================================================
Easy AI Studio
File    : frontend/js/api/systemApi.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class SystemAPI {

    async getSystem() {

        return await API.get(

            "/system"

        );

    }

    async getEnvironment() {

        return await API.get(

            "/system/environment"

        );

    }

    async getDirectories() {

        return await API.get(

            "/system/directories"

        );

    }

    async ping() {

        return await API.get(

            "/system/ping"

        );

    }

    async getStatus() {

        const system = await this.getSystem();

        const environment = await this.getEnvironment();

        const directories = await this.getDirectories();

        return {

            system,

            environment,

            directories

        };

    }

}

const SystemService = new SystemAPI();

window.SystemAPI = SystemService;