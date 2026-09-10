/* ==========================================================
   Easy AI Studio
   File: frontend/js/settingsView.js
   Version: 1.0.0
   Sprint: 9 - Settings Controller
   ========================================================== */

"use strict";

/* ==========================================================
   Settings View
   ========================================================== */

const SettingsView = {

    initialized: false,

    settings: {},



    /* ======================================================
       Initialize
       ====================================================== */

    init() {


        if (this.initialized) {

            return;

        }


        this.initialized = true;


        this.load();


        this.bindEvents();


        console.log(

            "Settings View Ready"

        );


    },



    /* ======================================================
       Load Settings
       ====================================================== */

    load() {


        this.settings =

            Storage.get(

                "settings",

                {

                    theme:

                        "dark",

                    model:

                        "auto",

                    token:

                        2048,

                    api:

                        ""

                }

            );



        this.apply();


    },



    /* ======================================================
       Apply Values
       ====================================================== */

    apply() {



        const theme =

            document.getElementById(

                "theme-select"

            );



        if (theme) {


            theme.value =

                this.settings.theme;


        }





        const token =

            document.getElementById(

                "max-token"

            );



        if (token) {


            token.value =

                this.settings.token;


        }





        const api =

            document.getElementById(

                "api-key"

            );



        if (api) {


            api.value =

                this.settings.api;


        }



    },



    /* ======================================================
       Events
       ====================================================== */

    bindEvents() {


        const save =

            document.getElementById(

                "save-settings"

            );



        if (save) {


            save.onclick = () => {


                this.save();


            };


        }





        const theme =

            document.getElementById(

                "theme-select"

            );



        if (theme) {


            theme.onchange = () => {


                this.changeTheme(

                    theme.value

                );


            };


        }



    },



    /* ======================================================
       Save
       ====================================================== */

    save() {



        this.settings = {


            theme:

                document.getElementById(

                    "theme-select"

                ).value,



            model:

                document.getElementById(

                    "default-model"

                ).value,



            token:

                Number(

                    document.getElementById(

                        "max-token"

                    ).value

                ),



            api:

                document.getElementById(

                    "api-key"

                ).value



        };



        Storage.set(

            "settings",

            this.settings

        );



        Notification.show(

            "Ayarlar kaydedildi",

            "success"

        );


        EventBus.emit(

            "settings.changed",

            this.settings

        );


    },



    /* ======================================================
       Theme
       ====================================================== */

    changeTheme(theme) {


        this.settings.theme =

            theme;



        EventBus.emit(

            "theme.changed",

            theme

        );


    },



    /* ======================================================
       Get
       ====================================================== */

    get() {


        return this.settings;


    }



};


/* ==========================================================
   Global
   ========================================================== */

window.SettingsView = SettingsView;