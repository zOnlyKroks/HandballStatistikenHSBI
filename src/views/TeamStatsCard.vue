<template>
  <div class="card">
    <h2 class="card-title">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
        />
      </svg>
      Mannschaftsinfo
    </h2>
    <div class="info-list">
      <p>
        <span class="label">Tore Gesamt:</span> {{ teamData.stats.goalsFor }}
      </p>
      <p>
        <span class="label">Tore Gegen:</span> {{ teamData.stats.goalsAgainst }}
      </p>
      <p><span class="label">Tore Med:</span> {{ goalAverage }}</p>
      <p><span class="label">Tore Abtn:</span> {{ goalsAgainstAverage }}</p>
      <p><span class="label">Punkte:</span> {{ totalPoints }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { defineProps } from "vue";
import { TeamData } from "./types";

const props = defineProps<{
  teamData: TeamData;
}>();

const goalAverage = computed(() =>
  (props.teamData.stats.goalsFor / props.teamData.stats.totalGames).toFixed(1)
);

const goalsAgainstAverage = computed(() =>
  (props.teamData.stats.goalsAgainst / props.teamData.stats.totalGames).toFixed(
    1
  )
);

const totalPoints = computed(
  () => props.teamData.stats.wins * 3 + props.teamData.stats.draws
);
</script>
