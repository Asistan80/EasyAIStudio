/*
==========================================================
Easy AI Studio
File    : frontend/js/core/bootstrap.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class Bootstrap {

    constructor() {

        this.initialized = false;

    }

    async initialize() {

        Logger.info(

            "Bootstrap started."

        );

        await Settings.initialize();

        await Theme.initialize();

        Router.initialize();

        Notifications.initialize();

        await Backend.initialize();

        await Dashboard.initialize();

        LiveUpdater.start();

        this.registerEvents();

        this.initialized = true;

        Logger.info(

            "Bootstrap completed."

        );

        return true;

    }

    registerEvents() {

        window.addEventListener(

            "beforeunload",

            () => {

                LiveUpdater.stop();

            }

        );

        document.addEventListener(

            "visibilitychange",

            () => {

                if (

                    document.hidden

                ) {

                    LiveUpdater.stop();

                }

                else {

                    LiveUpdater.start();

                }

            }

        );

    }

    isInitialized() {

        return this.initialized;

    }

    async restart() {

        LiveUpdater.stop();

        this.initialized = false;

        return await this.initialize();

    }

}

const BootstrapService =

    new Bootstrap();

window.Bootstrap =

    BootstrapService;

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await BootstrapService.initialize();

    }

);