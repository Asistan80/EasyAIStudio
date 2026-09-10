/*
==========================================================
Easy AI Studio
File    : frontend/js/core/constants.js
Version : 1.0.0
Sprint  : 11
==========================================================
*/

const APP_CONSTANTS = Object.freeze({

    NAME:

        "Easy AI Studio",

    SHORT_NAME:

        "EAS",

    VERSION:

        "1.0.0",

    AUTHOR:

        "Easy AI Studio",

    DESCRIPTION:

        "Create. Animate. Share.",

    API_BASE:

        "http://127.0.0.1:8000/api",

    API_TIMEOUT:

        30000,

    DEFAULT_LANGUAGE:

        "en",

    DEFAULT_THEME:

        "dark",

    DEFAULT_PROVIDER:

        "openai",

    DEFAULT_MODEL:

        "gpt-5.5",

    AUTO_SAVE_INTERVAL:

        300000,

    LIVE_UPDATE_INTERVAL:

        5000,

    MAX_HISTORY:

        1000,

    MAX_RECENT_PROJECTS:

        20,

    MAX_UPLOAD_SIZE:

        1024 *

        1024 *

        100,

    IMAGE_FORMATS: [

        "png",

        "jpg",

        "jpeg",

        "webp"

    ],

    VIDEO_FORMATS: [

        "mp4",

        "webm",

        "mov"

    ],

    PROJECT_EXTENSION:

        ".eas",

    SETTINGS_FILE:

        "settings.json"

});

window.APP_CONSTANTS =

    APP_CONSTANTS;