/*
==========================================================
Easy AI Studio
File    : frontend/js/core/utils.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class Utils {

    uuid() {

        return crypto.randomUUID();

    }

    random(

        min,

        max

    ) {

        return Math.floor(

            Math.random() *

            (max - min + 1)

        ) + min;

    }

    delay(

        milliseconds

    ) {

        return new Promise(

            resolve =>

                setTimeout(

                    resolve,

                    milliseconds

                )

        );

    }

    clone(

        object

    ) {

        return structuredClone(

            object

        );

    }

    capitalize(

        text

    ) {

        if (

            !text

        ) {

            return "";

        }

        return (

            text.charAt(

                0

            ).toUpperCase() +

            text.slice(

                1

            )

        );

    }

    formatDate(

        date = new Date()

    ) {

        return new Date(

            date

        ).toLocaleString();

    }

    formatBytes(

        bytes,

        decimals = 2

    ) {

        if (

            bytes === 0

        ) {

            return "0 Bytes";

        }

        const size =

            [

                "Bytes",

                "KB",

                "MB",

                "GB",

                "TB"

            ];

        const index = Math.floor(

            Math.log(

                bytes

            ) /

            Math.log(

                1024

            )

        );

        return (

            parseFloat(

                (

                    bytes /

                    Math.pow(

                        1024,

                        index

                    )

                ).toFixed(

                    decimals

                )

            ) +

            " " +

            size[index]

        );

    }

    debounce(

        callback,

        delay

    ) {

        let timer;

        return (

            ...args

        ) => {

            clearTimeout(

                timer

            );

            timer = setTimeout(

                () =>

                    callback(

                        ...args

                    ),

                delay

            );

        };

    }

    throttle(

        callback,

        limit

    ) {

        let waiting = false;

        return (

            ...args

        ) => {

            if (

                waiting

            ) {

                return;

            }

            callback(

                ...args

            );

            waiting = true;

            setTimeout(

                () => {

                    waiting = false;

                },

                limit

            );

        };

    }

    download(

        filename,

        content,

        type =

            "text/plain"

    ) {

        const blob =

            new Blob(

                [

                    content

                ],

                {

                    type

                }

            );

        const url =

            URL.createObjectURL(

                blob

            );

        const link =

            document.createElement(

                "a"

            );

        link.href =

            url;

        link.download =

            filename;

        link.click();

        URL.revokeObjectURL(

            url

        );

    }

}

const UtilsService =

    new Utils();

window.Utils =

    UtilsService;