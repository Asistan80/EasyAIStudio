/* ==========================================================
   Easy AI Studio
   File: frontend/js/imageView.js
   Version: 1.0.0
   Sprint: 9 - Image Controller
   ========================================================== */

"use strict";

/* ==========================================================
   Image View
   ========================================================== */

const ImageView = {

    initialized: false,

    images: [],



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

            "Image View Ready"

        );


    },



    /* ======================================================
       Events
       ====================================================== */

    bindEvents() {


        const button =

            document.getElementById(

                "generate-image"

            );



        if (button) {


            button.onclick = () => {


                this.generate();


            };


        }



    },



    /* ======================================================
       Generate Image
       ====================================================== */

    generate() {


        const prompt =

            document.getElementById(

                "image-prompt"

            );



        const style =

            document.getElementById(

                "image-style"

            );



        const size =

            document.getElementById(

                "image-size"

            );



        if (

            !prompt ||

            !prompt.value.trim()

        ) {


            Notification.show(

                "Prompt boş olamaz",

                "warning"

            );


            return;

        }





        const image = {


            id:

                Utils.uuid(),


            prompt:

                prompt.value,


            style:

                style.value,


            size:

                size.value,


            created:

                new Date()


        };




        this.images.push(

            image

        );



        this.addToGallery(

            image

        );



        EventBus.emit(

            "images.created",

            image

        );



        prompt.value = "";



    },



    /* ======================================================
       Add Gallery
       ====================================================== */

    addToGallery(image) {



        const gallery =

            document.getElementById(

                "image-list"

            );



        if (!gallery) {

            return;

        }



        const empty =

            gallery.querySelector(

                ".empty-gallery"

            );



        if (empty) {

            empty.remove();

        }



        const card =

            document.createElement(

                "div"

            );



        card.className =

            "image-item";



        card.innerHTML = `

            <div class="image-placeholder">

                🎨

            </div>


            <div class="image-info">

                ${image.prompt}

                <br>

                ${image.style}

            </div>

        `;



        gallery.prepend(

            card

        );



    },



    /* ======================================================
       Get Images
       ====================================================== */

    all() {


        return this.images;


    }



};


/* ==========================================================
   Global
   ========================================================== */

window.ImageView = ImageView;