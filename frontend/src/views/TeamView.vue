<template>
  <div class="view-container">
    <!-- Header Card -->
    <div class="header-card">
      <div class="header-flex">
        <h1 class="page-title">Mannschaftsübersicht</h1>
        <p class="team-name">{{ getTeamName() }}</p>
      </div>
    </div>

    <!-- Team Statistics -->
    <div class="stats-grid">
      <div class="stat-card stat-green">
        <p class="stat-label">Tore</p>
        <p class="stat-value">{{ teamStats.totalGoals }}</p>
      </div>
      <div class="stat-card stat-blue">
        <p class="stat-label">Assists</p>
        <p class="stat-value">{{ teamStats.totalAssists }}</p>
      </div>
      <div class="stat-card stat-red">
        <p class="stat-label">Spiele</p>
        <p class="stat-value">{{ teamStats.totalGames }}</p>
      </div>
    </div>

    <!-- Players List -->
    <div class="card">
      <h3 class="card-title">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Spielerliste
      </h3>

      <div v-if="loading" class="status-message text-center">
        Spielerdaten werden geladen...
      </div>

      <div v-else class="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Trikotnummer</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(player, index) in teamMembers"
              :key="player.uuid"
              class="player-row"
              @click="selectPlayer(index)"
            >
              <td>
                <div class="player-info">
                  <div class="player-photo">
                    <img
                      v-if="player.profileImage"
                      :src="getProfileImageUrl(player.profileImage)"
                      :alt="`${player.vorname} ${player.nachname}`"
                      class="player-image-thumb"
                      @error="handleImageError($event, player)"
                    />
                    <svg
                      v-else
                      class="player-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div class="player-name">
                    {{ player.vorname }} {{ player.nachname }}
                  </div>
                </div>
              </td>
              <td>{{ player.position }}</td>
              <td>{{ player.trikotnummer }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Player Detail View -->
    <div v-if="selectedPlayer" class="mt-8">
      <div class="header-flex mb-4">
        <h2 class="page-title">Spielerprofil</h2>
        <button class="btn btn-secondary" @click="closePlayerView">
          <svg
            class="icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Zurück zur Mannschaftsübersicht
        </button>
      </div>
      <PlayerView :key="selectedPlayerKey" :player="selectedPlayer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import PlayerView from "./PlayerView.vue";
import { useAuthStore } from "../stores/authStore";
import type { User } from "../types/types";
import { usePlayerStore } from "../stores/playerStore";

const store = useAuthStore();
const playerStore = usePlayerStore();
const loading = ref(true);
const selectedPlayer = ref<User | null>(null);
const selectedPlayerKey = ref(Date.now());
const teamMembers = ref<User[]>([]);
const teamStats = ref({
  totalGoals: 0,
  totalAssists: 0,
  totalGames: 0,
});

const getTeamName = () => {
  return store.actualUser.mannschaftName || "Unbekannt";
};

function getProfileImageUrl(imageData: unknown) {
  if (!imageData) return "";
  // Ensure we have a string to call startsWith on
  const dataStr = typeof imageData === "string" ? imageData : "";

  if (dataStr.startsWith("data:image")) {
    return dataStr;
  }
  // Fallback: assume base64 JPEG data
  return `data:image/jpeg;base64,${dataStr}`;
}

const handleImageError = (e: Event, player: User) => {
  const img = e.target as HTMLImageElement;
  img.src = "";
  player.profileImage = "";
};

onMounted(async () => {
  try {
    teamMembers.value = await playerStore.getTeamMembers(
      store.actualUser.mannschaftId
    );

    teamStats.value = {
      totalGoals: teamMembers.value.reduce((sum: number, p: User) => {
        const goals = parseInt(p.statistics?.tore?.toString() || "0", 10);
        return sum + (isNaN(goals) ? 0 : goals);
      }, 0),
      totalAssists: teamMembers.value.reduce((sum: number, p: User) => {
        const assists = parseInt(p.statistics?.assists?.toString() || "0", 10);
        return sum + (isNaN(assists) ? 0 : assists);
      }, 0),
      totalGames: Math.max(
        ...teamMembers.value.map((p: User) => {
          const games = parseInt(p.statistics?.spiele?.toString() || "0", 10);
          return isNaN(games) ? 0 : games;
        })
      ),
    };
  } catch (error) {
    console.error("Error loading team members:", error);
  } finally {
    loading.value = false;
  }
});

const selectPlayer = (index: number) => {
  selectedPlayer.value = null;
  nextTick(() => {
    selectedPlayer.value = {
      ...teamMembers.value[index],
    };
    selectedPlayerKey.value = Date.now();
  });
};

const closePlayerView = () => {
  selectedPlayer.value = null;
};
</script>

<style scoped>
.view-container {
  padding: 1rem;
}

.header-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.team-name {
  font-size: 1.25rem;
  color: #4b5563;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  border-left: 4px solid #10b981;
}

.stat-green {
  border-left-color: #10b981;
}

.stat-green .stat-value {
  color: #10b981;
}

.stat-blue {
  border-left-color: #3b82f6;
}

.stat-blue .stat-value {
  color: #3b82f6;
}

.stat-purple {
  border-left-color: #8b5cf6;
}

.stat-purple .stat-value {
  color: #8b5cf6;
}

.stat-red {
  border-left-color: #ef4444;
}

.stat-red .stat-value {
  color: #ef4444;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.card {
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
}

.status-message {
  padding: 2rem;
  color: #6b7280;
}

.player-image-thumb {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.player-row {
  cursor: pointer;
  transition: all 0.2s ease;
}

.player-row:hover {
  background-color: #f5f7fb;
}

.player-row:active {
  transform: translateY(1px);
}

.player-photo {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  transition: all 0.2s ease;
}

.player-row:hover .player-photo {
  border-color: #3b82f6;
  transform: scale(1.05);
}

.player-icon {
  width: 24px;
  height: 24px;
  color: #9ca3af;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.player-name {
  font-weight: 500;
  transition: color 0.2s ease;
}

.player-row:hover .player-name {
  color: #3b82f6;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th,
td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: 500;
  text-align: center;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-secondary:hover {
  background-color: #e5e5e5;
}

.mt-8 {
  margin-top: 2rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.overflow-x-auto {
  overflow-x: auto;
}

.text-center {
  text-align: center;
}
</style>
