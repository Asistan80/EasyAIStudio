/* ==========================================================
   Easy AI Studio
   File: frontend/js/utils.js
   Version: 1.0.0
   Sprint: 9 - Utility System
   ========================================================== */

"use strict";


/* ==========================================================
   Utils
   ========================================================== */

const Utils = {



    /* ======================================================
       UUID Generator
       ====================================================== */

    uuid() {


        return (

            "xxxx-xxxx-4xxx-yxxx"

            .replace(

                /[xy]/g,

                function(c) {


                    const r =

                        Math.random()

                        *

                        16

                        |

                        0;



                    const v =

                        c === "x"

                        ?

                        r

                        :

                        (

                            r

                            &

                            0x3

                        )

                        |

                        0x8;



                    return v.toString(

                        16

                    );


                }

            )

        );


    },





    /* ======================================================
       Date Format
       ====================================================== */

    date(date) {


        if (

            !date

        ) {


            date =

                new Date();


        }



        return new Date(

            date

        )

        .toLocaleString(

            "tr-TR"

        );


    },





    /* ======================================================
       Sleep
       ====================================================== */

    sleep(ms) {


        return new Promise(

            resolve =>

            setTimeout(

                resolve,

                ms

            )

        );


    },





    /* ======================================================
       File Size
       ====================================================== */

    fileSize(size) {


        if (

            size < 1024

        ) {


            return size +

                " B";


        }



        if (

            size <

            1024 *

            1024

        ) {


            return (

                size /

                1024

            )

            .toFixed(

                1

            )

            +

            " KB";


        }





        return (

            size /

            (

                1024 *

                1024

            )

        )

        .toFixed(

            1

        )

        +

        " MB";


    },





    /* ======================================================
       Text Shorten
       ====================================================== */

    shorten(text, length = 50) {


        if (

            !text

        ) {


            return "";


        }





        if (

            text.length <= length

        ) {


            return text;


        }



        return (

            text.substring(

                0,

                length

            )

            +

            "..."

        );


    },





    /* ======================================================
       Deep Clone
       ====================================================== */

    clone(data) {


        return JSON.parse(

            JSON.stringify(

                data

            )

        );


    }





};





/* ==========================================================
   Global
   ========================================================== */

window.Utils = Utils;