/* ==========================================================
   Easy AI Studio
   File: frontend/js/workflowView.js
   Version: 1.0.0
   Sprint: 9 - Workflow Controller
   ========================================================== */

"use strict";

/* ==========================================================
   Workflow View
   ========================================================== */

const WorkflowView = {

    initialized: false,

    workflows: [],



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

            "Workflow View Ready"

        );


    },



    /* ======================================================
       Events
       ====================================================== */

    bindEvents() {


        const create =

            document.getElementById(

                "create-workflow"

            );



        if (create) {


            create.onclick = () => {


                this.create();


            };


        }


    },



    /* ======================================================
       Load
       ====================================================== */

    load() {


        this.workflows = [];


        this.render();


    },



    /* ======================================================
       Create Workflow
       ====================================================== */

    create() {


        const workflow = {


            id:

                Utils.uuid(),


            name:

                "Yeni Workflow",


            nodes: [


                {

                    type:

                        "start"

                },


                {

                    type:

                        "ai"

                },


                {

                    type:

                        "output"

                }


            ],


            status:

                "ready",


            created:

                new Date()


        };



        this.workflows.push(

            workflow

        );



        this.render();



        EventBus.emit(

            "workflow.created",

            workflow

        );



    },



    /* ======================================================
       Render
       ====================================================== */

    render() {


        const container =

            document.getElementById(

                "workflows"

            );



        if (!container) {

            return;

        }



        container.innerHTML = "";





        if (

            this.workflows.length === 0

        ) {


            container.innerHTML = `

                <div class="empty-workflow">

                    Henüz workflow yok

                </div>

            `;


            return;


        }






        this.workflows.forEach(

            workflow => {



                const card =

                    document.createElement(

                        "div"

                    );



                card.className =

                    "workflow-card";



                card.innerHTML = `


                    <div>


                        <b>

                        ${workflow.name}

                        </b>



                        <p>

                        ${workflow.nodes.length}

                        adım

                        </p>


                    </div>




                    <div class="workflow-status">

                        ${workflow.status}

                    </div>



                `;



                container.appendChild(

                    card

                );



            }

        );


    },



    /* ======================================================
       Run Workflow
       ====================================================== */

    run(id) {


        const workflow =

            this.workflows.find(

                item =>

                item.id === id

            );



        if (!workflow) {

            return;

        }



        workflow.status =

            "running";



        this.render();




        setTimeout(

            () => {


                workflow.status =

                    "completed";


                this.render();



                EventBus.emit(

                    "workflow.completed",

                    workflow

                );


            },

            3000

        );



    },



    /* ======================================================
       All
       ====================================================== */

    all() {


        return this.workflows;


    }



};



/* ==========================================================
   Global
   ========================================================== */

window.WorkflowView = WorkflowView;