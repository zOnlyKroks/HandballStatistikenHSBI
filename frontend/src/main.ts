import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { api } from "./net/axios";
import "./assets/assets.scss";

const pinia = createPinia();

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount("#app");

import { useAuthStore } from "./stores/authStore";
import router from "./router/router";

const auth = useAuthStore(pinia);

api.interceptors.request.use((config) => {
  if (auth.token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${auth.token}`;
  }
  return config;
});
