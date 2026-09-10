/* ==========================================================
   Easy AI Studio
   File: frontend/js/modal.js
   Version: 1.0.0
   Sprint: 4 - Core
   ========================================================== */

"use strict";

/* ==========================================================
   Modal Manager
   ========================================================== */

const Modal = {

    root: null,

    active: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.root = document.getElementById(

            "modal-root"

        );

        if (!this.root) {

            console.warn(

                "Modal root not found."

            );

        }

    },

    /* ======================================================
       Open
       ====================================================== */

    open(options = {}) {

        if (!this.root) {

            return;

        }

        this.close();

        const overlay = document.createElement("div");

        overlay.className = "modal-overlay";

        const modal = document.createElement("div");

        modal.className = "modal";

        modal.innerHTML = `

            <div class="modal-header">

                <h2>

                    ${options.title || "Modal"}

                </h2>

            </div>

            <div class="modal-body">

                ${options.content || ""}

            </div>

            <div class="modal-footer">

                <button
                    class="btn btn-primary modal-close">

                    Close

                </button>

            </div>

        `;

        overlay.appendChild(modal);

        this.root.appendChild(overlay);

        this.active = overlay;

        modal

            .querySelector(".modal-close")

            .addEventListener(

                "click",

                () => {

                    this.close();

                }

            );

        overlay.addEventListener(

            "click",

            event => {

                if (

                    event.target === overlay

                ) {

                    this.close();

                }

            }

        );

    },

    /* ======================================================
       Close
       ====================================================== */

    close() {

        if (!this.active) {

            return;

        }

        this.active.remove();

        this.active = null;

    },

    /* ======================================================
       Alert
       ====================================================== */

    alert(title, message) {

        this.open({

            title,

            content: `<p>${message}</p>`

        });

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.Modal = Modal;