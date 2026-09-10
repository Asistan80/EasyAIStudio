/* ==========================================================
   Easy AI Studio
   File: frontend/js/audioManager.js
   Version: 1.0.0
   Sprint: 6 - Audio Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Audio Manager
   ========================================================== */

const AudioManager = {

    context: null,

    analyser: null,

    gainNode: null,

    mediaRecorder: null,

    stream: null,

    chunks: [],

    recording: false,

    /* ======================================================
       Initialize
       ========================================================== */

    async init() {

        this.context = new (

            window.AudioContext ||

            window.webkitAudioContext

        )();

        this.gainNode =

            this.context.createGain();

        this.analyser =

            this.context.createAnalyser();

        this.gainNode.connect(

            this.analyser

        );

        console.log(

            "Audio Manager Ready"

        );

    },

    /* ======================================================
       Start Recording
       ========================================================== */

    async startRecording() {

        this.stream =

            await navigator.mediaDevices.getUserMedia({

                audio: true

            });

        this.mediaRecorder =

            new MediaRecorder(

                this.stream

            );

        this.chunks = [];

        this.mediaRecorder.ondataavailable =

            event => {

                this.chunks.push(

                    event.data

                );

            };

        this.mediaRecorder.onstop = () => {

            EventBus.emit(

                "audio.recorded",

                this.getRecording()

            );

        };

        this.mediaRecorder.start();

        this.recording = true;

        EventBus.emit(

            "audio.started"

        );

    },

    /* ======================================================
       Stop Recording
       ========================================================== */

    stopRecording() {

        if (

            !this.mediaRecorder ||

            !this.recording

        ) {

            return;

        }

        this.mediaRecorder.stop();

        this.stream

            .getTracks()

            .forEach(

                track =>

                track.stop()

            );

        this.recording = false;

        EventBus.emit(

            "audio.stopped"

        );

    },

    /* ======================================================
       Recording Blob
       ========================================================== */

    getRecording() {

        return new Blob(

            this.chunks,

            {

                type: "audio/webm"

            }

        );

    },

    /* ======================================================
       Play Audio
       ========================================================== */

    play(blob) {

        const audio =

            new Audio(

                URL.createObjectURL(

                    blob

                )

            );

        audio.play();

    },

    /* ======================================================
       Recording Status
       ========================================================== */

    isRecording() {

        return this.recording;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.AudioManager = AudioManager;