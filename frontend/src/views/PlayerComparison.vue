<template>
  <div class="view-container">
    <!-- Header Card -->
    <div class="header-card">
      <div class="header-flex">
        <h1 class="page-title">Spielervergleich</h1>
      </div>
    </div>

    <!-- Player Selection -->
    <div class="player-selection">
      <div class="player-selector">
        <label>Spieler 1</label>
        <select v-model="selectedPlayer1Id" @change="loadPlayer(1)">
          <option value="">Spieler auswählen...</option>
          <option
            v-for="player in allPlayers"
            :key="player.uuid"
            :value="player.uuid"
          >
            {{ player.vorname }} {{ player.nachname }} ({{
              player.mannschaftName
            }})
          </option>
        </select>
      </div>

      <div class="vs-separator">VS</div>

      <div class="player-selector">
        <label>Spieler 2</label>
        <select v-model="selectedPlayer2Id" @change="loadPlayer(2)">
          <option value="">Spieler auswählen...</option>
          <option
            v-for="player in allPlayers"
            :key="player.uuid"
            :value="player.uuid"
          >
            {{ player.vorname }} {{ player.nachname }} ({{
              player.mannschaftName
            }})
          </option>
        </select>
      </div>
    </div>

    <!-- Comparison Content -->
    <div v-if="player1 && player2" class="comparison-grid">
      <!-- Player Headers -->
      <div class="player-header">
        <div class="player-photo">
          <img
            v-if="player1.profileImage"
            :src="getProfileImageUrl(player1.profileImage)"
            :alt="`${player1.vorname} ${player1.nachname}`"
            class="player-image"
          />
          <div v-else class="photo-placeholder">
            <svg
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
        </div>
        <h2>{{ player1.vorname }} {{ player1.nachname }}</h2>
        <p>{{ player1.position }} | #{{ player1.trikotnummer }}</p>
        <p>{{ player1.mannschaftName }}</p>
      </div>

      <div class="stat-header">Statistik</div>

      <div class="player-header">
        <div class="player-photo">
          <img
            v-if="player2.profileImage"
            :src="getProfileImageUrl(player2.profileImage)"
            :alt="`${player2.vorname} ${player2.nachname}`"
            class="player-image"
          />
          <div v-else class="photo-placeholder">
            <svg
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
        </div>
        <h2>{{ player2.vorname }} {{ player2.nachname }}</h2>
        <p>{{ player2.position }} | #{{ player2.trikotnummer }}</p>
        <p>{{ player2.mannschaftName }}</p>
      </div>

      <!-- Basic Stats -->
      <template v-for="stat in statsToCompare" :key="stat.key">
        <div
          class="stat-value"
          :class="{ 'stat-better': isBetter(player1, player2, stat.key) }"
        >
          {{ getStatValue(player1, stat.key) }}
        </div>

        <div class="stat-name">
          {{ stat.label }}
          <div class="stat-bar-container">
            <div
              class="stat-bar"
              :style="{
                width: statPercentage(player1, player2, stat.key) + '%',
              }"
            ></div>
          </div>
        </div>

        <div
          class="stat-value"
          :class="{ 'stat-better': isBetter(player2, player1, stat.key) }"
        >
          {{ getStatValue(player2, stat.key) }}
        </div>
      </template>
    </div>

    <div v-else-if="loadingPlayers" class="card text-center">
      <div style="padding: 2rem">
        <svg
          class="icon"
          style="width: 3rem; height: 3rem; margin: 0 auto 1rem; color: #9ca3af"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <h3>Spielerdaten werden geladen...</h3>
      </div>
    </div>

    <div v-else class="card text-center">
      <div style="padding: 2rem">
        <svg
          class="icon"
          style="width: 3rem; height: 3rem; margin: 0 auto 1rem; color: #9ca3af"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        <h3>Wähle zwei Spieler zum Vergleichen</h3>
        <p class="card-subtitle">
          Nutze die Dropdown-Menüs oben um Spieler auszuwählen
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../net/axios";
import { usePlayerStore } from "../stores/playerStore";
import type { User } from "../types/types";

const playerStore = usePlayerStore();
const allPlayers = ref<User[]>([]);
const selectedPlayer1Id = ref("");
const selectedPlayer2Id = ref("");
const player1 = ref<User | null>(null);
const player2 = ref<User | null>(null);
const loadingPlayers = ref(false);

const statsToCompare = [
  { key: "tore", label: "Tore", default: 0 },
  { key: "assists", label: "Assists", default: 0 },
  { key: "spiele", label: "Spiele", default: 0 },
  { key: "throws", label: "Würfe", default: 0 },
  { key: "quoteSeven", label: "7m Quote", default: 0 },
  { key: "zeitstrafen", label: "Zeitstrafen", default: 0 },
  { key: "roteKarten", label: "Rote Karten", default: 0 },
  { key: "paradeQuote", label: "Parade Quote", default: 0 },
  { key: "koerpergroesse", label: "Größe (cm)", default: 0 },
  { key: "schuesseAufZiel", label: "Schüsse auf Tor", default: 0 },
  { key: "genauigkeitProzent", label: "Schussgenauigkeit", default: 0 },
];

