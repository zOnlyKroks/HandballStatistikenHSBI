<template>
  <div class="dashboard-container">
    <nav class="navbar">
      <div class="nav-content">
        <div class="nav-flex">
          <div class="nav-left">
            <div class="logo">
              <h1 class="logo-text">Sports Team Manager</h1>
            </div>
            <div class="nav-tabs">
              <button
                :class="['nav-tab', { active: currentView === 'player' }]"
                @click="switchView('player')"
              >
                Spielerprofil
              </button>
              <button
                :class="['nav-tab', { active: currentView === 'team' }]"
                @click="switchView('team')"
              >
                Mannschaft
              </button>
              <button
                v-if="authUserIsTrainer()"
                :class="['nav-tab', { active: currentView === 'management' }]"
                @click="switchView('management')"
              >
                Spielerverwaltung
              </button>
              <button
                v-if="authUserIsAdmin()"
                :class="['nav-tab', { active: currentView === 'admin' }]"
                @click="switchView('admin')"
              >
                Admin
              </button>
              <button class="nav-tab logout" @click="logout()">Logout</button>
              <div class="nav-dropdown">
                <select
                  v-model="selectedOption"
                  class="form-control nav-select"
                  @change="updateMatchCountAndReload"
                >
                  <option value="option1">Letztes Spiel</option>
                  <option value="option2">Letzte 2 Spiele</option>
                  <option value="option3">Letzte 5 Spiele</option>
                  <option value="option4">Letzte 10 Spiele</option>
                  <option value="option5">Alle Spiele</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <div v-if="currentView === 'player'">
        <div v-if="!store.actualUser" class="view-container">
          <div class="card text-center">
            <div style="padding: 2rem">
              <svg
                class="icon"
                style="
                  width: 3rem;
                  height: 3rem;
                  margin: 0 auto 1rem;
                  color: #9ca3af;
                "
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
        <PlayerView
          v-else
          :key="`player-${viewKey}-${lookbackVersion}`"
          :player="store.actualUser"
        />
      </div>
      <TeamView
        v-else-if="currentView === 'team'"
        :key="`team-${viewKey}-${lookbackVersion}`"
      />
      <PlayerManagement
        v-else-if="currentView === 'management'"
        :key="`management-${viewKey}-${lookbackVersion}`"
      />
      <AdminManagement
        v-else-if="currentView === 'admin'"
        :key="`admin-${viewKey}-${lookbackVersion}`"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import PlayerView from "./PlayerView.vue";
import TeamView from "./TeamView.vue";
import { api } from "../net/axios";
import { useAuthStore } from "../stores/authStore";
import PlayerManagement from "./PlayerManagement.vue";
import AdminManagement from "./AdminManagement.vue";
import { LookbackSettings } from "./util/LookbackSettings";
import { usePlayerStore } from "../stores/playerStore";

const selectedOption = ref<
  "option1" | "option2" | "option3" | "option4" | "option5"
>("option1");
const currentView = ref<"team" | "player" | "management" | "admin">("player");
const lookbackVersion = ref(0);
const viewKey = ref(0);
const store = useAuthStore();
const playerStore = usePlayerStore();

const switchView = (view: "team" | "player" | "management" | "admin") => {
  if (currentView.value !== view) {
    viewKey.value++;
  }
  currentView.value = view;
};

const updateMatchCountAndReload = () => {
  const map = {
    option1: 1,
    option2: 2,
    option3: 5,
    option4: 10,
    option5: 9999,
  };

  LookbackSettings.lastMatches = map[selectedOption.value] || 1;

  playerStore.clear();

  lookbackVersion.value++;
};

watch(lookbackVersion, () => {
  viewKey.value++;
});

const authUserIsTrainer = () => {
  return store.actualUser.position_id === 8;
};

const authUserIsAdmin = () => {
  return store.actualUser.isAdmin;
};

const logout = () => {
  api
    .post("/auth/logout")
    .then(() => {
      window.location.href = "/login";
    })
    .catch((error) => {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    });
};
</script>
