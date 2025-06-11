import { defineStore } from "pinia";
import { AuthUser, User } from "../types/types";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("authToken") || "",
    isAuthenticated: !!localStorage.getItem("authToken"), // check if token exists
    user: JSON.parse(localStorage.getItem("authUser") || "{}") as AuthUser, // Get the user data from localStorage
    actualUser: JSON.parse(localStorage.getItem("user") || "{}") as User,
  }),
  actions: {
    setToken(token: string, user: AuthUser, actualUser: User) {
      this.token = token;
      this.user = user;
      this.isAuthenticated = true;

      localStorage.setItem("authToken", token);
      localStorage.setItem("authUser", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(actualUser));
    },
    logout() {
      this.token = "";
      this.user = {} as AuthUser;
      this.isAuthenticated = false;

      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      localStorage.removeItem("user");
    },
  },
});
