/*
==========================================================
Easy AI Studio
File    : frontend/js/core/dialog.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class DialogManager {

    constructor() {

        this.dialog = null;

        this.overlay = null;

        this.callback = null;

    }

    initialize() {

        if (

            this.overlay

        ) {

            return;

        }

        this.overlay = document.createElement(

            "div"

        );

        this.overlay.className =

            "dialog-overlay";

        this.dialog = document.createElement(

            "div"

        );

        this.dialog.className =

            "dialog";

        this.overlay.appendChild(

            this.dialog

        );

        document.body.appendChild(

            this.overlay

        );

    }

    show(

        title,

        message,

        callback = null

    ) {

        this.initialize();

        this.callback = callback;

        this.dialog.innerHTML = `

            <div class="dialog-header">

                <h2>${title}</h2>

            </div>

            <div class="dialog-body">

                <p>${message}</p>

            </div>

            <div class="dialog-footer">

                <button id="dialog-cancel">

                    Cancel

                </button>

                <button id="dialog-ok">

                    OK

                </button>

            </div>

        `;

        this.overlay.classList.add(

            "show"

        );

        document

            .getElementById(

                "dialog-ok"

            )

            .onclick = () => {

                if (

                    this.callback

                ) {

                    this.callback(

                        true

                    );

                }

                this.close();

            };

        document

            .getElementById(

                "dialog-cancel"

            )

            .onclick = () => {

                if (

                    this.callback

                ) {

                    this.callback(

                        false

                    );

                }

                this.close();

            };

    }

    alert(

        title,

        message

    ) {

        this.show(

            title,

            message

        );

    }

    confirm(

        title,

        message,

        callback

    ) {

        this.show(

            title,

            message,

            callback

        );

    }

    close() {

        if (

            this.overlay

        ) {

            this.overlay.classList.remove(

                "show"

            );

        }

    }

    isOpen() {

        return (

            this.overlay &&

            this.overlay.classList.contains(

                "show"

            )

        );

    }

}

const DialogService =

    new DialogManager();

window.Dialog =

    DialogService;