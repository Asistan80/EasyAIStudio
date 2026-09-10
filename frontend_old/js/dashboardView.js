/* ==========================================================
   Easy AI Studio
   File: frontend/js/dashboardView.js
   Version: 1.0.0
   Sprint: 9 - Dashboard Controller
   ========================================================== */

"use strict";

/* ==========================================================
   Dashboard View
   ========================================================== */

const DashboardView = {

    initialized: false,


    /* ======================================================
       Initialize
       ====================================================== */

    init() {


        if (this.initialized) {

            return;

        }


        this.initialized = true;


        this.registerEvents();


        this.update();


        console.log(

            "Dashboard View Ready"

        );


    },



    /* ======================================================
       Events
       ====================================================== */

    registerEvents() {


        EventBus.on(

            "models.updated",

            () => {

                this.update();

            }

        );



        EventBus.on(

            "agents.updated",

            () => {

                this.update();

            }

        );



        EventBus.on(

            "images.created",

            () => {

                this.update();

            }

        );



        EventBus.on(

            "videos.created",

            () => {

                this.update();

            }

        );


    },



    /* ======================================================
       Update Dashboard
       ====================================================== */

    update() {


        this.setValue(

            "model-count",

            this.getCount(

                ModelManager

            )

        );



        this.setValue(

            "agent-count",

            this.getCount(

                AgentManager

            )

        );



        this.setValue(

            "image-count",

            this.getCount(

                ImageStudio

            )

        );



        this.setValue(

            "video-count",

            this.getCount(

                VideoStudio

            )

        );



    },



    /* ======================================================
       Count Helper
       ====================================================== */

    getCount(manager) {


        if (

            !manager

        ) {

            return 0;

        }



        if (

            typeof manager.all ===

            "function"

        ) {


            return manager.all().length;


        }



        return 0;


    },



    /* ======================================================
       Set Value
       ====================================================== */

    setValue(id, value) {


        const element =

            document.getElementById(

                id

            );



        if (element) {


            element.innerText =

                value;


        }


    },



    /* ======================================================
       Activity
       ====================================================== */

    addActivity(text) {


        const list =

            document.getElementById(

                "activity-list"

            );



        if (!list) {

            return;

        }



        const item =

            document.createElement(

                "div"

            );



        item.className =

            "activity-item";



        item.innerText =

            text;



        list.prepend(

            item

        );


    }


};



/* ==========================================================
   Global
   ========================================================== */

window.DashboardView = DashboardView;