function getProfileImageUrl(imageData: unknown) {
  if (!imageData) return "";
  const dataStr = typeof imageData === "string" ? imageData : "";
  if (dataStr.startsWith("data:image")) return dataStr;
  return `data:image/jpeg;base64,${dataStr}`;
}

async function fetchAllPlayers() {
  try {
    loadingPlayers.value = true;

    const response = await api.get("/api/users/all");
    const basicPlayers: User[] = response.data;

    const detailedPlayers = await Promise.all(
      basicPlayers.map(async (p) => {
        await playerStore.fetchFull(p.uuid);

        return playerStore.getUser(p.uuid);
      })
    );

    allPlayers.value = detailedPlayers.filter(
      (player): player is User => player !== null
    );
  } catch (error) {
    console.error("Error fetching players:", error);
  } finally {
    loadingPlayers.value = false;
  }
}

async function loadPlayer(playerNum: number) {
  const playerId =
    playerNum === 1 ? selectedPlayer1Id.value : selectedPlayer2Id.value;
  if (!playerId) {
    if (playerNum === 1) player1.value = null;
    else player2.value = null;
    return;
  }

  try {
    loadingPlayers.value = true;
    const player = await playerStore.getUser(playerId);

    if (playerNum === 1) player1.value = player;
    else player2.value = player;
  } catch (error) {
    console.error("Error loading player:", error);
  } finally {
    loadingPlayers.value = false;
  }
}

function getStatValue(player: User, statKey: string) {
  if (player.statistics && statKey in player.statistics) {
    const res = player.statistics[statKey as keyof typeof player.statistics];

    if (res !== undefined && res !== null) {
      return res;
    }

    const defaultKey = statsToCompare.find((stat) => {
      return stat.key.trim().toLowerCase() === statKey.trim().toLowerCase();
    });

    return defaultKey?.default;
  }

  if (player.accuracy && statKey in player.accuracy) {
    return player.accuracy[statKey as keyof typeof player.accuracy];
  }
  if (player[statKey as keyof User] !== undefined) {
    return player[statKey as keyof User];
  }

  return "-";
}

function isBetter(playerA: User, playerB: User, statKey: string) {
  const valueA = parseFloat(getStatValue(playerA, statKey) as any) || 0;
  const valueB = parseFloat(getStatValue(playerB, statKey) as any) || 0;

  const lowerIsBetter = ["zeitstrafen", "roteKarten"].includes(statKey);

  return lowerIsBetter ? valueA < valueB : valueA > valueB;
}

function statPercentage(playerA: User, playerB: User, statKey: string) {
  const valueA = parseFloat(getStatValue(playerA, statKey) as any) || 0;
  const valueB = parseFloat(getStatValue(playerB, statKey) as any) || 0;

  if (valueA === 0 && valueB === 0) return 50;

  const total = valueA + valueB;
  return total > 0 ? (valueA / total) * 100 : 50;
}

onMounted(() => {
  fetchAllPlayers();
});
</script>

<style scoped>
.view-container {
  padding: 20px;
}

.header-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  padding: 20px;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.player-selection {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.player-selector {
  flex: 1;
  min-width: 300px;
  max-width: 400px;
}

.player-selector label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.player-selector select {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
}

.vs-separator {
  font-size: 24px;
  font-weight: bold;
  color: #6b7280;
}

.comparison-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
}

.player-header {
  text-align: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.player-photo {
  width: 120px;
  height: 120px;
  margin: 0 auto 15px;
  border-radius: 50%;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 60px;
  height: 60px;
  color: #9ca3af;
}

.player-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.player-header p {
  margin: 4px 0;
  color: #6b7280;
}

.stat-header {
  text-align: center;
  font-weight: 600;
  font-size: 18px;
  color: #374151;
  padding: 10px;
}

.stat-name {
  text-align: center;
  font-weight: 500;
  padding: 12px 0;
  position: relative;
}

.stat-bar-container {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
}

.stat-bar {
  height: 100%;
  background: #3b82f6;
  transition: width 0.5s ease;
}

.stat-value {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  padding: 15px;
  border-radius: 8px;
  background: #f9fafb;
}

.stat-better {
  background: #d1fae5;
  color: #065f46;
}

.card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-top: 20px;
}

.text-center {
  text-align: center;
}

.card-subtitle {
  color: #6b7280;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .comparison-grid {
    grid-template-columns: 1fr;
  }

  .stat-header {
    display: none;
  }

  .player-selection {
    flex-direction: column;
  }

  .player-selector {
    min-width: 100%;
  }
}
</style>
