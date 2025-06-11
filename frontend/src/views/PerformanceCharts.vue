<template>
  <div class="space-y-6">
    <div class="stats-grid">
      <div class="stat-card stat-green">
        <h3 class="stat-label">Tore Heute</h3>
        <p class="stat-value">3</p>
        <p class="stat-description">Beschreibung oder so</p>
      </div>
      <div class="stat-card stat-red">
        <h3 class="stat-label">Tore Fehler</h3>
        <p class="stat-value">1</p>
        <p class="stat-description">Beschreibung oder so</p>
      </div>
    </div>

    <div class="card space-y-6">
      <h3 class="card-title">VL Leistung</h3>

      <div class="performance-grid">
        <div class="performance-item performance-blue">
          <p class="performance-label">Ballkontrolle</p>
          <p class="performance-value">8.2</p>
        </div>
        <div class="performance-item performance-green">
          <p class="performance-label">Geschwindigkeit</p>
          <p class="performance-value">7.8</p>
        </div>
        <div class="performance-item performance-purple">
          <p class="performance-label">Ausdauer</p>
          <p class="performance-value">8.5</p>
        </div>
      </div>

      <div class="chart-grid space-y-6">
        <div class="chart-container">
          <h4 class="chart-title">Team Performance</h4>
          <canvas ref="performanceChart" class="chart-canvas"></canvas>
        </div>
        <div class="chart-container">
          <h4 class="chart-title">Position Distribution</h4>
          <canvas ref="positionChart" class="chart-canvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const performanceChart = ref<HTMLCanvasElement>();
const positionChart = ref<HTMLCanvasElement>();

let performanceChartInstance: Chart | null = null;
let positionChartInstance: Chart | null = null;

onMounted(() => {
  if (performanceChart.value) {
    const ctx = performanceChart.value.getContext("2d");
    if (ctx) {
      performanceChartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: [
            "Spiel 1",
            "Spiel 2",
            "Spiel 3",
            "Spiel 4",
            "Spiel 5",
            "Spiel 6",
          ],
          datasets: [
            {
              label: "Team Performance",
              data: [2.1, 2.8, 3.2, 2.9, 3.5, 3.8],
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });
    }
  }

  if (positionChart.value) {
    const ctx = positionChart.value.getContext("2d");
    if (ctx) {
      positionChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Torwart", "Verteidiger", "Mittelfeld", "Stürmer"],
          datasets: [
            {
              data: [1, 1, 2, 1],
              backgroundColor: ["#ef4444", "#f97316", "#eab308", "#22c55e"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
        },
      });
    }
  }
});

onUnmounted(() => {
  performanceChartInstance?.destroy();
  positionChartInstance?.destroy();
});
</script>
