/* ==========================================================
   Easy AI Studio
   File: frontend/js/shortcutManager.js
   Version: 1.0.0
   Sprint: 9 - Shortcut Manager
   ========================================================== */

"use strict";



/* ==========================================================
   Shortcut Manager
   ========================================================== */

const ShortcutManager = {



    shortcuts: [],







    /* ======================================================
       Initialize
       ====================================================== */

    init() {



        this.registerDefaults();



        this.listen();



        console.log(

            "Shortcut Manager Ready"

        );



    },







    /* ======================================================
       Register
       ====================================================== */

    register(

        key,

        callback

    ) {



        this.shortcuts.push({


            key,


            callback


        });


    },







    /* ======================================================
       Default Shortcuts
       ====================================================== */

    registerDefaults() {



        this.register(

            "CTRL+K",

            () => {



                EventBus.emit(

                    "search.open"

                );



            }

        );





        this.register(

            "CTRL+S",

            () => {



                if (

                    typeof ProjectManager

                    !==

                    "undefined"

                ) {



                    ProjectManager.saveCurrent();



                    Notification.success(

                        "Proje kaydedildi"

                    );


                }



            }

        );







        this.register(

            "ESC",

            () => {



                EventBus.emit(

                    "modal.close"

                );



            }

        );







        this.register(

            "CTRL+/",

            () => {



                EventBus.emit(

                    "help.open"

                );



            }

        );



    },







    /* ======================================================
       Listener
       ====================================================== */

    listen() {



        document.addEventListener(

            "keydown",

            event => {



                let key = "";





                if (

                    event.ctrlKey

                ) {



                    key +=

                        "CTRL+";


                }







                key +=

                    event.key

                    .toUpperCase();





                this.shortcuts.forEach(

                    item => {



                        if (

                            item.key === key

                        ) {



                            event.preventDefault();



                            item.callback();



                        }



                    }

                );



            }

        );



    }






};







/* ==========================================================
   Global
   ========================================================== */

window.ShortcutManager = ShortcutManager;