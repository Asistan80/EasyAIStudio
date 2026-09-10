/* ==========================================================
   Easy AI Studio
   File: frontend/js/agentView.js
   Version: 1.0.0
   Sprint: 9 - Agent Controller
   ========================================================== */

"use strict";

/* ==========================================================
   Agent View
   ========================================================== */

const AgentView = {

    initialized: false,

    agents: [],



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

            "Agent View Ready"

        );


    },



    /* ======================================================
       Events
       ====================================================== */

    bindEvents() {



        const create =

            document.getElementById(

                "create-agent"

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


        this.agents = [


            {

                id:

                    "research",

                name:

                    "Araştırma Agent",

                task:

                    "Bilgi toplama",

                status:

                    "ready"

            }



        ];



        this.render();


    },



    /* ======================================================
       Create Agent
       ====================================================== */

    create() {


        const name =

            document.getElementById(

                "agent-name"

            );



        const task =

            document.getElementById(

                "agent-task"

            );





        if (

            !name ||

            !name.value.trim()

        ) {


            Notification.show(

                "Agent adı gerekli",

                "warning"

            );


            return;

        }







        const agent = {


            id:

                Utils.uuid(),


            name:

                name.value,


            task:

                task.value,


            status:

                "ready"


        };



        this.agents.push(

            agent

        );



        this.render();



        name.value = "";

        task.value = "";



        EventBus.emit(

            "agents.updated",

            agent

        );


    },



    /* ======================================================
       Render
       ====================================================== */

    render() {



        const container =

            document.getElementById(

                "agents-list"

            );



        if (!container) {

            return;

        }



        container.innerHTML = "";





        this.agents.forEach(

            agent => {



                const card =

                    document.createElement(

                        "div"

                    );



                card.className =

                    "agent-card";



                card.innerHTML = `



                    <h3>

                    ${agent.name}

                    </h3>



                    <p>

                    ${agent.task}

                    </p>



                    <span class="agent-status">

                    ${agent.status}

                    </span>



                    <br>



                    <button class="btn">

                    Çalıştır

                    </button>


                `;




                card

                    .querySelector(

                        "button"

                    )

                    .onclick = () => {


                        this.run(

                            agent.id

                        );


                    };




                container.appendChild(

                    card

                );



            }

        );


    },



    /* ======================================================
       Run Agent
       ====================================================== */

    run(id) {


        const agent =

            this.agents.find(

                item =>

                item.id === id

            );



        if (!agent) {

            return;

        }



        agent.status =

            "running";



        this.render();



        setTimeout(

            () => {


                agent.status =

                    "completed";


                this.render();



                EventBus.emit(

                    "agent.completed",

                    agent

                );



            },

            2000

        );



    },



    /* ======================================================
       All
       ====================================================== */

    all() {


        return this.agents;


    }



};



/* ==========================================================
   Global
   ========================================================== */

window.AgentView = AgentView;