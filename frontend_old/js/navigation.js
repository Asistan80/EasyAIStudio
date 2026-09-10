/* ==========================================================
   Easy AI Studio
   File: frontend/js/navigation.js
   Version: 1.0.0
   Sprint: 8 - Navigation System
   ========================================================== */

"use strict";

/* ==========================================================
   Navigation
   ========================================================== */

const Navigation = {

    initialized: false,

    history: [],

    current: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        this.registerEvents();

        console.log(

            "Navigation Ready"

        );

    },


    /* ======================================================
       Events
       ====================================================== */

    registerEvents() {


        EventBus.on(

            "router.changed",

            page => {


                this.current = page;


                this.history.push(

                    page

                );


            }

        );


    },


    /* ======================================================
       Navigate
       ====================================================== */

    go(page) {


        if (

            Router

        ) {


            Router.open(

                page

            );


        }


    },


    /* ======================================================
       Back
       ====================================================== */

    back() {


        if (

            this.history.length < 2

        ) {

            return;

        }


        this.history.pop();


        const previous =

            this.history[

                this.history.length - 1

            ];


        Router.open(

            previous

        );


    },


    /* ======================================================
       Home
       ====================================================== */

    home() {


        Router.open(

            "welcome"

        );


    },


    /* ======================================================
       Current
       ====================================================== */

    getCurrent() {

        return this.current;

    },


    /* ======================================================
       History
       ====================================================== */

    getHistory() {

        return this.history;

    }

};


/* ==========================================================
   Global
   ========================================================== */

window.Navigation = Navigation;