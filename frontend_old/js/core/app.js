/*
==========================================================
Easy AI Studio
File    : frontend/js/core/app.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class App {

    constructor() {

        this.initialized = false;

    }

    async initialize() {

        console.log(

            "Easy AI Studio Starting..."

        );

        const connected = await Backend.initialize();

        if (!connected) {

            console.error(

                "Backend connection failed."

            );

            return false;

        }

        await Dashboard.initialize();

        if (

            typeof Router !== "undefined"

        ) {

            Router.go(

                "dashboard"

            );

        }

        this.initialized = true;

        console.log(

            "Easy AI Studio Ready."

        );

        return true;

    }

    isInitialized() {

        return this.initialized;

    }

    async reload() {

        this.initialized = false;

        return await this.initialize();

    }

}

const EasyAIStudio = new App();

window.App = EasyAIStudio;


document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await EasyAIStudio.initialize();

    }

);