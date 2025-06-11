import axios from "axios";

// Base API configuration
export const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || "http://localhost:3001/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
