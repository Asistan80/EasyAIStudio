/*
==========================================================
Easy AI Studio
File    : frontend/js/main.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

(() => {

    "use strict";

    class Main {

        constructor() {

            this.started = false;

        }

        async start() {

            if (

                this.started

            ) {

                return;

            }

            Logger.info(

                "Easy AI Studio starting..."

            );

            try {

                await Bootstrap.initialize();

                this.registerGlobalEvents();

                this.started = true;

                Logger.info(

                    "Easy AI Studio ready."

                );

            }

            catch (error) {

                Logger.error(

                    "Application startup failed.",

                    error

                );

                if (

                    typeof Notifications !==

                    "undefined"

                ) {

                    Notifications.error(

                        "Application failed to start."

                    );

                }

            }

        }

        registerGlobalEvents() {

            window.addEventListener(

                "online",

                () => {

                    Logger.info(

                        "Network connected."

                    );

                    EventBus.emit(

                        "network:online"

                    );

                }

            );

            window.addEventListener(

                "offline",

                () => {

                    Logger.warning(

                        "Network disconnected."

                    );

                    EventBus.emit(

                        "network:offline"

                    );

                }

            );

            window.addEventListener(

                "error",

                event => {

                    Logger.error(

                        event.message,

                        event.error

                    );

                }

            );

            window.addEventListener(

                "unhandledrejection",

                event => {

                    Logger.error(

                        "Unhandled Promise Rejection",

                        event.reason

                    );

                }

            );

        }

        isRunning() {

            return this.started;

        }

    }

    const MainApplication =

        new Main();

    window.Main =

        MainApplication;

    document.addEventListener(

        "DOMContentLoaded",

        async () => {

            await MainApplication.start();

        }

    );

})();