/* ==========================================================
   Easy AI Studio
   File: frontend/js/pluginView.js
   Version: 1.0.0
   Sprint: 9 - Plugin Controller
   ========================================================== */

"use strict";

/* ==========================================================
   Plugin View
   ========================================================== */

const PluginView = {

    initialized: false,

    plugins: [],



    /* ======================================================
       Initialize
       ====================================================== */

    init() {


        if (this.initialized) {

            return;

        }


        this.initialized = true;


        this.bindEvents();


        this.load();


        console.log(

            "Plugin View Ready"

        );


    },



    /* ======================================================
       Events
       ====================================================== */

    bindEvents() {


        const search =

            document.getElementById(

                "plugin-search"

            );



        if (search) {


            search.addEventListener(

                "input",

                () => {


                    this.search(

                        search.value

                    );


                }

            );


        }





        const install =

            document.getElementById(

                "install-plugin"

            );



        if (install) {


            install.onclick = () => {


                this.install();


            };


        }


    },



    /* ======================================================
       Load Plugins
       ====================================================== */

    load() {


        this.plugins = [


            {

                id:

                    "image-tools",

                name:

                    "Image Tools",

                description:

                    "Görsel araçları",

                active:

                    true

            },



            {

                id:

                    "video-tools",

                name:

                    "Video Tools",

                description:

                    "Video araçları",

                active:

                    false

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

                "plugins-list"

            );



        if (!container) {

            return;

        }



        container.innerHTML = "";





        this.plugins.forEach(

            plugin => {



                const card =

                    document.createElement(

                        "div"

                    );



                card.className =

                    "plugin-card";



                card.innerHTML = `


                    <h3>

                    ${plugin.name}

                    </h3>



                    <p>

                    ${plugin.description}

                    </p>



                    <span class="plugin-status">

                    ${

                        plugin.active

                        ?

                        "Aktif"

                        :

                        "Pasif"

                    }

                    </span>



                    <br>



                    <button class="btn">

                    Değiştir

                    </button>



                `;




                card

                .querySelector(

                    "button"

                )

                .onclick = () => {


                    this.toggle(

                        plugin.id

                    );


                };




                container.appendChild(

                    card

                );



            }

        );


    },



    /* ======================================================
       Toggle
       ====================================================== */

    toggle(id) {



        const plugin =

            this.plugins.find(

                item =>

                item.id === id

            );



        if (plugin) {


            plugin.active =

                !plugin.active;



        }



        this.render();



        EventBus.emit(

            "plugins.updated",

            this.plugins

        );


    },



    /* ======================================================
       Install
       ====================================================== */

    install() {


        const plugin = {


            id:

                Utils.uuid(),


            name:

                "Yeni Plugin",


            description:

                "Özel eklenti",


            active:

                false


        };



        this.plugins.push(

            plugin

        );



        this.render();


    },



    /* ======================================================
       Search
       ====================================================== */

    search(text) {


        const value =

            text.toLowerCase();



        const list =

            this.plugins.filter(

                plugin =>


                plugin.name

                .toLowerCase()

                .includes(

                    value

                )

            );



        const old =

            this.plugins;



        this.plugins =

            list;



        this.render();



        this.plugins =

            old;



    },



    /* ======================================================
       All
       ====================================================== */

    all() {


        return this.plugins;


    }



};



/* ==========================================================
   Global
   ========================================================== */

window.PluginView = PluginView;