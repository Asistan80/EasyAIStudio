/* ==========================================================
   Easy AI Studio
   File: frontend/js/app.js
   Version: 1.0.0
   Sprint: 9 - Application Core
   ========================================================== */

"use strict";


/* ==========================================================
   Easy AI Studio Application
   ========================================================== */

const App = {


    initialized:

        false,



    /* ======================================================
       Start
       ====================================================== */

    start() {



        if (

            this.initialized

        ) {


            return;


        }





        this.initialized =

            true;





        this.bindNavigation();



        this.initializeSystems();

        ProjectManager.init();

        HistoryManager.init();

        ThemeManager.init();

        ShortcutManager.init();
       
        SystemCheck.run();

        Notification.init();

        ErrorHandler.init();

        Router.go(

            "dashboard"

        );



        console.log(

            "Easy AI Studio Started"

        );



    },



    /* ======================================================
       Navigation
       ====================================================== */

    bindNavigation() {



        document

        .addEventListener(

            "click",

            event => {



                const target =

                    event.target.closest(

                        "[data-page]"

                    );



                if (!target) {


                    return;


                }





                event.preventDefault();





                const page =

                    target.dataset.page;



                Router.go(

                    page

                );



            }

        );



    },



    /* ======================================================
       Systems
       ====================================================== */

    initializeSystems() {



        if (

            typeof EventBus !==

            "undefined"

        ) {


            console.log(

                "Event System Ready"

            );


        }





        if (

            typeof Storage !==

            "undefined"

        ) {


            console.log(

                "Storage Ready"

            );


        }





        if (

            typeof Utils !==

            "undefined"

        ) {


            console.log(

                "Utils Ready"

            );


        }



    },



    /* ======================================================
       Shutdown
       ====================================================== */

    stop() {


        this.initialized =

            false;



        console.log(

            "Easy AI Studio Stopped"

        );


    }



};





/* ==========================================================
   Start Application
   ========================================================== */

window.addEventListener(

    "DOMContentLoaded",

    () => {


        App.start();


    }

);



/* ==========================================================
   Global
   ========================================================== */

window.App = App;