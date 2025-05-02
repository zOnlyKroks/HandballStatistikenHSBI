<template>
  <div class="home-container">
    <header class="home-header">
      <h1>Welcome to Your Dashboard</h1>
      <button class="logout-btn" @click="handleLogout">Logout</button>
    </header>

    <main class="home-content">
      <section v-if="loading" class="loading">Loading profile...</section>
      <section v-else-if="error" class="error">{{ error }}</section>
      <section v-else-if="player" class="player-card">
        <h2 class="player-title">Player Profile</h2>
        <ul class="player-list">
          <li><span>Name:</span> {{ player.name }}</li>
          <li><span>Email:</span> {{ player.email }}</li>
          <li><span>Role:</span> {{ player.role }}</li>
          <li><span>Position:</span> {{ player.position }}</li>

          <!-- Check for 'age' in both PlayerFull and PlayerPartial -->
          <li v-if="'age' in player">
            <span>Age:</span> {{ player.age }} years
          </li>

          <!-- Check for 'height' in both PlayerFull and PlayerPartial -->
          <li v-if="'height' in player">
            <span>Height:</span> {{ player.height }} cm
          </li>

          <!-- Check for 'jerseyNumber' in both PlayerFull and PlayerPartial -->
          <li v-if="'jerseyNumber' in player">
            <span>Jersey No.:</span> {{ player.jerseyNumber }}
          </li>
        </ul>
      </section>
    </main>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { usePlayerStore } from "../stores/playerStore";
import { PlayerFull, PlayerPartial } from "../interface/interfaces";

export default defineComponent({
  name: "Home",
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    const playerStore = usePlayerStore();
    const loading = ref(true);
    const error = ref("");
    const player = ref<PlayerPartial | PlayerFull | null>(null);

    const fetchPlayer = async () => {
      loading.value = true;
      error.value = "";

      try {
        if (!auth.isAuthenticated || !auth.user?.id) {
          throw new Error("User is not authenticated");
        }

        // Fetch player data directly and get the result
        const playerData = await playerStore.fetchFull(auth.user.id);

        if (playerData) {
          player.value = playerData;
        } else {
          // Fallback to get from store if the direct return didn't work
          const storedPlayer = playerStore.getPlayer(auth.user.id);

          if (!storedPlayer) {
            throw new Error("Player data not found");
          }

          player.value = storedPlayer;
        }
      } catch (err: any) {
        console.error("Failed to fetch player:", err);
        error.value = "Unable to load player data. Please login again.";
        auth.logout();
        router.push("/auth");
      } finally {
        loading.value = false; // Stop loading indicator
      }
    };

    const handleLogout = () => {
      auth.logout();
      router.push("/auth");
    };

    onMounted(() => {
      if (!auth.isAuthenticated) {
        router.push("/auth"); // Redirect to auth page if not authenticated
        return;
      }
      fetchPlayer(); // Fetch player profile after authentication
    });

    return {
      player,
      loading,
      error,
      handleLogout,
    };
  },
});
</script>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  font-family: Arial, sans-serif;
  color: #333;
}

.home-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 12px;
}

.home-header h1 {
  font-size: 28px;
  font-weight: 700;
}

.logout-btn {
  padding: 8px 16px;
  background-color: #e53935;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c62828;
}

.loading,
.error {
  margin-top: 24px;
  font-style: italic;
  text-align: center;
}

.error {
  color: #e53935;
}

.player-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 24px;
}

.player-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #444;
}

.player-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.player-list li {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.player-list li span {
  font-weight: 600;
}
</style>
