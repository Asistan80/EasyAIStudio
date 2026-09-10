/*
==========================================================
Easy AI Studio
File    : frontend/js/core/settings.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class SettingsManager {

    constructor() {

        this.settings = {};

    }

    async initialize() {

        await this.load();

    }

    async load() {

        try {

            this.settings =

                await SettingsAPI.getSettings();

        }

        catch (error) {

            console.error(

                "Settings Load Error",

                error

            );

            this.settings = {};

        }

        return this.settings;

    }

    async save() {

        try {

            await SettingsAPI.saveSettings(

                this.settings

            );

            return true;

        }

        catch (error) {

            console.error(

                "Settings Save Error",

                error

            );

            return false;

        }

    }

    async update(

        key,

        value

    ) {

        this.settings[key] = value;

        try {

            await SettingsAPI.updateSettings(

                {

                    [key]: value

                }

            );

            return true;

        }

        catch (error) {

            console.error(

                "Settings Update Error",

                error

            );

            return false;

        }

    }

    get(

        key,

        defaultValue = null

    ) {

        if (

            key in this.settings

        ) {

            return this.settings[key];

        }

        return defaultValue;

    }

    set(

        key,

        value

    ) {

        this.settings[key] = value;

    }

    has(

        key

    ) {

        return key in this.settings;

    }

    async reset() {

        try {

            await SettingsAPI.resetSettings();

            this.settings = {};

            return true;

        }

        catch (error) {

            console.error(

                "Settings Reset Error",

                error

            );

            return false;

        }

    }

    all() {

        return this.settings;

    }

}

const SettingsService =

    new SettingsManager();

window.Settings =

    SettingsService;