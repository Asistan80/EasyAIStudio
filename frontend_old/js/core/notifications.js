/*
==========================================================
Easy AI Studio
File    : frontend/js/core/notifications.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class NotificationManager {

    constructor() {

        this.container = null;

        this.duration = 4000;

    }

    initialize() {

        this.container = document.getElementById(

            "notification-container"

        );

        if (

            this.container

        ) {

            return;

        }

        this.container = document.createElement(

            "div"

        );

        this.container.id =

            "notification-container";

        document.body.appendChild(

            this.container

        );

    }

    show(

        message,

        type = "info",

        duration = this.duration

    ) {

        if (

            !this.container

        ) {

            this.initialize();

        }

        const notification = document.createElement(

            "div"

        );

        notification.className =

            "notification notification-" + type;

        notification.textContent =

            message;

        this.container.appendChild(

            notification

        );

        requestAnimationFrame(

            () => {

                notification.classList.add(

                    "show"

                );

            }

        );

        setTimeout(

            () => {

                notification.classList.remove(

                    "show"

                );

                setTimeout(

                    () => {

                        notification.remove();

                    },

                    300

                );

            },

            duration

        );

    }

    success(

        message

    ) {

        this.show(

            message,

            "success"

        );

    }

    error(

        message

    ) {

        this.show(

            message,

            "error"

        );

    }

    warning(

        message

    ) {

        this.show(

            message,

            "warning"

        );

    }

    info(

        message

    ) {

        this.show(

            message,

            "info"

        );

    }

    clear() {

        if (

            this.container

        ) {

            this.container.innerHTML = "";

        }

    }

}

const NotificationService =

    new NotificationManager();

window.Notifications =

    NotificationService;