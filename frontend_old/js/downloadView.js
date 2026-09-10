/* ==========================================================
   Easy AI Studio
   File: frontend/js/downloadView.js
   Version: 1.0.0
   Sprint: 9 - Download Controller
   ========================================================== */

"use strict";

/* ==========================================================
   Download View
   ========================================================== */

const DownloadView = {

    initialized: false,

    downloads: [],



    /* ======================================================
       Initialize
       ====================================================== */

    init() {


        if (this.initialized) {

            return;

        }


        this.initialized = true;


        this.bindEvents();


        this.render();


        console.log(

            "Download View Ready"

        );


    },



    /* ======================================================
       Events
       ====================================================== */

    bindEvents() {


        const button =

            document.getElementById(

                "start-download"

            );



        if (button) {


            button.onclick = () => {


                this.start();


            };


        }



    },



    /* ======================================================
       Start Download
       ====================================================== */

    start() {



        const item = {


            id:

                Utils.uuid(),


            name:

                "AI Model Package",


            size:

                "2.4 GB",


            speed:

                "0 MB/s",


            progress:

                0,


            status:

                "downloading"



        };



        this.downloads.push(

            item

        );



        this.render();



        this.process(

            item.id

        );



        EventBus.emit(

            "download.started",

            item

        );


    },



    /* ======================================================
       Process
       ====================================================== */

    process(id) {


        let progress = 0;



        const timer =

            setInterval(

                () => {



                    progress += 5;



                    const item =

                        this.downloads.find(

                            download =>

                            download.id === id

                        );



                    if (!item) {


                        clearInterval(

                            timer

                        );


                        return;


                    }






                    item.progress =

                        progress;



                    item.speed =

                        "12 MB/s";





                    if (

                        progress >= 100

                    ) {



                        item.status =

                            "completed";



                        clearInterval(

                            timer

                        );



                        EventBus.emit(

                            "download.completed",

                            item

                        );



                    }



                    this.render();



                },

                300

            );


    },



    /* ======================================================
       Render
       ====================================================== */

    render() {



        const container =

            document.getElementById(

                "downloads-list"

            );



        if (!container) {

            return;

        }





        if (

            this.downloads.length === 0

        ) {


            container.innerHTML = `

                <div class="empty-downloads">

                    Aktif indirme yok

                </div>

            `;


            return;


        }







        container.innerHTML = "";





        this.downloads.forEach(

            item => {



                const card =

                    document.createElement(

                        "div"

                    );



                card.className =

                    "download-card";



                card.innerHTML = `



                    <div class="download-header">


                        <div class="download-name">

                            ${item.name}

                        </div>



                        <div class="download-status">


                            ${item.status}


                        </div>


                    </div>



                    <div class="download-progress">


                        <div

                        class="download-progress-bar"

                        style="width:${item.progress}%">

                        </div>


                    </div>




                    <div class="download-info">


                        <span>

                            ${item.size}

                        </span>



                        <span>

                            ${item.speed}

                        </span>


                    </div>



                `;



                container.appendChild(

                    card

                );



            }

        );



    },



    /* ======================================================
       All
       ====================================================== */

    all() {


        return this.downloads;


    }



};



/* ==========================================================
   Global
   ========================================================== */

window.DownloadView = DownloadView;