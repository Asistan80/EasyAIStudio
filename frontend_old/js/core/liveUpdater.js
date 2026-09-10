/*
==========================================================
Easy AI Studio
File    : frontend/js/core/liveUpdater.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class LiveUpdater {

    constructor() {

        this.interval = 5000;

        this.timer = null;

        this.running = false;

    }

    async update() {

        if (

            !Backend.isConnected()

        ) {

            return;

        }

        try {

            await Dashboard.refresh();

        }

        catch (error) {

            console.error(

                "Live Update Error",

                error

            );

        }

    }

    start() {

        if (

            this.running

        ) {

            return;

        }

        this.running = true;

        this.update();

        this.timer = setInterval(

            () => {

                this.update();

            },

            this.interval

        );

    }

    stop() {

        if (

            this.timer

        ) {

            clearInterval(

                this.timer

            );

        }

        this.timer = null;

        this.running = false;

    }

    restart() {

        this.stop();

        this.start();

    }

    setIntervalTime(

        milliseconds

    ) {

        this.interval = milliseconds;

        if (

            this.running

        ) {

            this.restart();

        }

    }

    isRunning() {

        return this.running;

    }

    getInterval() {

        return this.interval;

    }

}

const LiveUpdateService = new LiveUpdater();

window.LiveUpdater = LiveUpdateService;