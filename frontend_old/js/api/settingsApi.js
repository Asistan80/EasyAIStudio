/*
==========================================================
Easy AI Studio
File    : frontend/js/api/settingsApi.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class SettingsAPI {

    async getSettings() {

        return await API.get(

            "/settings"

        );

    }

    async saveSettings(

        settings

    ) {

        return await API.post(

            "/settings",

            settings

        );

    }

    async updateSettings(

        settings

    ) {

        return await API.put(

            "/settings",

            settings

        );

    }

    async resetSettings() {

        return await API.delete(

            "/settings"

        );

    }

}

const SettingsService = new SettingsAPI();

window.SettingsAPI = SettingsService;