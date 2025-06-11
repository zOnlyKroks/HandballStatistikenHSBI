<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal" @click.stop>
      <h2>{{ editingUser ? "Edit User" : "Create New User" }}</h2>

      <div class="form-group">
        <label for="user-vorname">First Name *</label>
        <input
          id="user-vorname"
          :value="form.vorname"
          type="text"
          placeholder="Enter first name"
          required
          @input="
            $emit(
              'update:form',
              'vorname',
              ($event.target as HTMLInputElement).value
            )
          "
          @keyup.enter="$emit('save')"
        />
      </div>

      <div class="form-group">
        <label for="user-nachname">Last Name *</label>
        <input
          id="user-nachname"
          :value="form.nachname"
          type="text"
          placeholder="Enter last name"
          required
          @input="
            $emit(
              'update:form',
              'nachname',
              ($event.target as HTMLInputElement).value
            )
          "
          @keyup.enter="$emit('save')"
        />
      </div>

      <div class="form-group">
        <label for="user-email">Email *</label>
        <input
          id="user-email"
          :value="form.email"
          type="email"
          placeholder="Enter email address"
          required
          @input="
            $emit(
              'update:form',
              'email',
              ($event.target as HTMLInputElement).value
            )
          "
          @keyup.enter="$emit('save')"
        />
      </div>

      <div v-if="!editingUser" class="form-group">
        <label for="user-password">Password *</label>
        <input
          id="user-password"
          :value="form.password"
          type="password"
          placeholder="Enter password"
          required
          @input="
            $emit(
              'update:form',
              'password',
              ($event.target as HTMLInputElement).value
            )
          "
          @keyup.enter="$emit('save')"
        />
      </div>

      <div class="form-group">
        <label for="user-team">Team Assignment</label>
        <select
          id="user-team"
          :value="form.teamId"
          class="team-select"
          @change="
            $emit(
              'update:form',
              'teamId',
              ($event.target as HTMLSelectElement).value
            )
          "
        >
          <option value="">No team assignment</option>
          <option v-for="team in teams" :key="team.id" :value="team.id">
            {{ team.name }} - {{ team.leagueName }}
          </option>
        </select>
      </div>

      <div class="modal-actions">
        <button class="btn btn-gray" @click="$emit('close')">Cancel</button>
        <button
          class="btn btn-blue"
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
            saving ? "Saving..." : editingUser ? "Update User" : "Create User"
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import type { Team, User } from "../../types/types";

defineProps({
  teams: {
    type: Array as () => Team[],
    required: true,
  },
  editingUser: {
    type: Object as () => User | null,
    default: null,
  },
  saving: {
    type: Boolean,
    required: true,
  },
  form: {
    type: Object as () => {
      vorname: string;
      nachname: string;
      email: string;
      password: string;
      teamId: number | null;
    },
    required: true,
  },
  canSave: {
    type: Boolean,
    required: true,
  },
});

defineEmits(["close", "save", "update:form"]);
</script>
