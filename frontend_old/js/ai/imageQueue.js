/*
==========================================================
Easy AI Studio
File    : frontend/js/ai/imageQueue.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class ImageQueue {

    constructor() {

        this.queue = [];

        this.processing = false;

        this.completed = [];

        this.failed = [];

    }

    add(

        job

    ) {

        this.queue.push(

            job

        );

        EventBus.emit(

            "imageQueue:added",

            job

        );

        if (

            !this.processing

        ) {

            this.process();

        }

    }

    async process() {

        if (

            this.processing

        ) {

            return;

        }

        this.processing = true;

        while (

            this.queue.length > 0

        ) {

            const job =

                this.queue.shift();

            try {

                const result =

                    await ImageGenerator.generate(

                        job

                    );

                this.completed.push(

                    result

                );

                EventBus.emit(

                    "imageQueue:completed",

                    result

                );

            }

            catch (

                error

            ) {

                this.failed.push({

                    job,

                    error

                });

                Logger.error(

                    "Queue generation failed.",

                    error

                );

                EventBus.emit(

                    "imageQueue:failed",

                    job

                );

            }

        }

        this.processing = false;

    }

    clear() {

        this.queue = [];

    }

    clearCompleted() {

        this.completed = [];

    }

    clearFailed() {

        this.failed = [];

    }

    pending() {

        return this.queue;

    }

    completedList() {

        return this.completed;

    }

    failedList() {

        return this.failed;

    }

    size() {

        return this.queue.length;

    }

    isProcessing() {

        return this.processing;

    }

}

const ImageQueueService =

    new ImageQueue();

window.ImageQueue =

    ImageQueueService;