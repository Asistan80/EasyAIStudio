/* ==========================================================
   Easy AI Studio
   File: frontend/js/themeManager.js
   Version: 1.0.0
   Sprint: 9 - Theme Manager
   ========================================================== */

"use strict";



/* ==========================================================
   Theme Manager
   ========================================================== */

const ThemeManager = {



    current:

        "dark",







    /* ======================================================
       Initialize
       ====================================================== */

    init() {



        const saved =

            Storage.get(

                "theme",

                null

            );



        if (

            saved

        ) {



            this.set(

                saved

            );


        }

        else {



            this.set(

                "dark"

            );


        }



        console.log(

            "Theme Manager Ready"

        );


    },







    /* ======================================================
       Set Theme
       ====================================================== */

    set(theme) {



        this.current =

            theme;



        document.documentElement

        .setAttribute(

            "data-theme",

            theme

        );



        Storage.set(

            "theme",

            theme

        );





        EventBus.emit(

            "theme.changed",

            theme

        );



    },







    /* ======================================================
       Toggle
       ====================================================== */

    toggle() {



        if (

            this.current === "dark"

        ) {



            this.set(

                "light"

            );


        }

        else {



            this.set(

                "dark"

            );


        }



    },







    /* ======================================================
       Get
       ====================================================== */

    get() {


        return this.current;


    }



};







/* ==========================================================
   Global
   ========================================================== */

window.ThemeManager = ThemeManager;