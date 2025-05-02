// router.ts
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Home from "@/views/Home.vue";
import Auth from "@/views/Auth.vue";
import { useAuthStore } from "@/stores/authStore"; // Import the auth store

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Root",
    redirect: { name: "Auth" }, // Redirect root to Auth page
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/auth",
    name: "Auth",
    component: Auth,
    props: (route) => ({ defaultTab: route.query.tab || "login" }),
  },
  {
    path: "/login",
    redirect: "/auth",
  },
  {
    path: "/register",
    redirect: { path: "/auth", query: { tab: "register" } },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  // Access the Pinia store
  const auth = useAuthStore();

  // Check if the route requires authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!auth.isAuthenticated) {
      // Redirect to login page if not authenticated
      next({ name: "Auth" });
    } else {
      // Allow access to the route if authenticated
      next();
    }
  } else {
    // Allow access to public routes
    next();
  }
});

export default router;
