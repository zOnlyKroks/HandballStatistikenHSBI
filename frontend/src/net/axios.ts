import axios from "axios";
import { LookbackSettings } from "../views/util/LookbackSettings";

export const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || "http://localhost:3001/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();
  const lookbackValue = LookbackSettings.lastMatches;

  if (lookbackValue != null) {
    if (method && ["post", "put", "patch"].includes(method)) {
      config.data = {
        ...(config.data || {}),
        lookbackTime: lookbackValue,
      };
    } else {
      config.params = {
        ...(config.params || {}),
        lookbackTime: lookbackValue,
      };
    }
  }

  return config;
});
