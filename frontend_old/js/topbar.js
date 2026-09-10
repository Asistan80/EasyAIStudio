/* ==========================================================
   Easy AI Studio
   File: frontend/js/topbar.js
   Version: 1.0.0
   Sprint: 4 - Core
   ========================================================== */

"use strict";

/* ==========================================================
   Topbar
   ========================================================== */

const Topbar = {

    element: null,

    searchInput: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.element = document.getElementById("topbar");

        if (!this.element) {

            return;

        }

        this.render();

        this.cacheElements();

        this.bindEvents();

    },

    /* ======================================================
       Render
       ====================================================== */

    render() {

        this.element.innerHTML = `

            <div class="topbar-left">

                <button
                    id="sidebar-toggle"
                    class="topbar-button"
                    title="Toggle Sidebar">

                    ☰

                </button>

                <div class="topbar-title">

                    Easy AI Studio

                </div>

            </div>

            <div class="topbar-center">

                <input
                    id="global-search"
                    class="topbar-search"
                    type="text"
                    placeholder="Search projects, models, workflows...">

            </div>

            <div class="topbar-right">

                <button
                    id="theme-button"
                    class="topbar-button"
                    title="Theme">

                    🌙

                </button>

                <button
                    id="notification-button"
                    class="topbar-button"
                    title="Notifications">

                    🔔

                </button>

                <button
                    id="profile-button"
                    class="topbar-button"
                    title="Profile">

                    👤

                </button>

            </div>

        `;

    },

    /* ======================================================
       Cache
       ====================================================== */

    cacheElements() {

        this.searchInput =

            document.getElementById("global-search");

    },

    /* ======================================================
       Events
       ====================================================== */

    bindEvents() {

        document

            .getElementById("sidebar-toggle")

            .addEventListener(

                "click",

                () => {

                    if (window.Sidebar) {

                        Sidebar.toggle();

                    }

                }

            );

        document

            .getElementById("theme-button")

            .addEventListener(

                "click",

                () => {

                    if (

                        window.Theme &&

                        typeof Theme.toggle === "function"

                    ) {

                        Theme.toggle();

                    }

                }

            );

        this.searchInput.addEventListener(

            "keyup",

            event => {

                this.search(

                    event.target.value

                );

            }

        );

    },

    /* ======================================================
       Search
       ====================================================== */

    search(keyword) {

        keyword = keyword.trim();

        console.log(

            "Search:",

            keyword

        );

    },

    /* ======================================================
       Set Title
       ====================================================== */

    setTitle(title) {

        const element =

            this.element.querySelector(

                ".topbar-title"

            );

        if (element) {

            element.textContent = title;

        }

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.Topbar = Topbar;