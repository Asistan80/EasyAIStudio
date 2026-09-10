/* ==========================================================
   Easy AI Studio
   File: frontend/js/fileView.js
   Version: 1.0.0
   Sprint: 9 - File Controller
   ========================================================== */

"use strict";

/* ==========================================================
   File View
   ========================================================== */

const FileView = {

    initialized: false,

    files: [],



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

            "File View Ready"

        );


    },



    /* ======================================================
       Events
       ====================================================== */

    bindEvents() {


        const upload =

            document.getElementById(

                "upload-file"

            );



        const input =

            document.getElementById(

                "file-input"

            );



        const drop =

            document.getElementById(

                "drop-zone"

            );





        if (upload && input) {


            upload.onclick = () => {


                input.click();


            };


        }





        if (input) {


            input.onchange = event => {


                this.handleFiles(

                    event.target.files

                );


            };


        }





        if (drop) {



            drop.onclick = () => {


                input.click();


            };



            drop.ondragover = event => {


                event.preventDefault();


                drop.classList.add(

                    "dragover"

                );


            };



            drop.ondragleave = () => {


                drop.classList.remove(

                    "dragover"

                );


            };



            drop.ondrop = event => {


                event.preventDefault();



                drop.classList.remove(

                    "dragover"

                );



                this.handleFiles(

                    event.dataTransfer.files

                );


            };



        }


    },



    /* ======================================================
       Handle Files
       ====================================================== */

    handleFiles(list) {


        Array.from(

            list

        ).forEach(

            file => {



                const item = {


                    id:

                        Utils.uuid(),


                    name:

                        file.name,


                    size:

                        file.size,


                    type:

                        file.type,


                    created:

                        new Date()


                };



                this.files.push(

                    item

                );



                this.addFile(

                    item

                );



            }

        );



        EventBus.emit(

            "files.updated",

            this.files

        );


    },



    /* ======================================================
       Add File
       ====================================================== */

    addFile(file) {



        const container =

            document.getElementById(

                "files-container"

            );



        if (!container) {

            return;

        }





        const empty =

            container.querySelector(

                ".empty-files"

            );



        if (empty) {


            empty.remove();


        }





        const card =

            document.createElement(

                "div"

            );



        card.className =

            "file-card";



        card.innerHTML = `


            <div class="file-info">


                <div class="file-icon">

                    📄

                </div>



                <div>


                    <div class="file-name">

                        ${file.name}

                    </div>



                    <div class="file-size">

                        ${this.formatSize(file.size)}

                    </div>


                </div>


            </div>



            <button class="btn">

                Sil

            </button>


        `;




        card.querySelector(

            "button"

        ).onclick = () => {


            this.remove(

                file.id,

                card

            );


        };



        container.appendChild(

            card

        );


    },



    /* ======================================================
       Remove
       ====================================================== */

    remove(id, element) {



        this.files =

            this.files.filter(

                file =>

                file.id !== id

            );



        element.remove();



    },



    /* ======================================================
       Size Format
       ====================================================== */

    formatSize(size) {



        if (

            size < 1024

        ) {


            return size + " B";


        }



        if (

            size < 1024 * 1024

        ) {


            return (

                Math.round(

                    size / 1024

                )

                +

                " KB"

            );


        }



        return (

            Math.round(

                size /

                (

                    1024 *

                    1024

                )

            )

            +

            " MB"

        );


    },



    /* ======================================================
       All
       ====================================================== */

    all() {


        return this.files;


    }



};



/* ==========================================================
   Global
   ========================================================== */

window.FileView = FileView;