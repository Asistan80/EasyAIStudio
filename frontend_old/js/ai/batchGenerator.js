/*
==========================================================
Easy AI Studio
File    : frontend/js/ai/batchGenerator.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class BatchGenerator {

    constructor() {

        this.running = false;

        this.currentBatch = null;

        this.results = [];

    }

    async generate(

        options,

        amount = 1

    ) {

        this.running = true;

        this.results = [];

        this.currentBatch = {

            options,

            amount,

            startedAt:

                new Date()

        };

        EventBus.emit(

            "batch:started",

            this.currentBatch

        );

        for (

            let index = 0;

            index < amount;

            index++

        ) {

            const job = {

                ...options,

                batchIndex:

                    index + 1,

                seed:

                    options.seed

                        ? options.seed + index

                        : undefined

            };

            ImageQueue.add(

                job

            );

        }

        this.running = false;

        EventBus.emit(

            "batch:queued",

            this.currentBatch

        );

    }

    addResult(

        result

    ) {

        this.results.push(

            result

        );

    }

    list() {

        return this.results;

    }

    latest() {

        if (

            this.results.length === 0

        ) {

            return null;

        }

        return this.results[

            this.results.length - 1

        ];

    }

    clear() {

        this.results = [];

    }

    current() {

        return this.currentBatch;

    }

    isRunning() {

        return this.running;

    }

    count() {

        return this.results.length;

    }

}

const BatchGeneratorService =

    new BatchGenerator();

window.BatchGenerator =

    BatchGeneratorService;