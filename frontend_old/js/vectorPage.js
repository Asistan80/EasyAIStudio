/* ==========================================================
   Easy AI Studio
   File: frontend/js/vectorPage.js
   Version: 1.0.0
   Sprint: 7 - Vector Store Page
   ========================================================== */

"use strict";

/* ==========================================================
   Vector Page
   ========================================================== */

const VectorPage = {

    initialized: false,

    collections: [],

    activeCollection: null,

    vectors: [],

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        if (this.initialized) {

            return;

        }

        this.initialized = true;

        this.refresh();

        console.log(

            "Vector Page Ready"

        );

    },

    /* ======================================================
       Refresh
       ====================================================== */

    refresh() {

        this.collections =

            VectorStore.all();

        EventBus.emit(

            "vector.updated",

            this.collections

        );

    },

    /* ======================================================
       Create Collection
       ====================================================== */

    createCollection(name) {

        VectorStore.create(

            name

        );

        this.refresh();

    },

    /* ======================================================
       Open Collection
       ====================================================== */

    open(id) {

        this.activeCollection = id;

        VectorStore.open(id);

        const collection =

            VectorStore.get(id);

        this.vectors =

            collection

                ? collection.vectors

                : [];

    },

    /* ======================================================
       Add Vector
       ====================================================== */

    add(vector) {

        if (

            !this.activeCollection

        ) {

            return;

        }

        VectorStore.add(

            this.activeCollection,

            vector

        );

        this.open(

            this.activeCollection

        );

    },

    /* ======================================================
       Remove Vector
       ====================================================== */

    remove(id) {

        if (

            !this.activeCollection

        ) {

            return;

        }

        VectorStore.removeVector(

            this.activeCollection,

            id

        );

        this.open(

            this.activeCollection

        );

    },

    /* ======================================================
       Collections
       ====================================================== */

    all() {

        return this.collections;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.VectorPage = VectorPage;