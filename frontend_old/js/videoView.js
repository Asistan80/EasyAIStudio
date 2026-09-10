/* ==========================================================
   Easy AI Studio
   File: frontend/js/videoView.js
   Version: 1.0.0
   Sprint: 9 - Video Controller
   ========================================================== */

"use strict";

/* ==========================================================
   Video View
   ========================================================== */

const VideoView = {

    initialized: false,

    videos: [],



    /* ======================================================
       Initialize
       ====================================================== */

    init() {


        if (this.initialized) {

            return;

        }


        this.initialized = true;


        this.bindEvents();


        console.log(

            "Video View Ready"

        );


    },



    /* ======================================================
       Events
       ====================================================== */

    bindEvents() {


        const button =

            document.getElementById(

                "generate-video"

            );



        if (button) {


            button.onclick = () => {


                this.generate();


            };


        }


    },



    /* ======================================================
       Generate Video
       ====================================================== */

    generate() {



        const prompt =

            document.getElementById(

                "video-prompt"

            );



        const duration =

            document.getElementById(

                "video-duration"

            );



        const format =

            document.getElementById(

                "video-format"

            );



        const style =

            document.getElementById(

                "video-style"

            );





        if (

            !prompt ||

            !prompt.value.trim()

        ) {


            Notification.show(

                "Video açıklaması gerekli",

                "warning"

            );


            return;


        }





        const video = {


            id:

                Utils.uuid(),


            prompt:

                prompt.value,


            duration:

                duration.value,


            format:

                format.value,


            style:

                style.value,


            status:

                "processing",


            progress:

                0,


            created:

                new Date()


        };





        this.videos.push(

            video

        );



        this.addVideoCard(

            video

        );



        EventBus.emit(

            "videos.created",

            video

        );



        prompt.value = "";



        this.simulateProgress(

            video.id

        );



    },



    /* ======================================================
       Add Video Card
       ====================================================== */

    addVideoCard(video) {



        const container =

            document.getElementById(

                "video-items"

            );



        if (!container) {

            return;

        }





        const empty =

            container.querySelector(

                ".empty-video"

            );



        if (empty) {


            empty.remove();


        }





        const card =

            document.createElement(

                "div"

            );



        card.className =

            "video-card";



        card.id =

            "video-" + video.id;



        card.innerHTML = `


            <div class="video-preview">

                🎬

            </div>



            <div class="video-info">


                <b>

                    ${video.prompt}

                </b>


                <p>

                    ${video.duration}

                    -

                    ${video.format}

                </p>



                <div class="progress">

                    <div

                    class="progress-bar"

                    id="progress-${video.id}">

                    </div>

                </div>



            </div>



            <div class="video-status">

                Processing

            </div>


        `;



        container.prepend(

            card

        );


    },



    /* ======================================================
       Progress Simulation
       ====================================================== */

    simulateProgress(id) {


        let progress = 0;



        const timer =

            setInterval(

                () => {



                    progress += 10;



                    const bar =

                        document.getElementById(

                            "progress-" + id

                        );



                    if (bar) {


                        bar.style.width =

                            progress + "%";


                    }





                    if (

                        progress >= 100

                    ) {


                        clearInterval(

                            timer

                        );


                        const video =

                            this.videos.find(

                                item =>

                                item.id === id

                            );



                        if (video) {


                            video.status =

                                "completed";


                        }



                    }



                },

                500

            );



    },



    /* ======================================================
       All Videos
       ====================================================== */

    all() {


        return this.videos;


    }



};


/* ==========================================================
   Global
   ========================================================== */

window.VideoView = VideoView;