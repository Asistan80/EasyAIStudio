/* ==========================================================
   Easy AI Studio
   File: frontend/js/modelView.js
   Version: 1.0.0
   Sprint: 9 - Model Controller
   ========================================================== */

"use strict";

/* ==========================================================
   Model View
   ========================================================== */

const ModelView = {

    initialized: false,

    models: [],

    activeModel: null,



    /* ======================================================
       Initialize
       ====================================================== */

    init() {


        if (this.initialized) {

            return;

        }


        this.initialized = true;


        this.bindEvents();


        this.loadModels();


        console.log(

            "Model View Ready"

        );


    },



    /* ======================================================
       Events
       ====================================================== */

    bindEvents() {



        const search =

            document.getElementById(

                "model-search"

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





        const add =

            document.getElementById(

                "add-model"

            );



        if (add) {


            add.onclick = () => {


                this.addModel();


            };


        }


    },



    /* ======================================================
       Load Models
       ====================================================== */

    loadModels() {


        this.models = [


            {

                id:

                    "local-ai",

                name:

                    "Local AI Model",

                type:

                    "Language Model",

                active:

                    false

            },


            {

                id:

                    "assistant-ai",

                name:

                    "Assistant Model",

                type:

                    "General AI",

                active:

                    true

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

                "models-list"

            );



        if (!container) {

            return;

        }



        container.innerHTML = "";



        this.models.forEach(

            model => {



                const card =

                    document.createElement(

                        "div"

                    );



                card.className =

                    "model-card";



                if (

                    model.active

                ) {


                    card.classList.add(

                        "active"

                    );


                }



                card.innerHTML = `


                    <h3>

                        ${model.name}

                    </h3>


                    <p>

                        ${model.type}

                    </p>


                    <button

                    class="btn">


                        ${

                            model.active

                            ?

                            "Aktif"

                            :

                            "Kullan"

                        }


                    </button>


                `;



                card.querySelector(

                    "button"

                ).onclick = () => {


                    this.select(

                        model.id

                    );


                };



                container.appendChild(

                    card

                );



            }

        );


    },



    /* ======================================================
       Select Model
       ====================================================== */

    select(id) {


        this.models.forEach(

            model => {


                model.active =

                    model.id === id;


            }

        );



        this.activeModel = id;



        this.render();



        EventBus.emit(

            "model.changed",

            id

        );


    },



    /* ======================================================
       Add Model
       ====================================================== */

    addModel() {


        const model = {


            id:

                Utils.uuid(),


            name:

                "Yeni AI Model",


            type:

                "Custom Model",


            active:

                false


        };



        this.models.push(

            model

        );



        this.render();


    },



    /* ======================================================
       Search
       ====================================================== */

    search(text) {



        const value =

            text.toLowerCase();



        const result =

            this.models.filter(

                model =>


                model.name

                    .toLowerCase()

                    .includes(

                        value

                    )

            );



        this.renderSearch(

            result

        );



    },



    renderSearch(list) {


        const container =

            document.getElementById(

                "models-list"

            );



        if (!container) {

            return;

        }



        container.innerHTML = "";



        list.forEach(

            model => {


                const item =

                    document.createElement(

                        "div"

                    );


                item.className =

                    "model-card";


                item.innerHTML = `

                    <h3>

                    ${model.name}

                    </h3>

                    <p>

                    ${model.type}

                    </p>

                `;



                container.appendChild(

                    item

                );


            }

        );


    },



    /* ======================================================
       All
       ====================================================== */

    all() {


        return this.models;


    }



};



/* ==========================================================
   Global
   ========================================================== */

window.ModelView = ModelView;