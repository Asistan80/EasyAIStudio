<template>

    <div class="video-studio">

        <!-- ======================================================
             TOP TOOLBAR
        ====================================================== -->

        <header class="video-studio-toolbar">

            <Toolbar
                @open-export="openExportPanel"
            />

        </header>


        <!-- ======================================================
             MAIN WORKSPACE
        ====================================================== -->

        <section class="video-studio-workspace">

            <!-- LEFT PANEL -->

            <aside class="video-studio-left-panel">

                <MediaLibrary />

            </aside>


            <!-- CENTER PREVIEW -->

            <main class="video-studio-center-panel">

                <PreviewCanvas />

            </main>


            <!-- RIGHT INSPECTOR -->

            <aside class="video-studio-right-panel">

                <Inspector
                    @open-export="openExportPanel"
                />

            </aside>

        </section>


        <!-- ======================================================
             TRANSITION LIBRARY
        ====================================================== -->

        <section class="video-studio-transition-panel">

            <button
                class="transition-panel-toggle"
                type="button"
                :aria-expanded="showTransitionLibrary"
                aria-controls="transition-library-panel"
                @click="
                    showTransitionLibrary =
                        !showTransitionLibrary
                "
            >

                <span>
                    Transitions
                </span>

                <span
                    class="transition-panel-toggle-icon"
                    aria-hidden="true"
                >
                    {{
                        showTransitionLibrary
                            ? "⌃"
                            : "⌄"
                    }}
                </span>

            </button>


            <div
                v-if="showTransitionLibrary"
                id="transition-library-panel"
                class="transition-library-panel-content"
            >

                <TransitionLibrary />

            </div>

        </section>


        <!-- ======================================================
             TIMELINE
        ====================================================== -->

        <section class="video-studio-timeline">

            <Timeline />

        </section>


        <!-- ======================================================
             STATUS BAR
        ====================================================== -->

        <footer class="video-studio-status">

            <StatusBar />

        </footer>


        <!-- ======================================================
             EXPORT PANEL
        ====================================================== -->

        <Teleport to="body">

            <div
                v-if="showExportPanel"
                class="export-overlay"
                @click.self="closeExportPanel"
            >

                <div class="export-modal">

                    <button
                        type="button"
                        class="export-close-button"
                        aria-label="Close export panel"
                        @click="closeExportPanel"
                    >
                        ×
                    </button>


                    <ExportPanel />

                </div>

            </div>

        </Teleport>

    </div>

</template>


<script setup>

import {
    ref
} from "vue";


import Toolbar
    from "../../components/video/Toolbar.vue";


import MediaLibrary
    from "../../components/video/MediaLibrary.vue";


import PreviewCanvas
    from "../../components/video/PreviewCanvas.vue";


import Inspector
    from "../../components/video/Inspector.vue";


import Timeline
    from "../../components/video/Timeline.vue";


import StatusBar
    from "../../components/video/StatusBar.vue";


import TransitionLibrary
    from "../../components/video/TransitionLibrary.vue";


import ExportPanel
    from "../../components/video/ExportPanel.vue";


/*
==========================================================
STATE
==========================================================
*/

const showTransitionLibrary = ref(false);

const showExportPanel = ref(false);


/*
==========================================================
EXPORT PANEL
==========================================================
*/

function openExportPanel(){

    showExportPanel.value = true;

}


function closeExportPanel(){

    showExportPanel.value = false;

}


</script>


<style scoped>

.video-studio {

    width: 100%;

    height: 100%;

    min-width: 0;

    min-height: 0;

    display: flex;

    flex-direction: column;

    overflow: hidden;

    background: #111111;

    color: #ffffff;

}


/* ==========================================================
   TOOLBAR
   ========================================================== */

.video-studio-toolbar {

    flex: 0 0 auto;

    width: 100%;

    min-width: 0;

    position: relative;

    z-index: 20;

}


/* ==========================================================
   MAIN WORKSPACE
   ========================================================== */

.video-studio-workspace {

    flex: 1 1 auto;

    min-width: 0;

    min-height: 0;

    width: 100%;

    display: grid;

    grid-template-columns:
        360px
        minmax(0, 1fr)
        320px;

    overflow: hidden;

}


/* ==========================================================
   LEFT PANEL
   ========================================================== */

.video-studio-left-panel {

    min-width: 0;

    min-height: 0;

    height: 100%;

    overflow: auto;

    border-right: 1px solid rgba(
        255,
        255,
        255,
        0.08
    );

    background: #151515;

}


