/*
==========================================================
Easy AI Studio
File    : frontend/js/api/statusApi.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class StatusAPI {

    async getStatus() {

        return await API.get(

            "/status"

        );

    }

    async getSystem() {

        return await API.get(

            "/system"

        );

    }

    async getHealth() {

        const response = await fetch(

            "http://127.0.0.1:8000/health"

        );

        return await response.json();

    }

    async getVersion() {

        const response = await fetch(

            "http://127.0.0.1:8000/version"

        );

        return await response.json();

    }

}

const StatusService = new StatusAPI();

window.StatusAPI = StatusService;