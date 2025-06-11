<template>
  <div class="card">
    <h3 class="card-title">
      <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      Teams Overview
      <span v-if="refreshing" class="refresh-indicator">
        <svg class="loading-spinner icon" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
            fill="none"
            opacity="0.25"
          />
          <path
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </span>
    </h3>

    <div v-if="loading" class="status-message">Loading teams...</div>

    <div v-else-if="teams.length === 0" class="no-teams">
      <svg
        class="icon large-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p>No teams created yet</p>
      <button class="btn btn-green" @click="$emit('open-create-modal')">
        Create First Team
      </button>
    </div>

    <div v-else class="teams-grid">
      <div v-for="team in teams" :key="team.id" class="team-card">
        <div class="team-header">
          <div>
            <h3>{{ team.name }}</h3>
            <p class="team-league">
              {{ team.leagueName }} (Level {{ team.leagueLevel }})
            </p>
          </div>
          <div class="team-actions">
            <button
              class="btn-action"
              title="Edit Team"
              @click="$emit('open-edit-modal', team)"
            >
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              class="btn-action btn-danger"
              title="Delete Team"
              @click="$emit('delete-team', team)"
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="trainers-section">
          <h4>Trainers ({{ team.trainers.length }}):</h4>
          <div v-if="team.trainers.length === 0" class="no-trainers">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            <span>No trainers assigned</span>
          </div>
          <div v-else class="trainers-list">
            <div
              v-for="trainer in team.trainers"
              :key="trainer.uuid"
              class="trainer-item"
            >
              <div class="trainer-avatar">
                <div class="avatar-placeholder">
                  {{ getInitials(trainer.vorname, trainer.nachname) }}
                </div>
              </div>
              <div class="trainer-info">
                <span class="trainer-name"
                  >{{ trainer.vorname }} {{ trainer.nachname }}</span
                >
                <small class="trainer-email">{{ trainer.email }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import type { Team } from "../../types/types";

defineProps({
  teams: {
    type: Array as () => Team[],
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  refreshing: {
    type: Boolean,
    required: true,
  },
});

defineEmits(["open-create-modal", "open-edit-modal", "delete-team"]);

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName?.charAt(0) || ""}${
    lastName?.charAt(0) || ""
  }`.toUpperCase();
};
</script>
