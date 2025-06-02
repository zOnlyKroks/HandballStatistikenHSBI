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
                :class="['nav-tab', { active: currentView === 'team' }]"
                @click="switchView('team')"
              >
                Team Overview
              </button>
              <button
                :class="['nav-tab', { active: currentView === 'player' }]"
                @click="switchView('player')"
              >
                Player Details
              </button>

              <button class="nav-tab logout" @click="logout()">Logout</button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <TeamView
        v-if="currentView === 'team'"
        @show-schedule="showSchedule"
        @show-stats="showStats"
        @show-settings="showSettings"
      />
      <PlayerView
        v-else
        @show-schedule="showSchedule"
        @show-stats="showStats"
        @show-settings="showSettings"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import TeamView from "./TeamView.vue";
import PlayerView from "./PlayerView.vue";
import { api } from "../net/axios";

const currentView = ref<"team" | "player">("team");

const switchView = (view: "team" | "player") => {
  currentView.value = view;
};

const logout = () => {
  api
    .post("/auth/logout")
    .then(() => {
      window.location.href = "/auth";
    })
    .catch((error) => {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    });
};

const showSchedule = () => alert("Spielplan functionality");
const showStats = () => alert("Teamstatistik functionality");
const showSettings = () => alert("Einstellungen functionality");
</script>
