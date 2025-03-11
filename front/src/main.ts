import './assets/main.css'
import 'vuetify/styles';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { fr } from 'vuetify/locale';
import { VSnackbarQueue } from 'vuetify/labs/VSnackbarQueue'

import App from './App.vue'
import router from './router'

const themePerso = {
    "dark": false,
    "colors": {
      "background": "#F4F8FC",
      "primary": "#085880",
      "surface": "#001961",
      "secondary": "#B6A227",
      "error": "#CE0F32",
      "info": "#1B73B9",
      "success": "#1C7B20",
      "warning": "#AF6A13"
    }
  };

const vuetify = createVuetify({
    components: {
        ...components,
        VSnackbarQueue
    },
    directives,
    theme: {
        defaultTheme: 'themePerso',
        themes: {
            themePerso: themePerso
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
