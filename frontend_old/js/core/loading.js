/*
==========================================================
Easy AI Studio
File    : frontend/js/core/loading.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class LoadingManager {

    constructor() {

        this.overlay = null;

        this.visible = false;

        this.message = "Loading...";

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

        this.overlay.id =

            "loading-overlay";

        this.overlay.innerHTML = `

            <div class="loading-box">

                <div class="loading-spinner"></div>

                <div
                    id="loading-message"
                    class="loading-message">

                    ${this.message}

                </div>

            </div>

        `;

        document.body.appendChild(

            this.overlay

        );

    }

    show(

        message = "Loading..."

    ) {

        this.initialize();

        this.message = message;

        const label = document.getElementById(

            "loading-message"

        );

        if (

            label

        ) {

            label.textContent =

                message;

        }

        this.overlay.classList.add(

            "show"

        );

        this.visible = true;

    }

    hide() {

        if (

            !this.overlay

        ) {

            return;

        }

        this.overlay.classList.remove(

            "show"

        );

        this.visible = false;

    }

    toggle(

        state

    ) {

        if (

            state

        ) {

            this.show();

        }

        else {

            this.hide();

        }

    }

    setMessage(

        message

    ) {

        this.message = message;

        const label = document.getElementById(

            "loading-message"

        );

        if (

            label

        ) {

            label.textContent =

                message;

        }

    }

    isVisible() {

        return this.visible;

    }

}

const LoadingService =

    new LoadingManager();

window.Loading =

    LoadingService;