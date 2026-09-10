/* ==========================================================
   Easy AI Studio
   File: frontend/js/errorHandler.js
   Version: 1.0.0
   Sprint: 9 - Error Handler
   ========================================================== */

"use strict";



/* ==========================================================
   Error Handler
   ========================================================== */

const ErrorHandler = {



    errors: [],





    /* ======================================================
       Initialize
       ====================================================== */

    init() {



        window.onerror =

            (

                message,

                source,

                line,

                column,

                error

            ) => {



                this.capture({

                    message,

                    source,

                    line,

                    column,

                    error

                });



            };





        window.onunhandledrejection =

            event => {



                this.capture({

                    message:

                        event.reason

                        ?.message

                        ||

                        event.reason



                });



            };



        console.log(

            "Error Handler Ready"

        );



    },







    /* ======================================================
       Capture
       ====================================================== */

    capture(error) {



        const item = {



            id:

                Utils.uuid(),



            message:

                error.message

                ||

                "Unknown Error",



            source:

                error.source

                ||

                "",



            line:

                error.line

                ||

                0,



            time:

                new Date()



        };



        this.errors.push(

            item

        );





        if (

            typeof EventBus !==

            "undefined"

        ) {



            EventBus.emit(

                "log",

                {

                    type:

                        "error",


                    message:

                        item.message


                }

            );



        }





        if (

            typeof Notification !==

            "undefined"

        ) {



            Notification.error(

                item.message

            );


        }





        console.error(

            item

        );



    },







    /* ======================================================
       Get Errors
       ====================================================== */

    all() {


        return this.errors;


    },







    /* ======================================================
       Clear
       ====================================================== */

    clear() {


        this.errors = [];


    }



};







/* ==========================================================
   Global
   ========================================================== */

window.ErrorHandler = ErrorHandler;