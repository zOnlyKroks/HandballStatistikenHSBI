<template>
  <div class="home">
    <h1>{{ message }}</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { api } from "../main";

export default defineComponent({
  setup() {
    const message = ref("Loading...");

    onMounted(async () => {
      try {
        const res = await api.get("/");
        message.value = res.data;
      } catch (error) {
        console.error("Error fetching message:", error);
        message.value = "Failed to load message from backend.";
      }
    });

    return {
      message,
    };
  },
});
</script>

<style scoped>
.home {
  text-align: center;
  margin-top: 40px;
}
</style>
