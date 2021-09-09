export const CONFIG = {
    PORTS: {
        APP: 3000,
        SOCKET: 8000
    },
    TOKEN: {
        EXPIRES_IN: 7*24*60*60*1000 // ONE WEEK
    },
    REFRESH_TOKEN: {
        EXPIRES_IN: 30*24*60*60*1000 // ONE MONTH
    },
    MESSENGER_CODE: {
        EXPIRES_IN: 2000
    },
    SESSION: {
        SECRET: 'B5#9p5WcEPcZSJeSzFm&7Cs',
        COOKIE: {
            MAX_AGE: 60000
        },
        RESAVE: true,
        SAVE_UNINITIALIZED: true,
    },
    FACEBOOK: {
        APP_ID: '',
        APP_SCRET_ID: ''
    },
    GOOGLE: {
        APP_ID: '',
        APP_SCRET_ID: ''
    }
}