import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
console.log("MAIN.JS ÇALIŞTI");
console.table(

    router.getRoutes().map(route => ({

        name: route.name,

        path: route.path

    }))

);

const app = createApp(App);

app.use(createPinia());

app.use(router);

app.mount("#app");