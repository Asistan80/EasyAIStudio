/* ==========================================================
   Easy AI Studio
   File: frontend/js/terminalPage.js
   Version: 1.0.0
   Sprint: 7 - Terminal Page
   ========================================================== */

"use strict";

/* ==========================================================
   Terminal Page
   ========================================================== */

const TerminalPage = {

    initialized: false,

    history: [],

    currentDirectory: "/",

    prompt: "$",

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        console.log(

            "Terminal Page Ready"

        );

    },

    /* ======================================================
       Execute Command
       ====================================================== */

    execute(command) {

        if (!command) {

            return;

        }

        this.history.push({

            command,

            time: Utils.now()

        });

        EventBus.emit(

            "terminal.execute",

            command

        );

    },

    /* ======================================================
       Change Directory
       ====================================================== */

    cd(path) {

        this.currentDirectory =

            path;

        EventBus.emit(

            "terminal.cd",

            path

        );

    },

    /* ======================================================
       Clear Terminal
       ====================================================== */

    clear() {

        this.history = [];

        EventBus.emit(

            "terminal.clear"

        );

    },

    /* ======================================================
       Set Prompt
       ====================================================== */

    setPrompt(prompt) {

        this.prompt = prompt;

    },

    /* ======================================================
       Get Prompt
       ====================================================== */

    getPrompt() {

        return this.prompt;

    },

    /* ======================================================
       Command History
       ====================================================== */

    getHistory() {

        return this.history;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.TerminalPage = TerminalPage;