/* ==========================================================
   CENTER PANEL
   ========================================================== */

.video-studio-center-panel {

    min-width: 0;

    min-height: 0;

    overflow: hidden;

    position: relative;

    display: flex;

    align-items: center;

    justify-content: center;

    background: #0d0d0d;

}


/* ==========================================================
   RIGHT PANEL
   ========================================================== */

.video-studio-right-panel {

    min-width: 0;

    min-height: 0;

    overflow: hidden;

    border-left: 1px solid rgba(
        255,
        255,
        255,
        0.08
    );

    background: #151515;

}


/* ==========================================================
   TIMELINE
   ========================================================== */

.video-studio-timeline {

    flex: 0 0 280px;

    min-width: 0;

    min-height: 0;

    width: 100%;

    overflow: hidden;

    border-top: 1px solid rgba(
        255,
        255,
        255,
        0.08
    );

    background: #141414;

}


/* ==========================================================
   TRANSITION LIBRARY
   ========================================================== */

.video-studio-transition-panel {

    flex: 0 0 auto;

    min-width: 0;

    border-top: 1px solid rgba(
        255,
        255,
        255,
        0.08
    );

    background: #151515;

}


.transition-panel-toggle {

    width: 100%;

    height: 38px;

    display: flex;

    align-items: center;

    justify-content: space-between;

    padding: 0 16px;

    border: 0;

    background: #1a1a1a;

    color: #ffffff;

    cursor: pointer;

    font: inherit;

    font-size: 13px;

    font-weight: 600;

}


.transition-panel-toggle:hover {

    background: #242424;

}


.transition-panel-toggle:focus-visible {

    outline: 2px solid #58b4ff;

    outline-offset: -2px;

}


.transition-panel-toggle-icon {

    font-size: 18px;

    line-height: 1;

}


.transition-library-panel-content {

    height: min(440px, 45vh);

    min-height: 0;

    overflow: hidden;

}


/* ==========================================================
   STATUS BAR
   ========================================================== */

.video-studio-status {

    flex: 0 0 auto;

    width: 100%;

    min-width: 0;

    position: relative;

    z-index: 20;

    border-top: 1px solid rgba(
        255,
        255,
        255,
        0.06
    );

    background: #101010;

}


/* ==========================================================
   EXPORT OVERLAY
   ========================================================== */

.export-overlay {

    position: fixed;

    inset: 0;

    z-index: 9999;

    display: flex;

    align-items: center;

    justify-content: center;

    padding: 24px;

    background: rgba(
        0,
        0,
        0,
        0.72
    );

    backdrop-filter: blur(4px);

}


.export-modal {

    position: relative;

    width: min(
        760px,
        94vw
    );

    max-height: 92vh;

    overflow: auto;

    border: 1px solid rgba(
        255,
        255,
        255,
        0.10
    );

    border-radius: 14px;

    background: #151515;

    box-shadow:
        0 24px 80px rgba(
            0,
            0,
            0,
            0.55
        );

}


.export-close-button {

    position: absolute;

    top: 12px;

    right: 12px;

    z-index: 10;

    width: 34px;

    height: 34px;

    display: flex;

    align-items: center;

    justify-content: center;

    border: 0;

    border-radius: 8px;

    background: rgba(
        255,
        255,
        255,
        0.08
    );

    color: #ffffff;

    font-size: 24px;

    line-height: 1;

    cursor: pointer;

}


.export-close-button:hover {

    background: rgba(
        255,
        255,
        255,
        0.16
    );

}


.export-close-button:focus-visible {

    outline: 2px solid #58b4ff;

    outline-offset: 2px;

}


/* ==========================================================
   RESPONSIVE
   ========================================================== */

@media (max-width: 1200px) {

    .video-studio-workspace {

        grid-template-columns:
            240px
            minmax(0, 1fr)
            280px;

    }

}


@media (max-width: 900px) {

    .video-studio-workspace {

        grid-template-columns:
            190px
            minmax(0, 1fr)
            240px;

    }

    .video-studio-timeline {

        flex-basis: 240px;

    }

}


@media (max-width: 720px) {

    .video-studio-workspace {

        grid-template-columns:
            minmax(0, 1fr);

    }

    .video-studio-left-panel,
    .video-studio-right-panel {

        display: none;

    }

    .video-studio-timeline {

        flex-basis: 220px;

    }


    .export-overlay {

        padding: 10px;

        align-items: flex-start;

        padding-top: 5vh;

    }


    .export-modal {

        width: 100%;

        max-height: 90vh;

        border-radius: 10px;

    }

}

</style>