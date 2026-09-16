import { createRouter, createWebHistory } from "vue-router";

import MainLayout from "../layouts/MainLayout.vue";

import Dashboard from "../views/Dashboard.vue";
import ImageGeneration from "../views/ImageGeneration.vue";
import Gallery from "../views/Gallery.vue";
import GifStudio from "../views/GifStudio.vue";
import ChatView from "../views/ChatView.vue";
import VideoStudioView from "../views/video/VideoStudioView.vue";
import AiVideoGeneration from "../views/AiVideoGeneration.vue";
import AiSoundGeneration from "../views/AiSoundGeneration.vue";

const routes = [

    {

        path: "/",

        component: MainLayout,

        children: [

            {

                path: "ai-sound",

                name: "AI Sound",

                component: AiSoundGeneration,

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

                path: "ai-video",

                name: "AI Video",

                component: AiVideoGeneration,

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