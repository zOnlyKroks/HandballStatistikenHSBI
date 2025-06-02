<template>
  <div class="view-container">
    <div class="content-grid">
      <div class="left-column">
        <TeamStatsCard :team-data="teamData" />
        <TrainingScheduleCard />
      </div>
      <div class="space-y-6 right-column">
        <PerformanceCharts />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TeamStatsCard from "./TeamStatsCard.vue";
import TrainingScheduleCard from "./TrainingScheduleCard.vue";
import PerformanceCharts from "./PerformanceCharts.vue";
import type { TeamData } from "./types";

// Sample team data
const teamData: TeamData = {
  players: [
    {
      id: 1,
      name: "Max Müller",
      position: "Torwart",
      goals: 0,
      assists: 2,
      matches: 15,
    },
    {
      id: 2,
      name: "Tom Weber",
      position: "Verteidiger",
      goals: 3,
      assists: 8,
      matches: 16,
    },
    {
      id: 3,
      name: "Lisa Schmidt",
      position: "Mittelfeld",
      goals: 12,
      assists: 6,
      matches: 14,
    },
    {
      id: 4,
      name: "Anna Klein",
      position: "Stürmer",
      goals: 18,
      assists: 4,
      matches: 15,
    },
    {
      id: 5,
      name: "Paul Fischer",
      position: "Mittelfeld",
      goals: 7,
      assists: 11,
      matches: 13,
    },
  ],
  stats: {
    totalGames: 16,
    wins: 12,
    draws: 2,
    losses: 2,
    goalsFor: 45,
    goalsAgainst: 18,
  },
};
</script>
