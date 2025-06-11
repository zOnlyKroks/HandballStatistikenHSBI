<template>
  <div v-if="player" class="view-container">
    <!-- Header Card -->
    <div class="header-card">
      <div class="header-flex">
        <h1 class="page-title">Spielerprofil</h1>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Player Information Card -->
        <div class="card">
          <h3 class="card-title">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Spielerinformationen
          </h3>

          <div class="player-info">
            <div class="player-photo">
              <div v-if="profileImageLoading" class="photo-loading">
                <svg class="loading-spinner" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                    fill="none"
                    stroke-dasharray="31.416"
                    stroke-dashoffset="31.416"
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      dur="2s"
                      values="0 31.416;15.708 15.708;0 31.416"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-dashoffset"
                      dur="2s"
                      values="0;-15.708;-31.416"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
                <span class="photo-label">Lädt...</span>
              </div>
              <div v-else-if="profileImageUrl" class="photo-container">
                <img
                  :src="profileImageUrl"
                  :alt="`${player.vorname} ${player.nachname}`"
                  class="player-image"
                  @error="handleImageError"
                />
              </div>
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
                <span class="photo-label">Kein Foto</span>
              </div>
            </div>

            <div class="player-details">
              <h2 class="player-position-title">
                {{ player.vorname }} {{ player.nachname }}
              </h2>
              <p>
                <span class="label"> Position: </span>
                {{ player.position }}
              </p>

              <div class="info-list">
                <p>
                  <span class="label">Trikotnummer:</span>
                  {{ player.trikotnummer }}
                </p>
                <p>
                  <span class="label">Körpergröße:</span>
                  {{ player.koerpergroesse }} cm
                </p>
                <p>
                  <span class="label">Geburtsdatum:</span>
                  {{
                    new Date(player.geburtsdatum).toLocaleDateString("de-DE")
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Team Information Card -->
        <div class="card">
          <h3 class="card-title">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Mannschaftsinformationen
          </h3>

          <div class="info-list">
            <p>
              <span class="label">Mannschaft:</span>
              {{ player.mannschaftName }}
            </p>
            <p>
              <span class="label">Spielklasse:</span>
              {{ player.league_name }}
            </p>
            <p class="mt-3">
              <span class="label">Spieler-ID:</span>
              <code style="font-size: 0.75rem; color: #6b7280">{{
                player.uuid
              }}</code>
            </p>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Basic Statistics Card -->
        <div class="card">
          <h3 class="card-title">
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Grundstatistiken
          </h3>

          <div class="stats-grid">
            <div class="stat-card stat-green">
              <p class="stat-label">Spiele</p>
              <p class="stat-value">{{ baseStats?.spiele || 0 }}</p>
              <p class="stat-description">Gesamt gespielt</p>
            </div>

            <div class="stat-card stat-green">
              <p class="stat-label">Würfe</p>
              <p class="stat-value">{{ baseStats?.throws || 0 }}</p>
              <p class="stat-description">Alle Würfe</p>
            </div>

            <div class="stat-card stat-green">
              <p class="stat-label">Tore</p>
              <p class="stat-value">{{ baseStats?.tore || 0 }}</p>
              <p class="stat-description">Gesamt erzielt</p>
            </div>

            <div class="stat-card stat-green">
              <p class="stat-label">Assists</p>
              <p class="stat-value">{{ baseStats?.assists || 0 }}</p>
              <p class="stat-description">Gesamt gegeben</p>
            </div>
          </div>
        </div>

        <!-- Shooting Accuracy Card -->
        <div v-if="accuracy" class="card">
          <h3 class="card-title">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Schussgenauigkeit
          </h3>

          <div class="performance-grid">
            <div class="performance-item performance-blue">
              <p class="performance-label">Gesamte Würfe</p>
              <p class="performance-value">{{ accuracy.gesamtSchuesse }}</p>
            </div>

            <div class="performance-item performance-green">
              <p class="performance-label">Gesamte Tore</p>
              <p class="performance-value">{{ accuracy.schuesseAufZiel }}</p>
            </div>

            <div class="performance-item performance-purple">
              <p class="performance-label">Treffer Genauigkeit</p>
              <p class="performance-value">
                {{ accuracy.genauigkeitProzent }}%
              </p>
            </div>
          </div>

          <div class="mt-4">
            <div class="label mb-2">Trefferquote Visualisierung</div>
            <div
              style="
                background-color: #e5e7eb;
                height: 8px;
                border-radius: 4px;
                overflow: hidden;
              "
            >
              <div
                :style="{
                  width: accuracy.genauigkeitProzent + '%',
                  backgroundColor:
                    accuracy.genauigkeitProzent >= 70
                      ? '#10b981'
                      : accuracy.genauigkeitProzent >= 50
                      ? '#f59e0b'
                      : '#ef4444',
                  height: '100%',
                  transition: 'width 0.3s ease',
                }"
              ></div>
            </div>
            <p class="mt-2" style="font-size: 0.875rem; color: #6b7280">
              {{ accuracyStatus }}
            </p>
          </div>
        </div>

        <div v-else class="card">
          <h3 class="card-title">
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
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            Schussgenauigkeit
          </h3>
          <p class="card-subtitle">Daten werden geladen...</p>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="view-container">
    <div class="card text-center">
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
        <p class="card-subtitle">Einen Moment bitte</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, defineProps } from "vue";
