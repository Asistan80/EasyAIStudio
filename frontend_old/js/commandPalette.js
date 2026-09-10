/* ==========================================================
   Easy AI Studio
   File: frontend/js/commandPalette.js
   Version: 1.0.0
   Sprint: 5 - Command Palette
   ========================================================== */

"use strict";

/* ==========================================================
   Command Palette
   ========================================================== */

const CommandPalette = {

    commands: [],

    visible: false,

    root: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.root = document.getElementById(

            "overlay-root"

        );

        this.registerDefaults();

        this.bindEvents();

        console.log(

            "Command Palette Ready"

        );

    },

    /* ======================================================
       Default Commands
       ====================================================== */

    registerDefaults() {

        this.add({

            id: "dashboard",

            title: "Open Dashboard",

            action() {

                Router.open(

                    "dashboard"

                );

            }

        });

        this.add({

            id: "projects",

            title: "Open Projects",

            action() {

                Router.open(

                    "projects"

                );

            }

        });

        this.add({

            id: "settings",

            title: "Open Settings",

            action() {

                Router.open(

                    "settings"

                );

            }

        });

    },

    /* ======================================================
       Events
       ====================================================== */

    bindEvents() {

        document.addEventListener(

            "keydown",

            event => {

                if (

                    event.ctrlKey &&

                    event.key.toLowerCase() === "k"

                ) {

                    event.preventDefault();

                    this.toggle();

                }

            }

        );

    },

    /* ======================================================
       Add Command
       ====================================================== */

    add(command) {

        this.commands.push(command);

    },

    /* ======================================================
       Toggle
       ====================================================== */

    toggle() {

        if (this.visible) {

            this.close();

        } else {

            this.open();

        }

    },

    /* ======================================================
       Open
       ====================================================== */

    open() {

        this.visible = true;

        console.log(

            "Command Palette Open"

        );

    },

    /* ======================================================
       Close
       ====================================================== */

    close() {

        this.visible = false;

        console.log(

            "Command Palette Close"

        );

    },

    /* ======================================================
       Execute
       ====================================================== */

    execute(id) {

        const command = this.commands.find(

            item => item.id === id

        );

        if (

            command &&

            typeof command.action ===

            "function"

        ) {

            command.action();

        }

    },

    /* ======================================================
       Search
       ====================================================== */

    search(keyword) {

        keyword = keyword

            .trim()

            .toLowerCase();

        return this.commands.filter(

            command =>

            command.title

                .toLowerCase()

                .includes(keyword)

        );

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.CommandPalette = CommandPalette;