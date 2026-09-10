/*
==========================================================
Easy AI Studio
File    : frontend/js/core/theme.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class ThemeManager {

    constructor() {

        this.current = "dark";

    }

    async initialize() {

        try {

            const settings =

                await SettingsAPI.getSettings();

            if (

                settings.theme

            ) {

                this.current =

                    settings.theme;

            }

        }

        catch (error) {

            console.warn(

                "Theme settings not found."

            );

        }

        this.apply();

    }

    apply() {

        document.documentElement.setAttribute(

            "data-theme",

            this.current

        );

    }

    async set(

        theme

    ) {

        this.current = theme;

        this.apply();

        try {

            await SettingsAPI.updateSettings(

                {

                    theme: theme

                }

            );

        }

        catch (error) {

            console.error(

                error

            );

        }

    }

    async toggle() {

        if (

            this.current === "dark"

        ) {

            await this.set(

                "light"

            );

        }

        else {

            await this.set(

                "dark"

            );

        }

    }

    isDark() {

        return this.current === "dark";

    }

    isLight() {

        return this.current === "light";

    }

    getTheme() {

        return this.current;

    }

}

const ThemeService =

    new ThemeManager();

window.Theme =

    ThemeService;