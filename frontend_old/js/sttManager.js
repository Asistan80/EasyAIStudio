/* ==========================================================
   Easy AI Studio
   File: frontend/js/sttManager.js
   Version: 1.0.0
   Sprint: 6 - Speech To Text Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Speech To Text Manager
   ========================================================== */

const STTManager = {

    recognition: null,

    language: "tr-TR",

    continuous: false,

    interimResults: true,

    listening: false,

    transcript: "",

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.createRecognizer();

        console.log(

            "STT Manager Ready"

        );

    },

    /* ======================================================
       Create Recognizer
       ====================================================== */

    createRecognizer() {

        const Recognition =

            window.SpeechRecognition ||

            window.webkitSpeechRecognition;

        if (!Recognition) {

            console.warn(

                "Speech Recognition not supported."

            );

            return;

        }

        this.recognition = new Recognition();

        this.recognition.lang = this.language;

        this.recognition.continuous = this.continuous;

        this.recognition.interimResults = this.interimResults;

        this.recognition.onstart = () => {

            this.listening = true;

            EventBus.emit(

                "stt.started"

            );

        };

        this.recognition.onend = () => {

            this.listening = false;

            EventBus.emit(

                "stt.stopped"

            );

        };

        this.recognition.onresult = event => {

            let text = "";

            for (

                let i = event.resultIndex;

                i < event.results.length;

                i++

            ) {

                text +=

                    event.results[i][0]

                    .transcript;

            }

            this.transcript = text;

            EventBus.emit(

                "stt.result",

                text

            );

        };

        this.recognition.onerror = error => {

            EventBus.emit(

                "stt.error",

                error

            );

        };

    },

    /* ======================================================
       Start
       ====================================================== */

    start() {

        if (

            this.recognition &&

            !this.listening

        ) {

            this.recognition.start();

        }

    },

    /* ======================================================
       Stop
       ====================================================== */

    stop() {

        if (

            this.recognition &&

            this.listening

        ) {

            this.recognition.stop();

        }

    },

    /* ======================================================
       Configure
       ====================================================== */

    configure(options = {}) {

        this.language =

            options.language ??

            this.language;

        this.continuous =

            options.continuous ??

            this.continuous;

        this.interimResults =

            options.interimResults ??

            this.interimResults;

        this.createRecognizer();

    },

    /* ======================================================
       Transcript
       ====================================================== */

    getTranscript() {

        return this.transcript;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.STTManager = STTManager;