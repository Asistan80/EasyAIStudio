/* ==========================================================
   Easy AI Studio
   File: frontend/js/router.js
   Version: 1.0.0
   Sprint: 9 - Router System
   ========================================================== */

"use strict";


/* ==========================================================
   Router
   ========================================================== */

const Router = {


    currentPage:

        null,


    routes: {


        dashboard:

            "pages/dashboard.html",


        chat:

            "pages/chat.html",


        image:

            "pages/image.html",


        video:

            "pages/video.html",


        models:

            "pages/models.html",


        settings:

            "pages/settings.html",


        providers:

            "pages/providers.html",


        agents:

            "pages/agents.html",


        workflows:

            "pages/workflows.html",


        files:

            "pages/files.html",


        plugins:

            "pages/plugins.html",


        logs:

            "pages/logs.html",


        tasks:

            "pages/tasks.html",


        downloads:

            "pages/downloads.html"


    },



    /* ======================================================
       Navigate
       ====================================================== */

    async go(page) {



        if (

            !this.routes[page]

        ) {


            console.error(

                "Page not found:",

                page

            );


            return;


        }





        const app =

            document.getElementById(

                "app"

            );



        if (!app) {

            return;

        }





        try {



            const response =

                await fetch(

                    this.routes[page]

                );



            const html =

                await response.text();



            app.innerHTML =

                html;



            this.currentPage =

                page;



            this.activateMenu(

                page

            );



            this.startPage(

                page

            );



            EventBus.emit(

                "page.changed",

                page

            );



        }

        catch(error) {


            console.error(

                error

            );


            app.innerHTML = `


                <div class="card">


                    Sayfa yüklenemedi


                </div>


            `;


        }



    },



    /* ======================================================
       Start Page
       ====================================================== */

    startPage(page) {



        const views = {


            chat:

                ChatView,


            image:

                ImageView,


            video:

                VideoView,


            models:

                ModelView,


            settings:

                SettingsView,


            providers:

                ProviderView,


            agents:

                AgentView,


            workflows:

                WorkflowView,


            files:

                FileView,


            plugins:

                PluginView,


            logs:

                LogView,


            tasks:

                TaskView,


            downloads:

                DownloadView


        };



        if (

            views[page]

        ) {


            views[page].init();


        }


    },



    /* ======================================================
       Menu Active
       ====================================================== */

    activateMenu(page) {



        document

        .querySelectorAll(

            ".menu-item"

        )

        .forEach(

            item => {



                item.classList.remove(

                    "active"

                );


                if (

                    item.dataset.page === page

                ) {



                    item.classList.add(

                        "active"

                    );


                }



            }

        );



    }



};




/* ==========================================================
   Global
   ========================================================== */

window.Router = Router;