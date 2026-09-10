/* ==========================================================
   Easy AI Studio
   File: frontend/js/ragManager.js
   Version: 1.0.0
   Sprint: 6 - RAG Manager
   ========================================================== */

"use strict";

/* ==========================================================
   RAG Manager
   ========================================================== */

const RAGManager = {

    storageKey: "rag-collections",

    collections: [],

    activeCollection: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "RAG Manager Ready"

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

    create(data = {}) {

        const collection = {

            id: Utils.uuid(),

            name: data.name || "New Collection",

            description: data.description || "",

            documents: [],

            embeddings: [],

            created: Utils.now(),

            updated: Utils.now()

        };

        this.collections.push(

            collection

        );

        this.save();

        Notification.success(

            "Collection created."

        );

        return collection;

    },

    /* ======================================================
       Open Collection
       ====================================================== */

    open(id) {

        const collection = this.get(id);

        if (!collection) {

            return;

        }

        this.activeCollection = id;

        EventBus.emit(

            "rag.collection.changed",

            collection

        );

    },

    /* ======================================================
       Add Document
       ====================================================== */

    addDocument(id, document) {

        const collection = this.get(id);

        if (!collection) {

            return;

        }

        collection.documents.push({

            id: Utils.uuid(),

            ...document

        });

        collection.updated = Utils.now();

        this.save();
    },

    /* ======================================================
       Remove Document
       ====================================================== */

    removeDocument(id, documentId) {

        const collection = this.get(id);

        if (!collection) {

            return;

        }

        collection.documents =

            collection.documents.filter(

                item =>

                item.id !== documentId

            );

        collection.updated = Utils.now();

        this.save();

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

    remove(id) {

        this.collections =

            this.collections.filter(

                item =>

                item.id !== id

            );

        if (

            this.activeCollection === id

        ) {

            this.activeCollection = null;

        }

        this.save();

    },

    /* ======================================================
       All Collections
       ====================================================== */

    all() {

        return this.collections;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.RAGManager = RAGManager;