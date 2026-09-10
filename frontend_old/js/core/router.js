/*
==========================================================
Easy AI Studio
File    : frontend/js/core/router.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

class Router {

    constructor() {

        this.current = "dashboard";

        this.pages = {};

    }

    initialize() {

        document

            .querySelectorAll(

                "[data-page]"

            )

            .forEach(

                element => {

                    element.addEventListener(

                        "click",

                        () => {

                            const page =

                                element.dataset.page;

                            this.go(

                                page

                            );

                        }

                    );

                }

            );

    }

    go(

        page

    ) {

        this.hideAll();

        this.activateMenu(

            page

        );

        this.showPage(

            page

        );

        this.current = page;

    }

    hideAll() {

        document

            .querySelectorAll(

                ".page"

            )

            .forEach(

                page => {

                    page.style.display =

                        "none";

                }

            );

    }

    showPage(

        page

    ) {

        const element =

            document.getElementById(

                page

            );

        if (

            element

        ) {

            element.style.display =

                "block";

        }

    }

    activateMenu(

        page

    ) {

        document

            .querySelectorAll(

                ".menu-item"

            )

            .forEach(

                item => {

                    item.classList.remove(

                        "active"

                    );

                    if (

                        item.dataset.page === page

                    ) {

                        item.classList.add(

                            "active"

                        );

                    }

                }

            );

    }

    reload() {

        this.go(

            this.current

        );

    }

    currentPage() {

        return this.current;

    }

}

const RouterService =

    new Router();

window.Router =

    RouterService;

document.addEventListener(

    "DOMContentLoaded",

    () => {

        RouterService.initialize();

    }

);