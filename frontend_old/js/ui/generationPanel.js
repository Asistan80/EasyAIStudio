/*
==========================================================
Easy AI Studio
File    : frontend/js/ui/generationPanel.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class GenerationPanel {

    constructor() {

        this.elements = {};

        this.initialized = false;

    }

    initialize() {

        if (

            this.initialized

        ) {

            return;

        }

        this.cacheElements();

        this.bindEvents();

        this.initialized = true;

    }

    cacheElements() {

        this.elements = {

            prompt:

                document.getElementById(

                    "prompt"

                ),

            negativePrompt:

                document.getElementById(

                    "negativePrompt"

                ),

            model:

                document.getElementById(

                    "model"

                ),

            style:

                document.getElementById(

                    "style"

                ),

            width:

                document.getElementById(

                    "width"

                ),

            height:

                document.getElementById(

                    "height"

                ),

            seed:

                document.getElementById(

                    "seed"

                ),

            generate:

                document.getElementById(

                    "generateButton"

                )

        };

    }

    bindEvents() {

        if (

            this.elements.generate

        ) {

            this.elements.generate.addEventListener(

                "click",

                () =>

                    this.generate()

            );

        }

    }

    async generate() {

        const request = {

            prompt:

                this.elements.prompt?.value ||

                "",

            negativePrompt:

                this.elements.negativePrompt?.value ||

                "",

            model:

                this.elements.model?.value ||

                "",

            style:

                this.elements.style?.value ||

                "",

            width:

                Number(

                    this.elements.width?.value ||

                    1024

                ),

            height:

                Number(

                    this.elements.height?.value ||

                    1024

                ),

            seed:

                this.elements.seed?.value ||

                null

        };

        EventBus.emit(

            "generation:started",

            request

        );

        const result =

            await ImageGenerator.generate(

                request

            );

        if (

            result

        ) {

            GalleryManager.add(

                result

            );

        }

    }

    setPrompt(

        value

    ) {

        if (

            this.elements.prompt

        ) {

            this.elements.prompt.value =

                value;

        }

    }

    clear() {

        Object.values(

            this.elements

        ).forEach(

            element => {

                if (

                    element &&

                    "value" in element

                ) {

                    element.value = "";

                }

            }

        );

    }

}

const GenerationPanelService =

    new GenerationPanel();

window.GenerationPanel =

    GenerationPanelService;