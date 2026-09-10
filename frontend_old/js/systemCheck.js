/* ==========================================================
   Easy AI Studio
   File: frontend/js/systemCheck.js
   Version: 1.0.0
   Sprint: 9 - System Check
   ========================================================== */

"use strict";



const SystemCheck = {



    initialized:

        false,



    results: [],





    /* ======================================================
       Start Check
       ====================================================== */

    run() {



        this.results = [];



        this.check(

            "Utils",

            typeof Utils !== "undefined"

        );



        this.check(

            "Storage",

            typeof Storage !== "undefined"

        );



        this.check(

            "EventBus",

            typeof EventBus !== "undefined"

        );



        this.check(

            "Router",

            typeof Router !== "undefined"

        );



        this.check(

            "App",

            typeof App !== "undefined"

        );



        this.checkViews();



        this.show();



        return this.results;



    },







    /* ======================================================
       Check Item
       ====================================================== */

    check(name, status) {



        this.results.push({


            name,


            status


        });


    },







    /* ======================================================
       Check Views
       ====================================================== */

    checkViews() {



        const views = [


            "ChatView",


            "ImageView",


            "VideoView",


            "ModelView",


            "SettingsView",


            "ProviderView",


            "AgentView",


            "WorkflowView",


            "FileView",


            "PluginView",


            "LogView",


            "TaskView",


            "DownloadView"



        ];





        views.forEach(

            view => {



                this.check(

                    view,

                    typeof window[view]

                    !==

                    "undefined"

                );



            }

        );



    },







    /* ======================================================
       Show
       ====================================================== */

    show() {



        console.table(

            this.results

        );





        const failed =

            this.results.filter(

                item =>

                !item.status

            );





        if (

            failed.length === 0

        ) {



            console.log(

                "✅ Easy AI Studio tüm sistemler hazır"

            );



        }

        else {



            console.warn(

                "⚠️ Eksik sistemler:",

                failed

            );



        }



    }





};







window.SystemCheck = SystemCheck;