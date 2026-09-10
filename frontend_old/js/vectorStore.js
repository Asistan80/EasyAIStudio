/* ==========================================================
   Easy AI Studio
   File: frontend/js/vectorStore.js
   Version: 1.0.0
   Sprint: 6 - Vector Store
   ========================================================== */

"use strict";

/* ==========================================================
   Vector Store
   ========================================================== */

const VectorStore = {

    storageKey: "vector-store",

    collections: [],

    activeCollection: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Vector Store Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.collections = Storage.get(

            this.storageKey,

            []

        );

    },

    /* ======================================================
       Save
       ====================================================== */

    save() {

        Storage.set(

            this.storageKey,

            this.collections

        );

    },

    /* ======================================================
       Create Collection
       ====================================================== */

    create(name) {

        const collection = {

            id: Utils.uuid(),

            name,

            vectors: [],

            created: Utils.now(),

            updated: Utils.now()

        };

        this.collections.push(

            collection

        );

        this.save();

        return collection;

    },

    /* ======================================================
       Add Vector
       ====================================================== */

    add(collectionId, vector = {}) {

        const collection =

            this.get(collectionId);

        if (!collection) {

            return;

        }

        collection.vectors.push({

            id: Utils.uuid(),

            ...vector

        });

        collection.updated =

            Utils.now();

        this.save();

    },

    /* ======================================================
       Remove Vector
       ====================================================== */

    removeVector(collectionId, vectorId) {

        const collection =

            this.get(collectionId);

        if (!collection) {

            return;

        }

        collection.vectors =

            collection.vectors.filter(

                item =>

                item.id !== vectorId

            );

        collection.updated =

            Utils.now();

        this.save();

    },

    /* ======================================================
       Open Collection
       ====================================================== */

    open(id) {

        this.activeCollection = id;

        EventBus.emit(

            "vector.collection.changed",

            this.get(id)

        );

    },

    /* ======================================================
       Find Collection
       ====================================================== */

    get(id) {

        return this.collections.find(

            item =>

            item.id === id

        );

    },

    /* ======================================================
       Delete Collection
       ====================================================== */

    delete(id) {

        this.collections =

            this.collections.filter(

                item =>

                item.id !== id

            );

        this.save();

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.collections;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.VectorStore = VectorStore;