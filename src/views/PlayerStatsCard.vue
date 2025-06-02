<template>
  <div class="space-y-6">
    <div class="card">
      <h3 class="card-title">Individualstatistiken</h3>
      <p class="card-subtitle">wie Mannschaft</p>

      <div class="individual-stats">
        <div class="individual-stat individual-blue">
          <p class="individual-label">Schüsse</p>
          <p class="individual-value">45</p>
        </div>
        <div class="individual-stat individual-green">
          <p class="individual-label">Genauigkeit</p>
          <p class="individual-value">78%</p>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">Spieler Leistung</h3>
      <div class="chart-container">
        <canvas ref="playerChart" class="chart-canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Chart, registerables } from "chart.js";
import { defineProps } from "vue";
import { Player } from "./types";

Chart.register(...registerables);

const props = defineProps<{
  player: Player;
}>();

const playerChart = ref<HTMLCanvasElement>();
let playerChartInstance: Chart | null = null;

onMounted(() => {
  if (playerChart.value) {
    const ctx = playerChart.value.getContext("2d");
    if (ctx) {
      playerChartInstance = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Tore", "Assists", "Pässe", "Tackles"],
          datasets: [
            {
              label: props.player.name,
              data: [props.player.goals, props.player.assists, 120, 25],
              backgroundColor: [
                "rgba(34, 197, 94, 0.8)",
                "rgba(168, 85, 247, 0.8)",
                "rgba(59, 130, 246, 0.8)",
                "rgba(245, 158, 11, 0.8)",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } },
        },
      });
    }
  }
});

onUnmounted(() => {
  playerChartInstance?.destroy();
});
</script>
