/*
==========================================================
Easy AI Studio
File    : frontend/js/core/eventBus.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class EventBus {

    constructor() {

        this.events = {};

    }

    on(

        event,

        callback

    ) {

        if (

            !this.events[event]

        ) {

            this.events[event] = [];

        }

        this.events[event].push(

            callback

        );

    }

    once(

        event,

        callback

    ) {

        const wrapper = (

            data

        ) => {

            callback(

                data

            );

            this.off(

                event,

                wrapper

            );

        };

        this.on(

            event,

            wrapper

        );

    }

    off(

        event,

        callback

    ) {

        if (

            !this.events[event]

        ) {

            return;

        }

        this.events[event] =

            this.events[event].filter(

                listener =>

                    listener !== callback

            );

    }

    emit(

        event,

        data = null

    ) {

        if (

            !this.events[event]

        ) {

            return;

        }

        this.events[event].forEach(

            listener => {

                try {

                    listener(

                        data

                    );

                }

                catch (

                    error

                ) {

                    console.error(

                        "EventBus Error",

                        error

                    );

                }

            }

        );

    }

    clear(

        event = null

    ) {

        if (

            event

        ) {

            delete this.events[event];

            return;

        }

        this.events = {};

    }

    listeners(

        event

    ) {

        return (

            this.events[event] ||

            []

        );

    }

    has(

        event

    ) {

        return (

            event in

            this.events

        );

    }

    count(

        event

    ) {

        if (

            !this.events[event]

        ) {

            return 0;

        }

        return this.events[event]

            .length;

    }

}

const EventBusService =

    new EventBus();

window.EventBus =

    EventBusService;