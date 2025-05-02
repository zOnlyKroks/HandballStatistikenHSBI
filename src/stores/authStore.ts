import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("authToken") || "",
    isAuthenticated: !!localStorage.getItem("authToken"), // check if token exists
    user: JSON.parse(localStorage.getItem("authUser") || "{}"), // Get the user data from localStorage
  }),
  actions: {
    setToken(token: string, user: object) {
      this.token = token;
      this.user = user;
      this.isAuthenticated = true;

      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user)); // Store user data in localStorage
    },
    logout() {
      this.token = "";
      this.user = {};
      this.isAuthenticated = false;

      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser"); // Remove user data from localStorage
    },
  },
});
