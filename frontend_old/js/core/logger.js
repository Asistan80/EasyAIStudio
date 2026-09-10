/*
==========================================================
Easy AI Studio
File    : frontend/js/core/logger.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class Logger {

    constructor() {

        this.logs = [];

        this.maxLogs = 1000;

    }

    add(

        level,

        message,

        data = null

    ) {

        const log = {

            level,

            message,

            data,

            time: new Date().toISOString()

        };

        this.logs.push(

            log

        );

        if (

            this.logs.length >

            this.maxLogs

        ) {

            this.logs.shift();

        }

        switch (

            level

        ) {

            case "info":

                console.info(

                    message,

                    data

                );

                break;

            case "warning":

                console.warn(

                    message,

                    data

                );

                break;

            case "error":

                console.error(

                    message,

                    data

                );

                break;

            case "debug":

                console.debug(

                    message,

                    data

                );

                break;

            default:

                console.log(

                    message,

                    data

                );

        }

    }

    info(

        message,

        data = null

    ) {

        this.add(

            "info",

            message,

            data

        );

    }

    warning(

        message,

        data = null

    ) {

        this.add(

            "warning",

            message,

            data

        );

    }

    error(

        message,

        data = null

    ) {

        this.add(

            "error",

            message,

            data

        );

    }

    debug(

        message,

        data = null

    ) {

        this.add(

            "debug",

            message,

            data

        );

    }

    all() {

        return this.logs;

    }

    latest() {

        if (

            this.logs.length === 0

        ) {

            return null;

        }

        return this.logs[

            this.logs.length - 1

        ];

    }

    count() {

        return this.logs.length;

    }

    clear() {

        this.logs = [];

    }

    export() {

        return JSON.stringify(

            this.logs,

            null,

            4

        );

    }

}

const LoggerService =

    new Logger();

window.Logger =

    LoggerService;