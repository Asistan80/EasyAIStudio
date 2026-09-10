/* ==========================================================
   Easy AI Studio
   File: frontend/js/ttsManager.js
   Version: 1.0.0
   Sprint: 6 - Text To Speech Manager
   ========================================================== */

"use strict";

/* ==========================================================
   Text To Speech Manager
   ========================================================== */

const TTSManager = {

    engine: "browser",

    language: "tr-TR",

    voice: null,

    rate: 1,

    pitch: 1,

    volume: 1,

    speaking: false,

    /* ======================================================
       Initialize
       ====================================================== */

    init() {

        this.loadVoices();

        console.log(

            "TTS Manager Ready"

        );

    },

    /* ======================================================
       Load Voices
       ====================================================== */

    loadVoices() {

        const update = () => {

            const voices =

                speechSynthesis.getVoices();

            this.voice =

                voices.find(

                    voice =>

                    voice.lang === this.language

                ) ||

                voices[0] ||

                null;

        };

        update();

        speechSynthesis.onvoiceschanged = update;

    },

    /* ======================================================
       Speak
       ====================================================== */

    speak(text) {

        if (!text) {

            return;

        }

        speechSynthesis.cancel();

        const utterance =

            new SpeechSynthesisUtterance(

                text

            );

        utterance.lang = this.language;

        utterance.voice = this.voice;

        utterance.rate = this.rate;

        utterance.pitch = this.pitch;

        utterance.volume = this.volume;

        utterance.onstart = () => {

            this.speaking = true;

            EventBus.emit(

                "tts.started"

            );

        };

        utterance.onend = () => {

            this.speaking = false;

            EventBus.emit(

                "tts.finished"

            );

        };

        speechSynthesis.speak(

            utterance

        );

    },

    /* ======================================================
       Pause
       ====================================================== */

    pause() {

        speechSynthesis.pause();

    },

    /* ======================================================
       Resume
       ====================================================== */

    resume() {

        speechSynthesis.resume();

    },

    /* ======================================================
       Stop
       ====================================================== */

    stop() {

        speechSynthesis.cancel();

        this.speaking = false;

    },

    /* ======================================================
       Settings
       ====================================================== */

    configure(options = {}) {

        this.language =

            options.language ??

            this.language;

        this.rate =

            options.rate ??

            this.rate;

        this.pitch =

            options.pitch ??

            this.pitch;

        this.volume =

            options.volume ??

            this.volume;

    }

};

/* ==========================================================
   Global
   ========================================================== */

window.TTSManager = TTSManager;