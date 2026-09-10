import { createRouter, createWebHistory } from "vue-router";

import MainLayout from "../layouts/MainLayout.vue";

import Dashboard from "../views/Dashboard.vue";
import ImageGeneration from "../views/ImageGeneration.vue";
import Gallery from "../views/Gallery.vue";
import GifStudio from "../views/GifStudio.vue";
import ChatView from "../views/ChatView.vue";
import VideoStudioView from "../views/video/VideoStudioView.vue";

const routes = [

    {

        path: "/",

        component: MainLayout,

        children: [

            {

                path: "",

                name: "Dashboard",

                component: Dashboard,

            },

            {

                path: "images",

                name: "Images",

                component: ImageGeneration,

            },

            {

                path: "gallery",

                name: "Gallery",

                component: Gallery,

            },

            {

                path: "gif",

                name: "GIF Studio",

                component: GifStudio,

            },

            {

                 path: "video",

                 name: "Video Studio",

                 component: VideoStudioView,

            },

            {

                path: "chat",

                name: "Chat",

                component: ChatView,

            },

        ],

    },

];

const router = createRouter({

    history: createWebHistory(),

    routes,

});

export default router;