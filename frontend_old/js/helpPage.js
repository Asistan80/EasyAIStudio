/* ==========================================================
   Easy AI Studio
   File: frontend/js/helpPage.js
   Version: 1.0.0
   Sprint: 7 - Help Page
   ========================================================== */

"use strict";

/* ==========================================================
   Help Page
   ========================================================== */

const HelpPage = {

    initialized: false,

    topics: [],

    faq: [],

    searchResults: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        this.load();

        console.log(

            "Help Page Ready"

        );

    },

    /* ======================================================
       Load Help Data
       ====================================================== */

    load() {

        this.topics = [

            {

                id: "getting-started",

                title: "Getting Started",

                content:

                    "Easy AI Studio başlangıç rehberi."

            },

            {

                id: "chat",

                title: "AI Chat",

                content:

                    "Yapay zeka modelleri ile sohbet."

            },

            {

                id: "image",

                title: "Image Studio",

                content:

                    "AI görsel üretim sistemi."

            },

            {

                id: "video",

                title: "Video Studio",

                content:

                    "AI video oluşturma sistemi."

            }

        ];

        this.faq = [

            {

                question:

                    "Model nasıl eklenir?",

                answer:

                    "Model Manager üzerinden ekleyebilirsiniz."

            },

            {

                question:

                    "API anahtarı nereden girilir?",

                answer:

                    "API Page bölümünden eklenir."

            }

        ];

    },

    /* ======================================================
       Search
       ====================================================== */

    search(keyword) {

        keyword =

            keyword

                .toLowerCase();

        this.searchResults =

            this.topics.filter(

                topic =>

                topic.title

                    .toLowerCase()

                    .includes(keyword)

            );

        return this.searchResults;

    },

    /* ======================================================
       Open Topic
       ====================================================== */

    open(id) {

        return this.topics.find(

            topic =>

            topic.id === id

        );

    },

    /* ======================================================
       Topics
       ====================================================== */

    all() {

        return this.topics;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.HelpPage = HelpPage;