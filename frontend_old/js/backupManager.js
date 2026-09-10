/* ==========================================================
   Easy AI Studio
   File: frontend/js/backupManager.js
   Version: 1.0.0
   Sprint: 6 - Backup Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Backup Manager
   ========================================================== */

const BackupManager = {

    storageKey: "backup-history",

    backups: [],

    autoBackup: true,

    interval: 24,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.load();

        console.log(

            "Backup Manager Ready"

        );

    },

    /* ======================================================
       Load
       ====================================================== */

    load() {

        this.backups = Storage.get(

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

            this.backups

        );

    },

    /* ======================================================
       Create Backup
       ====================================================== */

    create(data = {}) {

        const backup = {

            id: Utils.uuid(),

            name:

                data.name ||

                "Automatic Backup",

            type:

                data.type ||

                "full",

            size:

                data.size || 0,

            location:

                data.location || "",

            created:

                Utils.now()

        };

        this.backups.unshift(

            backup

        );

        this.save();

        EventBus.emit(

            "backup.created",

            backup

        );

        Notification.success(

            "Backup created."

        );

        return backup;

    },

    /* ======================================================
       Restore Backup
       ====================================================== */

    restore(id) {

        const backup = this.get(id);

        if (!backup) {

            return;

        }

        EventBus.emit(

            "backup.restored",

            backup

        );

    },

    /* ======================================================
       Delete Backup
       ====================================================== */

    remove(id) {

        this.backups =

            this.backups.filter(

                backup =>

                backup.id !== id

            );

        this.save();

    },

    /* ======================================================
       Find Backup
       ====================================================== */

    get(id) {

        return this.backups.find(

            backup =>

            backup.id === id

        );

    },

    /* ======================================================
       Get All
       ====================================================== */

    all() {

        return this.backups;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.BackupManager = BackupManager;