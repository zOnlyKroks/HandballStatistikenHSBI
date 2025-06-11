<template>
  <div class="modal-backdrop" @click.self="$emit('cancel')">
    <div class="modal" @click.stop>
      <h2>Delete {{ type === "team" ? "Team" : "User" }}</h2>
      <p>
        Are you sure you want to delete the
        {{ type === "team" ? "team" : "user" }} <strong>"{{ name }}"</strong>?
      </p>
      <div class="warning">
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <span v-if="type === 'team'">
          This action cannot be undone. All assigned trainers will be removed
          from this team.
        </span>
        <span v-else>
          This action cannot be undone. The user will be permanently removed
          from the system.
        </span>
      </div>
      <div class="modal-actions">
        <button class="btn btn-gray" @click="$emit('cancel')">Cancel</button>
        <button class="btn btn-red" @click="$emit('confirm')">
          Delete {{ type === "team" ? "Team" : "User" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

defineProps({
  type: {
    type: String as () => "team" | "user",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

defineEmits(["cancel", "confirm"]);
</script>
