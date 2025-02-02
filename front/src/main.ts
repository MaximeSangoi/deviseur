import './assets/main.css'
import 'vuetify/styles';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { fr } from 'vuetify/locale';


import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'custom',
        themes: {
            custom: {
                dark: false,
                // colors: {
                //     primary: '#E64A19',
                //     'primary-darken-1': '#c85200',
                //     secondary: '#366785',
                //     'background': '#CCCCCC',
                //     //'background': '#263238',
                //     surface: '#6b8ea4',
                //     'surface-bright': '#c85200',
                //     'surface-light': '#c85200',
                //     'surface-variant': '#c85200',
                //     'on-surface-variant': '#EEEEEE',
                // },
                colors: {
                    primary: '#818C78',
                    'primary-darken-1': '#676F60',
                    secondary: '#5C7285',
                    'background': '#CCCCCC',
                    surface: '#E2E0C8',
                    'surface-bright': '#E2E0C8',
                    'surface-light': '#607D8B',
                    'surface-variant': '#607D8B',
                    'on-surface-variant': '#EEEEEE',
                },
            },
        },
    },
    icons: {
        defaultSet: "mdi",
        aliases,
        sets: {
            mdi
        }
    },
    locale: {
        locale: 'fr',
        messages : { fr }
    }
});

const app = createApp(App)

app.use(createPinia());
app.use(router);
app.use(vuetify);

app.mount('#app');
