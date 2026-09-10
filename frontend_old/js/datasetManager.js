/* ==========================================================
   Easy AI Studio
   File: frontend/js/datasetManager.js
   Version: 1.0.0
   Sprint: 6 - Dataset Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Dataset Manager
   ========================================================== */

const DatasetManager = {

    storageKey: "datasets",

    datasets: [],

    activeDataset: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Dataset Manager Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.datasets = Storage.get(

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

            this.datasets

        );

    },

    /* ======================================================
       Create Dataset
       ====================================================== */

    create(data = {}) {

        const dataset = {

            id: Utils.uuid(),

            name: data.name || "New Dataset",

            description: data.description || "",

            type: data.type || "text",

            records: [],

            tags: [],

            created: Utils.now(),

            updated: Utils.now()

        };

        this.datasets.push(

            dataset

        );

        this.save();

        Notification.success(

            "Dataset created."

        );

        return dataset;

    },

    /* ======================================================
       Open Dataset
       ====================================================== */

    open(id) {

        const dataset = this.get(id);

        if (!dataset) {

            return;

        }

        this.activeDataset = id;

        EventBus.emit(

            "dataset.changed",

            dataset

        );

    },

    /* ======================================================
       Add Record
       ====================================================== */

    addRecord(id, record) {

        const dataset = this.get(id);

        if (!dataset) {

            return;

        }

        dataset.records.push({

            id: Utils.uuid(),

            ...record

        });

        dataset.updated = Utils.now();

        this.save();

    },

    /* ======================================================
       Remove Record
       ====================================================== */

    removeRecord(id, recordId) {

        const dataset = this.get(id);

        if (!dataset) {

            return;

        }

        dataset.records = dataset.records.filter(

            record =>

            record.id !== recordId

        );

        dataset.updated = Utils.now();

        this.save();

    },

    /* ======================================================
       Find Dataset
       ====================================================== */

    get(id) {

        return this.datasets.find(

            dataset =>

            dataset.id === id

        );

    },

    /* ======================================================
       Delete Dataset
       ====================================================== */

    remove(id) {

        this.datasets = this.datasets.filter(

            dataset =>

            dataset.id !== id

        );

        if (

            this.activeDataset === id

        ) {

            this.activeDataset = null;

        }

        this.save();

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.datasets;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.DatasetManager = DatasetManager;