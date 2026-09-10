/*
==========================================================
Easy AI Studio
File    : frontend/js/ai/promptEngine.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class PromptEngine {

    constructor() {

        this.prompt = "";

        this.negativePrompt = "";

        this.styles = [];

        this.variables = {};

    }

    setPrompt(

        prompt

    ) {

        this.prompt =

            prompt.trim();

    }

    getPrompt() {

        return this.prompt;

    }

    setNegativePrompt(

        prompt

    ) {

        this.negativePrompt =

            prompt.trim();

    }

    getNegativePrompt() {

        return this.negativePrompt;

    }

    addStyle(

        style

    ) {

        if (

            !this.styles.includes(

                style

            )

        ) {

            this.styles.push(

                style

            );

        }

    }

    removeStyle(

        style

    ) {

        this.styles =

            this.styles.filter(

                item =>

                    item !== style

            );

    }

    clearStyles() {

        this.styles = [];

    }

    getStyles() {

        return this.styles;

    }

    setVariable(

        key,

        value

    ) {

        this.variables[key] =

            value;

    }

    getVariable(

        key

    ) {

        return this.variables[key];

    }

    build() {

        let result =

            this.prompt;

        Object.entries(

            this.variables

        ).forEach(

            ([

                key,

                value

            ]) => {

                result =

                    result.replaceAll(

                        "{" +

                        key +

                        "}",

                        value

                    );

            }

        );

        if (

            this.styles.length >

            0

        ) {

            result +=

                ", " +

                this.styles.join(

                    ", "

                );

        }

        return {

            prompt:

                result,

            negativePrompt:

                this.negativePrompt

        };

    }

    clear() {

        this.prompt = "";

        this.negativePrompt = "";

        this.styles = [];

        this.variables = {};

    }

}

const PromptEngineService =

    new PromptEngine();

window.PromptEngine =

    PromptEngineService;