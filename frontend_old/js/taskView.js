/* ==========================================================
   Easy AI Studio
   File: frontend/js/taskView.js
   Version: 1.0.0
   Sprint: 9 - Task Queue Controller
   ========================================================== */

"use strict";

/* ==========================================================
   Task View
   ========================================================== */

const TaskView = {

    initialized: false,

    tasks: [],



    /* ======================================================
       Initialize
       ====================================================== */

    init() {


        if (this.initialized) {

            return;

        }


        this.initialized = true;


        this.listen();


        this.load();


        console.log(

            "Task View Ready"

        );


    },



    /* ======================================================
       Listen Events
       ====================================================== */

    listen() {



        EventBus.on(

            "task.create",

            task => {


                this.add(

                    task

                );


            }

        );





        EventBus.on(

            "images.created",

            image => {


                this.add({

                    name:

                        "Görsel oluşturma",

                    type:

                        "image",

                    data:

                        image

                });


            }

        );





        EventBus.on(

            "videos.created",

            video => {


                this.add({

                    name:

                        "Video oluşturma",

                    type:

                        "video",

                    data:

                        video

                });


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
       Add Task
       ====================================================== */

    add(task) {



        const item = {


            id:

                Utils.uuid(),


            name:

                task.name,


            type:

                task.type || "system",


            status:

                "running",


            progress:

                0,


            created:

                new Date()


        };



        this.tasks.unshift(

            item

        );



        this.render();



        this.process(

            item.id

        );


    },



    /* ======================================================
       Process
       ====================================================== */

    process(id) {


        let value = 0;



        const timer =

            setInterval(

                () => {



                    value += 10;



                    const task =

                        this.tasks.find(

                            item =>

                            item.id === id

                        );



                    if (!task) {


                        clearInterval(

                            timer

                        );


                        return;


                    }





                    task.progress =

                        value;



                    if (

                        value >= 100

                    ) {



                        task.status =

                            "completed";



                        clearInterval(

                            timer

                        );



                        EventBus.emit(

                            "task.completed",

                            task

                        );



                    }



                    this.render();



                },

                400

            );



    },



    /* ======================================================
       Render
       ====================================================== */

    render() {


        const container =

            document.getElementById(

                "tasks-list"

            );



        if (!container) {

            return;

        }





        const active =

            this.tasks.filter(

                task =>

                task.status === "running"

            ).length;



        const completed =

            this.tasks.filter(

                task =>

                task.status === "completed"

            ).length;



        const pending =

            this.tasks.length -

            active -

            completed;





        const activeCount =

            document.getElementById(

                "active-count"

            );



        const pendingCount =

            document.getElementById(

                "pending-count"

            );



        const completedCount =

            document.getElementById(

                "completed-count"

            );



        if (activeCount)

            activeCount.innerText = active;



        if (pendingCount)

            pendingCount.innerText = pending;



        if (completedCount)

            completedCount.innerText = completed;







        if (

            this.tasks.length === 0

        ) {


            container.innerHTML = `

                <div class="empty-tasks">

                    Henüz görev yok

                </div>

            `;


            return;


        }





        container.innerHTML = "";





        this.tasks.forEach(

            task => {



                const card =

                    document.createElement(

                        "div"

                    );



                card.className =

                    "task-card";



                card.innerHTML = `



                    <div class="task-header">


                        <div class="task-name">

                            ${task.name}

                        </div>


                        <div class="task-status">

                            ${task.status}

                        </div>


                    </div>



                    <div class="task-progress">


                        <div

                        class="task-progress-bar"

                        style="width:${task.progress}%">

                        </div>


                    </div>



                `;



                container.appendChild(

                    card

                );



            }

        );


    },



    /* ======================================================
       Clear
       ====================================================== */

    clear() {


        this.tasks = [];


        this.render();


    },



    /* ======================================================
       All
       ====================================================== */

    all() {


        return this.tasks;


    }



};



/* ==========================================================
   Global
   ========================================================== */

window.TaskView = TaskView;