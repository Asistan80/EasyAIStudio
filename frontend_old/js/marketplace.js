/* ==========================================================
   Easy AI Studio
   File: frontend/js/marketplace.js
   Version: 1.0.0
   Sprint: 6 - Marketplace
   ========================================================== */

"use strict";

/* ==========================================================
   Marketplace
   ========================================================== */

const Marketplace = {

    repository:

        "https://market.easyaistudio.org",

    categories: [],

    items: [],

    featured: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        console.log(

            "Marketplace Ready"

        );

    },

    /* ======================================================
       Load Marketplace
       ====================================================== */

    async refresh() {

        try {

            const result = await API.get(

                this.repository +

                "/market.json"

            );

            this.categories =

                result.categories || [];

            this.items =

                result.items || [];

            this.featured =

                result.featured || [];

            EventBus.emit(

                "marketplace.updated",

                result

            );

        }

        catch (error) {

            Logger.error(

                "Marketplace unavailable.",

                error

            );

        }

    },

    /* ======================================================
       Search
       ====================================================== */

    search(keyword) {

        keyword = keyword

            .trim()

            .toLowerCase();

        return this.items.filter(

            item =>

            item.name

                .toLowerCase()

                .includes(keyword)

        );

    },

    /* ======================================================
       Category
       ====================================================== */

    category(name) {

        return this.items.filter(

            item =>

            item.category === name

        );

    },

    /* ======================================================
       Featured
       ====================================================== */

    getFeatured() {

        return this.featured;

    },

    /* ======================================================
       Categories
       ====================================================== */

    getCategories() {

        return this.categories;

    },

    /* ======================================================
       Item
       ====================================================== */

    get(id) {

        return this.items.find(

            item =>

            item.id === id

        );

    },

    /* ======================================================
       All Items
       ====================================================== */

    all() {

        return this.items;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.Marketplace = Marketplace;