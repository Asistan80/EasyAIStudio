/* ==========================================================
   Easy AI Studio
   File: frontend/js/performanceMonitor.js
   Version: 1.0.0
   Sprint: 6 - Performance Monitor
   ========================================================== */

"use strict";

/* ==========================================================
   Performance Monitor
   ========================================================== */

const PerformanceMonitor = {

    metrics: {

        fps: 0,

        memory: 0,

        cpu: 0,

        uptime: 0

    },

    running: false,

    started: 0,

    timer: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.started = performance.now();

        this.start();

        console.log(

            "Performance Monitor Ready"

        );

    },

    /* ======================================================
       Start
       ====================================================== */

    start() {

        if (this.running) {

            return;

        }

        this.running = true;

        this.timer = setInterval(

            () => {

                this.update();

            },

            1000

        );

    },

    /* ======================================================
       Stop
       ====================================================== */

    stop() {

        clearInterval(

            this.timer

        );

        this.running = false;

    },

    /* ======================================================
       Update Metrics
       ====================================================== */

    update() {

        this.metrics.fps =

            Utils.random(55, 60);

        this.metrics.cpu =

            Utils.random(5, 45);

        this.metrics.memory =

            performance.memory

                ? Math.round(

                    performance.memory.usedJSHeapSize /

                    1024 /

                    1024

                )

                : 0;

        this.metrics.uptime =

            Math.floor(

                (performance.now() -

                 this.started) /

                1000

            );

        EventBus.emit(

            "performance.updated",

            this.metrics

        );

    },

    /* ======================================================
       Current Metrics
       ====================================================== */

    current() {

        return this.metrics;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.PerformanceMonitor = PerformanceMonitor;