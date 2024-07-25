// import this after install `@mdi/font` package
import "@mdi/font/css/materialdesignicons.css";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import { LightTheme, DarkTheme } from "@/config/theme.config";

export default defineNuxtPlugin((app) => {
    const vuetify = createVuetify({});
    app.vueApp.use(vuetify);
});
