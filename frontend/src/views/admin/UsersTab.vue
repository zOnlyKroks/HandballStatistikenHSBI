<template>
  <div class="card">
    <div class="users-header">
      <h3 class="card-title">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9.7a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
        Users Management
      </h3>
    </div>

    <div v-if="loading" class="status-message">Loading users...</div>

    <div v-else-if="users.length === 0" class="no-users">
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
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
      <button class="btn btn-blue" @click="$emit('create-user')">
        Create First User
      </button>
    </div>

    <div v-else class="users-grid">
      <div v-for="user in users" :key="user.uuid" class="user-card">
        <div class="user-header">
          <div class="user-avatar-section">
            <div class="user-avatar">
              <div class="avatar-placeholder">
                {{ getInitials(user.vorname, user.nachname) }}
              </div>
            </div>
            <div class="user-basic-info">
              <h3>{{ user.vorname }} {{ user.nachname }}</h3>
              <p class="user-email">{{ user.email }}</p>
              <p v-if="user.position" class="user-role">
                {{ user.position }}
              </p>
            </div>
          </div>
          <div class="user-actions">
            <button
              class="btn-action"
              title="Edit User"
              @click="$emit('edit-user', user)"
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
              title="Delete User"
              @click="$emit('delete-user', user)"
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

        <div v-if="user.mannschaftName" class="user-details">
          <div class="user-team">
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
            <span>{{ user.mannschaftName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import type { User } from "../../types/types";

defineProps({
  users: {
    type: Array as () => User[],
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
});

defineEmits(["create-user", "edit-user", "delete-user"]);

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName?.charAt(0) || ""}${
    lastName?.charAt(0) || ""
  }`.toUpperCase();
};
</script>
