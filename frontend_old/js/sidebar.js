/* ==========================================================
   Easy AI Studio
   File: frontend/js/sidebar.js
   Version: 1.0.0
   Sprint: 4 - Core
   ========================================================== */

"use strict";

/* ==========================================================
   Sidebar
   ========================================================== */

const Sidebar = {

    element: null,

    collapsed: false,

    menu: [

        {
            id: "dashboard",
            title: "Dashboard",
            icon: "🏠"
        },

        {
            id: "projects",
            title: "Projects",
            icon: "📁"
        },

        {
            id: "models",
            title: "Models",
            icon: "🧠"
        },

        {
            id: "images",
            title: "Images",
            icon: "🎨"
        },

        {
            id: "video",
            title: "Video",
            icon: "🎬"
        },

        {
            id: "audio",
            title: "Audio",
            icon: "🎤"
        },

        {
            id: "workflow",
            title: "Workflow",
            icon: "🔀"
        },

        {
            id: "extensions",
            title: "Extensions",
            icon: "🧩"
        },

        {
            id: "marketplace",
            title: "Marketplace",
            icon: "🛒"
        },

        {
            id: "settings",
            title: "Settings",
            icon: "⚙️"
        }

    ],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.element = document.getElementById("sidebar");

        if (!this.element) {

            return;

        }

        this.render();

        this.bindEvents();

    },

    /* ======================================================
       Render
       ====================================================== */

    render() {

        this.element.innerHTML = "";

        const logo = document.createElement("div");

        logo.className = "sidebar-logo";

        logo.innerHTML = `

            <h2>Easy AI Studio</h2>

        `;

        this.element.appendChild(logo);

        const nav = document.createElement("nav");

        nav.className = "sidebar-nav";

        this.menu.forEach(item => {

            const button = document.createElement("button");

            button.className = "sidebar-item";

            button.dataset.route = item.id;

            button.innerHTML = `

                <span class="sidebar-icon">

                    ${item.icon}

                </span>

                <span class="sidebar-text">

                    ${item.title}

                </span>

            `;

            nav.appendChild(button);

        });

        this.element.appendChild(nav);

    },

    /* ======================================================
       Events
       ====================================================== */

    bindEvents() {

        this.element

            .querySelectorAll(".sidebar-item")

            .forEach(button => {

                button.addEventListener(

                    "click",

                    () => {

                        Router.open(

                            button.dataset.route

                        );

                    }

                );

            });

    },

    /* ======================================================
       Collapse
       ====================================================== */

    collapse() {

        this.collapsed = true;

        this.element.classList.add("collapsed");

    },

    /* ======================================================
       Expand
       ====================================================== */

    expand() {

        this.collapsed = false;

        this.element.classList.remove("collapsed");

    },

    /* ======================================================
       Toggle
       ====================================================== */

    toggle() {

        if (this.collapsed) {

            this.expand();

        } else {

            this.collapse();

        }

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.Sidebar = Sidebar;