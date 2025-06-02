<template>
  <div class="card">
    <div class="player-info">
      <div class="player-photo">
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
        <span class="photo-label">Spieler-Foto</span>
      </div>
      <div class="player-details">
        <h3 class="player-position-title">Position: {{ player.position }}</h3>
        <div class="player-stats">
          <p>Spiele: {{ player.matches }}</p>
          <p>Tore: {{ player.goals }}</p>
          <p>Assists: {{ player.assists }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Player } from "./types";
import { defineProps } from "vue";

defineProps<{
  player: Player;
}>();
</script>
