/* ==========================================================
   Easy AI Studio
   File: frontend/js/speechManager.js
   Version: 1.0.0
   Sprint: 6 - Speech Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Speech Manager
   ========================================================== */

const SpeechManager = {

    recognition: null,

    synthesis: window.speechSynthesis,

    listening: false,

    speaking: false,

    language: "tr-TR",

    voice: null,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.initializeRecognition();

        this.loadVoices();

        console.log(

            "Speech Manager Ready"

        );

    },

    /* ======================================================
       Speech Recognition
       ====================================================== */

    initializeRecognition() {

        const Recognition =

            window.SpeechRecognition ||

            window.webkitSpeechRecognition;

        if (!Recognition) {

            return;

        }

        this.recognition = new Recognition();

        this.recognition.lang = this.language;

        this.recognition.continuous = false;

        this.recognition.interimResults = false;

        this.recognition.onstart = () => {

            this.listening = true;

            EventBus.emit(

                "speech.listening"

            );

        };

        this.recognition.onend = () => {

            this.listening = false;

            EventBus.emit(

                "speech.stopped"

            );

        };

        this.recognition.onresult = event => {

            const text =

                event.results[0][0].transcript;

            EventBus.emit(

                "speech.result",

                text

            );

        };

    },

    /* ======================================================
       Voices
       ====================================================== */

    loadVoices() {

        const update = () => {

            const voices =

                this.synthesis.getVoices();

            this.voice =

                voices.find(

                    item =>

                    item.lang === this.language

                ) ||

                voices[0] ||

                null;

        };

        update();

        this.synthesis.onvoiceschanged = update;

    },

    /* ======================================================
       Start Listening
       ====================================================== */

    start() {

        if (

            this.recognition

        ) {

            this.recognition.start();

        }

    },

    /* ======================================================
       Stop Listening
       ====================================================== */

    stop() {

        if (

            this.recognition

        ) {

            this.recognition.stop();

        }

    },

    /* ======================================================
       Speak
       ====================================================== */

    speak(text) {

        if (!text) {

            return;

        }

        const utterance =

            new SpeechSynthesisUtterance(

                text

            );

        utterance.lang = this.language;

        utterance.voice = this.voice;

        utterance.onstart = () => {

            this.speaking = true;

        };

        utterance.onend = () => {

            this.speaking = false;

        };

        this.synthesis.speak(

            utterance

        );

    },

    /* ======================================================
       Cancel Speech
       ====================================================== */

    cancel() {

        this.synthesis.cancel();

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.SpeechManager = SpeechManager;