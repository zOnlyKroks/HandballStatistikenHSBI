<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal" @click.stop>
      <h2>{{ editingTeam ? "Edit Team" : "Create New Team" }}</h2>

      <div class="form-group">
        <label for="team-name">Team Name *</label>
        <input
          id="team-name"
          :value="form.name"
          type="text"
          placeholder="Enter team name"
          required
          :disabled="!!editingTeam"
          @input="
            $emit(
              'update:form',
              'name',
              ($event.target as HTMLInputElement).value
            )
          "
          @keyup.enter="$emit('save')"
        />
      </div>

      <div v-if="!editingTeam" class="form-group">
        <label for="league-select">League *</label>
        <select
          id="league-select"
          :value="form.leagueId"
          required
          class="league-select"
          @change="
            $emit(
              'update:form',
              'leagueId',
              ($event.target as HTMLSelectElement).value
            )
          "
        >
          <option value="">Select a league</option>
          <option v-for="league in leagues" :key="league.id" :value="league.id">
            {{ league.name }} (Level {{ league.level }})
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Assign Trainers</label>
        <div class="search-container">
          <input
            v-model="trainerSearch"
            type="text"
            placeholder="Search for users to assign as trainers..."
            class="search-input"
          />
        </div>

        <div class="trainers-selection">
          <div v-if="filteredUsers.length === 0" class="no-results">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {{
              trainerSearch
                ? "No users found matching your search"
                : "No users available"
            }}
          </div>
          <div v-else class="users-list">
            <div
              v-for="user in filteredUsers"
              :key="user.uuid"
              class="user-item"
            >
              <input
                :id="`user-${user.uuid}`"
                :checked="form.trainerIds.includes(user.uuid)"
                type="checkbox"
                class="user-checkbox"
                @change="handleTrainerSelection($event, user.uuid)"
              />
              <label :for="`user-${user.uuid}`" class="user-label">
                <div class="user-avatar">
                  <div class="avatar-placeholder">
                    {{ getInitials(user.vorname, user.nachname) }}
                  </div>
                </div>
                <div class="user-info">
                  <span class="user-name"
                    >{{ user.vorname }} {{ user.nachname }}</span
                  >
                  <small class="user-email">{{ user.email }}</small>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn btn-gray" @click="$emit('close')">Cancel</button>
        <button
          class="btn btn-green"
          :disabled="!canSave || saving"
          @click="$emit('save')"
        >
          <svg v-if="saving" class="loading-spinner" viewBox="0 0 24 24">
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
          {{
            saving ? "Saving..." : editingTeam ? "Update Team" : "Create Team"
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from "vue";
import type { League, User, Team } from "../../types/types";

const props = defineProps({
  leagues: {
    type: Array as () => League[],
    required: true,
  },
  users: {
    type: Array as () => User[],
    required: true,
  },
  editingTeam: {
    type: Object as () => Team | null,
    default: null,
  },
  saving: {
    type: Boolean,
    required: true,
  },
  form: {
    type: Object as () => {
      name: string;
      leagueId: number | null;
      trainerIds: string[];
    },
    required: true,
  },
  canSave: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["close", "save", "update:form"]);

const trainerSearch = ref("");

const filteredUsers = computed(() => {
  const search = trainerSearch.value.toLowerCase().trim();
  return props.users.filter(
    (user) =>
      `${user.vorname} ${user.nachname}`.toLowerCase().includes(search) ||
      (user.email && user.email.toLowerCase().includes(search))
  );
});

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName?.charAt(0) || ""}${
    lastName?.charAt(0) || ""
  }`.toUpperCase();
};

const handleTrainerSelection = (event: Event, uuid: string) => {
  const checked = (event.target as HTMLInputElement).checked;
  const trainerIds = [...props.form.trainerIds];

  if (checked) {
    trainerIds.push(uuid);
  } else {
    const index = trainerIds.indexOf(uuid);
    if (index !== -1) trainerIds.splice(index, 1);
  }

  emit("update:form", "trainerIds", trainerIds);
};
</script>
