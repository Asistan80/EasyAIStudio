/* ==========================================================
   Easy AI Studio
   File: frontend/js/storage.js
   Version: 1.0.0
   Sprint: 9 - Storage System
   ========================================================== */

"use strict";


/* ==========================================================
   Storage Manager
   ========================================================== */

const Storage = {



    prefix:

        "easy_ai_",





    /* ======================================================
       Set Data
       ====================================================== */

    set(key, value) {


        try {


            localStorage.setItem(


                this.prefix + key,


                JSON.stringify(

                    value

                )


            );



            return true;


        }


        catch(error) {


            console.error(

                "Storage Save Error:",

                error

            );



            return false;


        }


    },







    /* ======================================================
       Get Data
       ====================================================== */

    get(key, defaultValue = null) {


        try {


            const data =

                localStorage.getItem(


                    this.prefix + key


                );



            if (

                !data

            ) {


                return defaultValue;


            }





            return JSON.parse(

                data

            );


        }



        catch(error) {


            console.error(

                "Storage Read Error:",

                error

            );



            return defaultValue;


        }


    },







    /* ======================================================
       Remove
       ====================================================== */

    remove(key) {



        localStorage.removeItem(


            this.prefix + key


        );


    },







    /* ======================================================
       Clear
       ====================================================== */

    clear() {



        const keys =

            Object.keys(

                localStorage

            );



        keys.forEach(

            key => {



                if (

                    key.startsWith(

                        this.prefix

                    )

                ) {



                    localStorage.removeItem(

                        key

                    );


                }


            }


        );



    },







    /* ======================================================
       Has
       ====================================================== */

    has(key) {


        return (

            localStorage.getItem(

                this.prefix + key

            )

            !==

            null

        );


    }






};





/* ==========================================================
   Global
   ========================================================== */

window.Storage = Storage;