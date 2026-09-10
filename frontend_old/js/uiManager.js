/* ==========================================================
   Easy AI Studio
   File: frontend/js/uiManager.js
   Version: 1.0.0
   Sprint: 8 - UI Manager
   ========================================================== */

"use strict";

/* ==========================================================
   UI Manager
   ========================================================== */

const UIManager = {

    initialized: false,

    loading: false,

    modals: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        this.createLoader();

        this.registerEvents();

        console.log(

            "UI Manager Ready"

        );

    },


    /* ======================================================
       Events
       ====================================================== */

    registerEvents() {


        EventBus.on(

            "ui.loading",

            state => {


                if (state) {

                    this.showLoader();

                }

                else {

                    this.hideLoader();

                }


            }

        );


        EventBus.on(

            "notification.show",

            data => {

                this.toast(

                    data.message,

                    data.type

                );

            }

        );


    },


    /* ======================================================
       Loader
       ====================================================== */

    createLoader() {


        const loader =

            document.createElement(

                "div"

            );


        loader.id =

            "app-loader";


        loader.innerHTML = `

            <div class="loader-box">

                <div class="spinner"></div>

                <span>

                    Loading...

                </span>

            </div>

        `;


        document.body.appendChild(

            loader

        );


    },


    showLoader() {


        const loader =

            document.getElementById(

                "app-loader"

            );


        if (loader) {

            loader.classList.add(

                "show"

            );

        }


        this.loading = true;


    },


    hideLoader() {


        const loader =

            document.getElementById(

                "app-loader"

            );


        if (loader) {

            loader.classList.remove(

                "show"

            );

        }


        this.loading = false;


    },


    /* ======================================================
       Toast
       ====================================================== */

    toast(message, type="info") {


        const toast =

            document.createElement(

                "div"

            );


        toast.className =

            "toast " + type;


        toast.innerHTML =

            message;


        document.body.appendChild(

            toast

        );


        setTimeout(

            () => {


                toast.remove();


            },

            3000

        );


    },


    /* ======================================================
       Modal
       ====================================================== */

    openModal(title, content) {


        const modal =

            document.createElement(

                "div"

            );


        modal.className =

            "modal";


        modal.innerHTML = `

            <div class="modal-box">

                <h2>

                    ${title}

                </h2>


                <div>

                    ${content}

                </div>


                <button class="btn close-modal">

                    Kapat

                </button>

            </div>

        `;


        modal

            .querySelector(

                ".close-modal"

            )

            .onclick = () => {


                modal.remove();


            };


        document.body.appendChild(

            modal

        );


        this.modals.push(

            modal

        );


    },


    /* ======================================================
       Close All Modals
       ====================================================== */

    closeAll() {


        this.modals.forEach(

            modal => {


                modal.remove();


            }

        );


        this.modals = [];


    }

};


/* ==========================================================
   Global
   ========================================================== */

window.UIManager = UIManager;