import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router";
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

createApp(App).use(router).mount("#app");
