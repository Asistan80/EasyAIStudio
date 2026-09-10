/* ==========================================================
   Easy AI Studio
   File: frontend/js/notification.js
   Version: 1.0.0
   Sprint: 9 - Notification System
   ========================================================== */

"use strict";


/* ==========================================================
   Notification Manager
   ========================================================== */

const Notification = {



    container:

        null,





    /* ======================================================
       Initialize
       ====================================================== */

    init() {


        this.container =

            document.querySelector(

                ".notification-container"

            );



        if (

            !this.container

        ) {



            this.createContainer();



        }


    },







    /* ======================================================
       Create Container
       ====================================================== */

    createContainer() {


        this.container =

            document.createElement(

                "div"

            );



        this.container.className =

            "notification-container";



        document.body.appendChild(

            this.container

        );



    },







    /* ======================================================
       Show
       ====================================================== */

    show(

        message,

        type = "info"

    ) {



        if (

            !this.container

        ) {


            this.init();



        }





        const item =

            document.createElement(

                "div"

            );



        item.className =

            `notification ${type}`;



        item.innerHTML = message;



        this.container.appendChild(

            item

        );





        setTimeout(

            () => {



                item.remove();



            },

            4000

        );



    },







    /* ======================================================
       Success
       ====================================================== */

    success(message) {


        this.show(

            message,

            "success"

        );


    },







    /* ======================================================
       Error
       ====================================================== */

    error(message) {


        this.show(

            message,

            "error"

        );


    },







    /* ======================================================
       Warning
       ====================================================== */

    warning(message) {


        this.show(

            message,

            "warning"

        );


    },







    /* ======================================================
       Info
       ====================================================== */

    info(message) {


        this.show(

            message,

            "info"

        );


    }



};







/* ==========================================================
   Global
   ========================================================== */

window.Notification = Notification;