/*
==========================================================
Easy AI Studio
File    : frontend/js/ai/imageGenerator.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class ImageGenerator {

    constructor() {

        this.isGenerating = false;

        this.currentTask = null;

        this.queue = [];

        this.history = [];

    }

    async generate(

        options

    ) {

        if (

            this.isGenerating

        ) {

            this.queue.push(

                options

            );

            return;

        }

        this.isGenerating = true;

        Loading.show(

            "Generating image..."

        );

        try {

            const response =

                await ImagesAPI.generate(

                    options

                );

            this.currentTask =

                response;

            this.history.push(

                response

            );

            EventBus.emit(

                "image:generated",

                response

            );

            Notifications.success(

                "Image generated successfully."

            );

            return response;

        }

        catch (

            error

        ) {

            Logger.error(

                "Image generation failed.",

                error

            );

            Notifications.error(

                "Image generation failed."

            );

            return null;

        }

        finally {

            this.isGenerating = false;

            Loading.hide();

            await this.next();

        }

    }

    async next() {

        if (

            this.queue.length === 0

        ) {

            return;

        }

        const nextTask =

            this.queue.shift();

        await this.generate(

            nextTask

        );

    }

    async cancel() {

        if (

            !this.currentTask

        ) {

            return;

        }

        await ImagesAPI.cancel(

            this.currentTask.id

        );

        this.isGenerating = false;

        this.currentTask = null;

        EventBus.emit(

            "image:cancelled"

        );

    }

    queueSize() {

        return this.queue.length;

    }

    historyList() {

        return this.history;

    }

    latest() {

        if (

            this.history.length === 0

        ) {

            return null;

        }

        return this.history[

            this.history.length - 1

        ];

    }

    clearHistory() {

        this.history = [];

    }

    generating() {

        return this.isGenerating;

    }

}

const ImageGeneratorService =

    new ImageGenerator();

window.ImageGenerator =

    ImageGeneratorService;