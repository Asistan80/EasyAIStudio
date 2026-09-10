/* ==========================================================
   Easy AI Studio
   File: frontend/js/providerView.js
   Version: 1.0.0
   Sprint: 9 - Provider Controller
   ========================================================== */

"use strict";

/* ==========================================================
   Provider View
   ========================================================== */

const ProviderView = {

    initialized: false,

    providers: [],



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

            "Provider View Ready"

        );


    },



    /* ======================================================
       Load Providers
       ====================================================== */

    load() {


        this.providers = [


            {

                id:

                    "local",

                name:

                    "Local AI",

                type:

                    "Local Model",

                status:

                    "online"

            },



            {

                id:

                    "cloud",

                name:

                    "Cloud AI",

                type:

                    "API Service",

                status:

                    "offline"

            }



        ];



        this.render();


    },



    /* ======================================================
       Render
       ====================================================== */

    render() {



        const container =

            document.getElementById(

                "providers-list"

            );



        if (!container) {

            return;

        }



        container.innerHTML = "";



        this.providers.forEach(

            provider => {



                const card =

                    document.createElement(

                        "div"

                    );



                card.className =

                    "provider-card";



                card.innerHTML = `



                    <h3>

                        ${provider.name}

                    </h3>



                    <p>

                        ${provider.type}

                    </p>



                    <div class="provider-status ${

                        provider.status ===

                        "offline"

                        ?

                        "offline"

                        :

                        ""

                    }">


                        ●

                        ${provider.status}


                    </div>



                    <button class="btn">

                        Yönet

                    </button>



                `;



                container.appendChild(

                    card

                );


            }

        );


    },



    /* ======================================================
       Add Provider
       ====================================================== */

    add() {


        const provider = {


            id:

                Utils.uuid(),


            name:

                "Yeni Provider",


            type:

                "Custom API",


            status:

                "offline"


        };



        this.providers.push(

            provider

        );



        this.render();


    },



    /* ======================================================
       Connect
       ====================================================== */

    connect(id) {


        const provider =

            this.providers.find(

                item =>

                item.id === id

            );



        if (provider) {


            provider.status =

                "online";



        }



        this.render();



        EventBus.emit(

            "provider.connected",

            provider

        );


    },



    /* ======================================================
       All
       ====================================================== */

    all() {


        return this.providers;


    }



};



/* ==========================================================
   Global
   ========================================================== */

window.ProviderView = ProviderView;