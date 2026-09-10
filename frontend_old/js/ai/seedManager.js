/*
==========================================================
Easy AI Studio
File    : frontend/js/ai/seedManager.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class SeedManager {

    constructor() {

        this.currentSeed = null;

        this.history = [];

        this.autoRandom = true;

    }

    generate() {

        this.currentSeed =

            Math.floor(

                Math.random() *

                Number.MAX_SAFE_INTEGER

            );

        this.history.push(

            this.currentSeed

        );

        EventBus.emit(

            "seed:generated",

            this.currentSeed

        );

        return this.currentSeed;

    }

    set(

        seed

    ) {

        this.currentSeed =

            Number(

                seed

            );

        this.history.push(

            this.currentSeed

        );

        EventBus.emit(

            "seed:changed",

            this.currentSeed

        );

    }

    current() {

        return this.currentSeed;

    }

    latest() {

        return this.currentSeed;

    }

    previous() {

        if (

            this.history.length < 2

        ) {

            return null;

        }

        return this.history[

            this.history.length - 2

        ];

    }

    historyList() {

        return this.history;

    }

    enableRandom() {

        this.autoRandom = true;

    }

    disableRandom() {

        this.autoRandom = false;

    }

    isRandom() {

        return this.autoRandom;

    }

    clearHistory() {

        this.history = [];

    }

}

const SeedManagerService =

    new SeedManager();

window.SeedManager =

    SeedManagerService;