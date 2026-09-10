/* ==========================================================
   Easy AI Studio
   File: frontend/js/windowManager.js
   Version: 1.0.0
   Sprint: 5 - Window Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Window Manager
   ========================================================== */

const WindowManager = {

    windows: new Map(),

    zIndex: 1000,

    root: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.root = document.getElementById(

            "window-root"

        );

        console.log(

            "Window Manager Ready"

        );

    },

    /* ======================================================
       Create Window
       ====================================================== */

    create(options = {}) {

        if (!this.root) {

            return null;

        }

        const id = Utils.uuid();

        const windowElement = document.createElement("div");

        windowElement.className = "window";

        windowElement.dataset.id = id;

        windowElement.style.zIndex = ++this.zIndex;

        windowElement.innerHTML = `

            <div class="window-header">

                <div class="window-title">

                    ${options.title || "Window"}

                </div>

                <button class="window-close">

                    ✕

                </button>

            </div>

            <div class="window-body">

                ${options.content || ""}

            </div>

        `;

        this.root.appendChild(windowElement);

        this.windows.set(

            id,

            windowElement

        );

        windowElement

            .querySelector(".window-close")

            .addEventListener(

                "click",

                () => {

                    this.close(id);

                }

            );

        windowElement.addEventListener(

            "mousedown",

            () => {

                this.focus(id);

            }

        );

        return id;

    },

    /* ======================================================
       Focus
       ====================================================== */

    focus(id) {

        const windowElement =

            this.windows.get(id);

        if (!windowElement) {

            return;

        }

        windowElement.style.zIndex =

            ++this.zIndex;

    },

    /* ======================================================
       Close
       ====================================================== */

    close(id) {

        const windowElement =

            this.windows.get(id);

        if (!windowElement) {

            return;

        }

        windowElement.remove();

        this.windows.delete(id);

    },

    /* ======================================================
       Close All
       ====================================================== */

    closeAll() {

        this.windows.forEach(

            (_, id) =>

            this.close(id)

        );

    },

    /* ======================================================
       Get Window
       ====================================================== */

    get(id) {

        return this.windows.get(id);

    },

    /* ======================================================
       Count
       ====================================================== */

    count() {

        return this.windows.size;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.WindowManager = WindowManager;