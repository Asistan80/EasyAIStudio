/* ==========================================================
   Easy AI Studio
   File: frontend/js/eventBus.js
   Version: 1.0.0
   Sprint: 9 - Event System
   ========================================================== */

"use strict";


/* ==========================================================
   Event Bus
   ========================================================== */

const EventBus = {


    events: {},





    /* ======================================================
       Subscribe
       ====================================================== */

    on(event, callback) {



        if (

            !this.events[event]

        ) {



            this.events[event] = [];



        }





        this.events[event].push(

            callback

        );



    },







    /* ======================================================
       Emit
       ====================================================== */

    emit(event, data = null) {



        if (

            !this.events[event]

        ) {



            return;



        }






        this.events[event]

        .forEach(

            callback => {



                try {



                    callback(

                        data

                    );



                }



                catch(error) {



                    console.error(

                        "Event Error:",

                        event,

                        error

                    );



                }



            }


        );



    },







    /* ======================================================
       Remove
       ====================================================== */

    off(event, callback) {



        if (

            !this.events[event]

        ) {



            return;



        }





        this.events[event] =

            this.events[event]

            .filter(

                item =>

                item !== callback

            );



    },







    /* ======================================================
       Clear
       ====================================================== */

    clear(event) {



        if (

            event

        ) {



            delete this.events[event];



        }

        else {



            this.events = {};



        }



    },







    /* ======================================================
       Debug
       ====================================================== */

    list() {



        return Object.keys(

            this.events

        );



    }



};





/* ==========================================================
   Global
   ========================================================== */

window.EventBus = EventBus;