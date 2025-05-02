<template>
  <div class="home-container">
    <div class="home-header">
      <h1>Welcome to Your Dashboard</h1>
      <button class="logout-btn" @click="handleLogout">Logout</button>
    </div>
    <div class="home-content">
      <p>You are now logged in to your account.</p>
      <p>This is a protected page that requires authentication.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

export default defineComponent({
  name: "Home",
  setup() {
    const router = useRouter();

    const handleLogout = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem("authToken");

        if (token) {
          // Call backend logout endpoint to invalidate token
          await axios.post(
            "http://localhost:3001/auth/logout",
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        // Always clear local storage and redirect regardless of API success
        localStorage.removeItem("authToken");
        router.push("/auth");
      }
    };

    return {
      handleLogout,
    };
  },
});
</script>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.home-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.logout-btn {
  padding: 8px 16px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}
.logout-btn:hover {
  background-color: #d32f2f;
}
.home-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
}
</style>
