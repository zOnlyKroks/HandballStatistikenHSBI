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
        <!-- Player View with current player data -->
        <PlayerView v-else :player="store.actualUser" />
      </div>
      <!-- Team View -->
      <TeamView v-else-if="currentView === 'team'" />
      <PlayerManagement v-else-if="currentView === 'management'" />
      <AdminManagement v-else-if="currentView === 'admin'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import PlayerView from "./PlayerView.vue";
import TeamView from "./TeamView.vue";
import { api } from "../net/axios";
import { useAuthStore } from "../stores/authStore";
import PlayerManagement from "./PlayerManagement.vue";
import AdminManagement from "./AdminManagement.vue";

const currentView = ref<"team" | "player" | "management" | "admin">("player");

const store = useAuthStore();

const switchView = (view: "team" | "player" | "management" | "admin") => {
  currentView.value = view;
};

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
