/*
==========================================================
Easy AI Studio
File    : frontend/js/ai/styleLibrary.js
Version : 1.0.0
Sprint  : 12
==========================================================
*/

class StyleLibrary {

    constructor() {

        this.styles = [

            {
                id: "realistic",
                name: "Realistic",
                prompt: "ultra realistic, highly detailed"
            },

            {
                id: "cinematic",
                name: "Cinematic",
                prompt: "cinematic lighting, dramatic composition"
            },

            {
                id: "anime",
                name: "Anime",
                prompt: "anime style, vibrant colors"
            },

            {
                id: "fantasy",
                name: "Fantasy",
                prompt: "fantasy art, magical atmosphere"
            },

            {
                id: "cyberpunk",
                name: "Cyberpunk",
                prompt: "cyberpunk, neon lights, futuristic city"
            },

            {
                id: "minimal",
                name: "Minimal",
                prompt: "minimal design, clean composition"
            }

        ];

    }

    all() {

        return this.styles;

    }

    find(

        styleId

    ) {

        return this.styles.find(

            style =>

                style.id === styleId

        );

    }

    exists(

        styleId

    ) {

        return (

            this.find(

                styleId

            ) !== undefined

        );

    }

    add(

        style

    ) {

        if (

            this.exists(

                style.id

            )

        ) {

            return false;

        }

        this.styles.push(

            style

        );

        return true;

    }

    update(

        styleId,

        data

    ) {

        const style =

            this.find(

                styleId

            );

        if (

            !style

        ) {

            return false;

        }

        Object.assign(

            style,

            data

        );

        return true;

    }

    remove(

        styleId

    ) {

        this.styles =

            this.styles.filter(

                style =>

                    style.id !==

                    styleId

            );

    }

    clearCustom() {

        this.styles =

            this.styles.filter(

                style =>

                    [

                        "realistic",

                        "cinematic",

                        "anime",

                        "fantasy",

                        "cyberpunk",

                        "minimal"

                    ].includes(

                        style.id

                    )

            );

    }

}

const StyleLibraryService =

    new StyleLibrary();

window.StyleLibrary =

    StyleLibraryService;