import { usePlayerStore } from "../stores/playerStore";
import { api } from "../net/axios";
import { User } from "../types/types";

const playerStore = usePlayerStore();

const props = defineProps<{
  player?: User;
}>();

const player = computed(() =>
  props.player?.uuid
    ? (playerStore.players.get(props.player.uuid) as User | undefined)
    : undefined
);
const profileImageUrl = ref<string | null>(null);
const profileImageLoading = ref(false);

const baseStats = computed(() => player.value?.statistics || null);
const accuracy = computed(() => player.value?.accuracy || null);

const accuracyStatus = computed(() => {
  if (!accuracy.value) return "";
  const percent = accuracy.value.genauigkeitProzent;
  return percent >= 70
    ? "Hervorragende Genauigkeit"
    : percent >= 50
    ? "Durchschnittliche Genauigkeit"
    : "Verbesserungspotential";
});

const loadProfileImage = async () => {
  if (!props.player?.uuid) return;

  try {
    profileImageLoading.value = true;
    profileImageUrl.value = null;

    const { data } = await api.get(
      `/api/players/${props.player.uuid}/profileImage`
    );
    if (data.success && data.profileImage) {
      profileImageUrl.value = data.profileImage;
    }
  } catch (error) {
    console.error("Profile image load failed:", error);
  } finally {
    profileImageLoading.value = false;
  }
};

const handleImageError = () => {
  profileImageUrl.value = null;
};

onMounted(async () => {
  if (props.player?.uuid) {
    await playerStore.fetchFull(props.player.uuid);
    await Promise.all([
      playerStore.loadBaseStatistics(props.player.uuid),
      playerStore.loadAccuracy(props.player.uuid),
      loadProfileImage(),
    ]);
  }
});

watch(
  () => props.player?.uuid,
  async (newId) => {
    if (newId) {
      await playerStore.fetchFull(newId);
      await playerStore.loadBaseStatistics(newId);
      await playerStore.loadAccuracy(newId);
      await loadProfileImage();
    }
  }
);

watch(
  () => player.value?.uuid,
  async (newUuid) => {
    if (newUuid) {
      await playerStore.fetchFull(newUuid);
      await playerStore.loadBaseStatistics(newUuid);
      await playerStore.loadAccuracy(newUuid);
      await loadProfileImage();
    }
  }
);
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

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 16px;
  color: #374151;
}

.card-subtitle {
  color: #6b7280;
  margin: 0;
}

.icon {
  width: 20px;
  height: 20px;
}

.player-info {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.player-photo {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.photo-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.player-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder,
.photo-loading {
  width: 100%;
  height: 100%;
  background-color: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.player-icon {
  width: 40px;
  height: 40px;
  color: #9ca3af;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  color: #6b7280;
}

.photo-label {
  font-size: 12px;
  color: #6b7280;
  text-align: center;
}

.player-details {
  flex: 1;
}

.player-position-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #111827;
}

.label {
  font-weight: 500;
  color: #374151;
}

.info-list {
  margin-top: 12px;
}

.info-list p {
  margin: 6px 0;
  color: #6b7280;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-card {
  background-color: #f9fafb;
  border-radius: 6px;
  padding: 16px;
  text-align: center;
  border-left: 4px solid;
}

.stat-green {
  border-left-color: #10b981;
}

.stat-red {
  border-left-color: #ef4444;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 4px 0;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.stat-description {
  font-size: 12px;
  color: #9ca3af;
  margin: 4px 0 0 0;
}

.performance-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.performance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 6px;
  background-color: #f9fafb;
  border-left: 4px solid;
}

.performance-blue {
  border-left-color: #3b82f6;
}

.performance-green {
  border-left-color: #10b981;
}

.performance-purple {
  border-left-color: #8b5cf6;
}

.performance-label {
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.performance-value {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.mt-2 {
  margin-top: 8px;
}

.mt-3 {
  margin-top: 12px;
}

.mt-4 {
  margin-top: 16px;
}

.mb-2 {
  margin-bottom: 8px;
}

.text-center {
  text-align: center;
}
</style>
