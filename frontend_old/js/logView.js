/* ==========================================================
   Easy AI Studio
   File: frontend/js/logView.js
   Version: 1.0.0
   Sprint: 9 - Log Controller
   ========================================================== */

"use strict";

/* ==========================================================
   Log View
   ========================================================== */

const LogView = {

    initialized: false,

    logs: [],



    /* ======================================================
       Initialize
       ====================================================== */

    init() {


        if (this.initialized) {

            return;

        }


        this.initialized = true;


        this.bindEvents();


        this.listen();


        this.load();



        console.log(

            "Log View Ready"

        );


    },



    /* ======================================================
       Events
       ====================================================== */

    bindEvents() {


        const clear =

            document.getElementById(

                "clear-logs"

            );



        if (clear) {


            clear.onclick = () => {


                this.clear();


            };


        }



    },



    /* ======================================================
       Listen Events
       ====================================================== */

    listen() {


        EventBus.on(

            "log",

            data => {


                this.add(

                    data.type,

                    data.message

                );


            }

        );



        EventBus.on(

            "images.created",

            () => {


                this.add(

                    "info",

                    "Yeni görsel oluşturma isteği"

                );


            }

        );



        EventBus.on(

            "videos.created",

            () => {


                this.add(

                    "info",

                    "Yeni video oluşturma isteği"

                );


            }

        );



        EventBus.on(

            "agents.updated",

            () => {


                this.add(

                    "info",

                    "Agent listesi güncellendi"

                );


            }

        );


    },



    /* ======================================================
       Load
       ====================================================== */

    load() {


        this.render();


    },



    /* ======================================================
       Add Log
       ====================================================== */

    add(type, message) {


        const log = {


            id:

                Utils.uuid(),


            type,

            message,


            time:

                new Date()


        };



        this.logs.unshift(

            log

        );



        this.render();



    },



    /* ======================================================
       Render
       ====================================================== */

    render() {


        const container =

            document.getElementById(

                "logs-list"

            );



        if (!container) {

            return;

        }





        if (

            this.logs.length === 0

        ) {


            container.innerHTML = `

                <div class="empty-logs">

                    Henüz kayıt yok

                </div>

            `;


            return;


        }






        container.innerHTML = "";





        this.logs.forEach(

            log => {



                const item =

                    document.createElement(

                        "div"

                    );



                item.className =

                    "log-item";



                item.innerHTML = `



                    <div class="log-time">

                        ${

                            log.time

                            .toLocaleTimeString()

                        }

                    </div>



                    <div class="log-message log-${log.type}">

                        ${log.message}

                    </div>



                `;



                container.appendChild(

                    item

                );



            }

        );


    },



    /* ======================================================
       Clear
       ====================================================== */

    clear() {


        this.logs = [];


        this.render();


    },



    /* ======================================================
       All
       ====================================================== */

    all() {


        return this.logs;


    }



};



/* ==========================================================
   Global
   ========================================================== */

window.LogView = LogView;