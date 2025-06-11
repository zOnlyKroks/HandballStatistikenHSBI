<template>
  <div class="view-container">
    <!-- Header Card -->
    <div class="header-card">
      <div class="header-flex">
        <h1 class="page-title">Spielerverwaltung</h1>
        <div class="action-buttons">
          <button class="btn btn-green" @click="openAddPlayerModal">
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Spieler zum Team hinzufügen
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <h3 class="card-title">Spielerliste</h3>
      <div v-if="loading" class="text-center py-8">
        <p>Lade Spielerdaten...</p>
      </div>
      <div v-else-if="errorMessage" class="status-message error">
        {{ errorMessage }}
      </div>
      <div v-else class="overflow-x-auto">
        <table class="player-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Name</th>
              <th>Position</th>
              <th>Trikotnummer</th>
              <th>Größe (cm)</th>
              <th>Geburtsdatum</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in players" :key="player.uuid">
              <td>
                <div class="player-photo-cell">
                  <div
                    v-if="imageLoadingStates[player.uuid]"
                    class="photo-loading-small"
                  >
                    <svg class="loading-spinner-small" viewBox="0 0 24 24">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                        fill="none"
                        stroke-dasharray="31.416"
                        stroke-dashoffset="31.416"
                      >
                        <animate
                          attributeName="stroke-dasharray"
                          dur="2s"
                          values="0 31.416;15.708 15.708;0 31.416"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="stroke-dashoffset"
                          dur="2s"
                          values="0;-15.708;-31.416"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </svg>
                  </div>
                  <div
                    v-else-if="playerImages[player.uuid]"
                    class="photo-container-small"
                  >
                    <img
                      :src="playerImages[player.uuid]"
                      :alt="`${player.vorname} ${player.nachname}`"
                      class="player-image-small"
                      @error="handleImageError(player.uuid)"
                    />
                  </div>
                  <div v-else class="photo-placeholder-small">
                    <svg
                      class="player-icon-small"
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
                  </div>
                  <button
                    class="btn-upload-image"
                    :disabled="imageUploadingStates[player.uuid]"
                    @click="triggerImageUpload(player.uuid)"
                  >
                    📷
                  </button>
                  <input
                    :id="`imageInput-${player.uuid}`"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="handleImageUpload($event, player)"
                  />
                </div>
              </td>
              <td>{{ player.vorname }} {{ player.nachname }}</td>
              <td>
                <template v-if="editingPlayerId === player.uuid">
                  <select v-model.number="editingPlayer.position_id">
                    <option
                      v-for="pos in positions"
                      :key="pos.id"
                      :value="pos.id"
                    >
                      {{ pos.title }}
                    </option>
                  </select>
                </template>
                <template v-else>
                  {{ player.position || "Keine Position" }}
                </template>
              </td>
              <td>
                <template v-if="editingPlayerId === player.uuid">
                  <input
                    v-model.number="editingPlayer.trikotnummer"
                    type="number"
                    min="0"
                    max="99"
                  />
                </template>
                <template v-else>{{ player.trikotnummer }}</template>
              </td>
              <td>
                <template v-if="editingPlayerId === player.uuid">
                  <input
                    v-model.number="editingPlayer.koerpergroesse"
                    type="number"
                    min="100"
                    max="250"
                  />
                </template>
                <template v-else>{{ player.koerpergroesse }}</template>
              </td>
              <td>
                <template v-if="editingPlayerId === player.uuid">
                  <input v-model="editingPlayer.geburtsdatum" type="date" />
                </template>
                <template v-else>{{
                  formatDate(player.geburtsdatum)
                }}</template>
              </td>
              <td class="actions">
                <button
                  v-if="editingPlayerId !== player.uuid"
                  class="btn-action"
                  @click="startEditing(player)"
                >
                  ✎ Bearbeiten
                </button>
                <button
                  v-else
                  class="btn-action btn-save"
                  :disabled="saving"
                  @click="savePlayer"
                >
                  <span v-if="saving">Speichern...</span>
                  <span v-else>✔ Speichern</span>
                </button>
                <button
                  v-if="editingPlayerId === player.uuid"
                  class="btn-action btn-cancel"
                  @click="cancelEditing"
                >
                  ✕ Abbrechen
                </button>
                <button
                  class="btn-action btn-danger"
                  @click="confirmDelete(player)"
                >
                  🗑 Entfernen
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Player Modal -->
    <div v-if="showAddPlayerModal" class="modal-backdrop">
      <div class="modal">
        <h2>Spieler zum Team hinzufügen</h2>
        <div v-if="availablePlayersLoading" class="text-center py-4">
          <p>Verfügbare Spieler werden geladen...</p>
        </div>
        <div v-else-if="availablePlayersError" class="status-message error">
          {{ availablePlayersError }}
        </div>
        <div v-else-if="availablePlayers.length === 0">
          <p>Keine verfügbaren Spieler ohne Team</p>
        </div>
        <div v-else>
          <div class="form-group">
            <label>Verfügbare Spieler:</label>
            <select v-model="selectedPlayerId" class="player-select">
              <option value="">Bitte wählen...</option>
              <option
                v-for="player in availablePlayers"
                :key="player.uuid"
                :value="player.uuid"
              >
                {{ player.vorname }} {{ player.nachname }} ({{ player.email }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Position</label>
            <select v-model.number="newPlayer.position_id">
              <option value="">Bitte wählen...</option>
              <option v-for="pos in positions" :key="pos.id" :value="pos.id">
                {{ pos.title }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Trikotnummer</label>
            <input
              v-model.number="newPlayer.trikotnummer"
              type="number"
              min="0"
              max="99"
            />
          </div>
        </div>

        <div class="modal-actions">
          <button
            class="btn btn-green"
            :disabled="
              !selectedPlayerId || !newPlayer.position_id || addingPlayer
            "
            @click="addPlayerToTeam"
          >
            <span v-if="addingPlayer">Hinzufügen...</span>
            <span v-else>Hinzufügen</span>
          </button>
          <button class="btn btn-gray" @click="closeAddPlayerModal">
            Abbrechen
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="playerToDelete" class="modal-backdrop">
      <div class="modal">
        <h2>Spieler entfernen</h2>
        <p>
          Sind Sie sicher, dass Sie {{ playerToDelete.vorname }}
          {{ playerToDelete.nachname }}
          aus dem Team entfernen möchten?
        </p>
        <p class="warning">
          Hinweis: Der Spieler wird nur aus dem Team entfernt, nicht aus dem
          System.
        </p>
        <div class="modal-actions">
          <button class="btn btn-red" @click="removePlayerFromTeam">
            Ja, entfernen
          </button>
          <button class="btn btn-gray" @click="playerToDelete = null">
            Abbrechen
          </button>
        </div>
      </div>
    </div>

    <!-- Image Upload Status Toast -->
    <div
      v-if="imageUploadStatus.show"
      class="toast"
      :class="imageUploadStatus.type"
    >
      <div class="toast-content">
        <span>{{ imageUploadStatus.message }}</span>
        <button class="toast-close" @click="imageUploadStatus.show = false">
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from "vue";
import { api } from "../net/axios";
import { useAuthStore } from "../stores/authStore";
import type { User, Position } from "../types/types";
import { usePlayerStore } from "../stores/playerStore";

const store = useAuthStore();
const players = ref<User[]>([]);
const loading = ref(true);
const saving = ref(false);
const errorMessage = ref("");
const positions = ref<Position[]>([]);
const editingPlayerId = ref<string | null>(null);
const editingPlayer = ref<Partial<User>>({});
const showAddPlayerModal = ref(false);
const playerToDelete = ref<User | null>(null);

const availablePlayers = ref<User[]>([]);
const availablePlayersLoading = ref(false);
const availablePlayersError = ref("");
const selectedPlayerId = ref("");
const addingPlayer = ref(false);

const newPlayer = ref({
  position_id: null as number | null,
  trikotnummer: null as number | null,
});

const playerImages = ref<Record<string, string>>({});
const imageLoadingStates = ref<Record<string, boolean>>({});
const imageUploadingStates = ref<Record<string, boolean>>({});
const imageUploadStatus = reactive({
  show: false,
  message: "",
  type: "success" as "success" | "error",
});

onMounted(async () => {
  await fetchPlayers();
  await fetchPositions();
  await loadAllPlayerImages();
});

async function fetchPlayers() {
  try {
    loading.value = true;
    errorMessage.value = "";
    players.value = await usePlayerStore().getTeamMembers(
      store.actualUser.mannschaftId
    );
  } catch (error) {
    console.error("Failed to fetch players:", error);
    errorMessage.value = "Fehler beim Laden der Spielerdaten";
  } finally {
    loading.value = false;
  }
}

async function loadAllPlayerImages() {
  for (const player of players.value) {
    if (player.uuid) {
      await loadPlayerImage(player.uuid);
    }
  }
}

async function loadPlayerImage(playerUuid: string) {
  try {
    imageLoadingStates.value[playerUuid] = true;
    const player = await usePlayerStore().fetchFull(playerUuid);

    playerImages.value[playerUuid] = player.profileImage;
  } catch (error) {
    console.error(`Failed to load image for player ${playerUuid}:`, error);
  } finally {
    imageLoadingStates.value[playerUuid] = false;
  }
}

function handleImageError(playerUuid: string) {
  delete playerImages.value[playerUuid];
}

function triggerImageUpload(playerUuid: string) {
  const input = document.getElementById(
    `imageInput-${playerUuid}`
  ) as HTMLInputElement;
  if (input) {
    input.click();
  }
}

async function handleImageUpload(event: Event, player: User) {
  const input = event.target as HTMLInputElement;
  if (!input.files || !input.files[0] || !player.uuid) return;

  const file = input.files[0];

  // Validate file type
  if (!file.type.startsWith("image/")) {
    showImageUploadStatus("Nur Bilddateien sind erlaubt.", "error");
    return;
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showImageUploadStatus("Datei ist zu groß. Maximum 5MB erlaubt.", "error");
    return;
  }

  try {
    imageUploadingStates.value[player.uuid] = true;

    // Convert file to base64
    const base64 = await fileToBase64(file);

    // Upload image
    await api.post(`/api/players/${player.uuid}/profileImage`, {
      profileImage: base64,
    });

    // Update local image cache
    playerImages.value[player.uuid] = base64;

    showImageUploadStatus("Profilbild erfolgreich aktualisiert!", "success");

    // Clear the input
    input.value = "";
  } catch (error) {
    console.error("Failed to upload profile image:", error);
    showImageUploadStatus("Fehler beim Hochladen des Bildes.", "error");
  } finally {
    imageUploadingStates.value[player.uuid] = false;
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function showImageUploadStatus(message: string, type: "success" | "error") {
  imageUploadStatus.message = message;
  imageUploadStatus.type = type;
  imageUploadStatus.show = true;

  // Auto hide after 3 seconds
  setTimeout(() => {
    imageUploadStatus.show = false;
  }, 3000);
}

async function fetchAvailablePlayers() {
  try {
    availablePlayersLoading.value = true;
    availablePlayersError.value = "";
    const response = await api.get(`/team/available-players`);
    availablePlayers.value = response.data;
  } catch (error) {
    console.error("Failed to fetch available players:", error);
    availablePlayersError.value = "Fehler beim Laden verfügbarer Spieler";
  } finally {
    availablePlayersLoading.value = false;
  }
}

async function fetchPositions() {
  try {
    const response = await api.get("/api/positions");
    positions.value = response.data.positions || [];
  } catch (error) {
    console.error("Failed to fetch positions:", error);
  }
}

function formatDate(date: string | Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("de-DE");
}

function formatDateToYMD(date: string | Date | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startEditing(player: User) {
  if (!player.uuid) {
    console.error("Player UUID missing", player);
    errorMessage.value = "Fehler: Spieler-ID fehlt";
    return;
  }

  editingPlayerId.value = player.uuid;
  editingPlayer.value = {
    vorname: player.vorname,
    nachname: player.nachname,
    koerpergroesse: player.koerpergroesse,
    trikotnummer: player.trikotnummer,
    position_id: player.position_id,
    geburtsdatum: player.geburtsdatum
      ? new Date(player.geburtsdatum).toISOString().split("T")[0]
      : "",
  };
}

function cancelEditing() {
  editingPlayerId.value = null;
  editingPlayer.value = {};
}

async function savePlayer() {
  if (!editingPlayerId.value) return;

  try {
    saving.value = true;
    errorMessage.value = "";

    const updateData: Partial<
      Pick<
        User,
        | "vorname"
        | "nachname"
        | "koerpergroesse"
        | "trikotnummer"
        | "position_id"
        | "geburtsdatum"
      >
    > = {};

    if (editingPlayer.value.vorname !== undefined) {
      updateData.vorname = editingPlayer.value.vorname;
    }
    if (editingPlayer.value.nachname !== undefined) {
      updateData.nachname = editingPlayer.value.nachname;
    }
    if (editingPlayer.value.koerpergroesse !== undefined) {
      updateData.koerpergroesse = editingPlayer.value.koerpergroesse;
    }
    if (editingPlayer.value.trikotnummer !== undefined) {
      updateData.trikotnummer = editingPlayer.value.trikotnummer;
    }
    if (editingPlayer.value.position_id !== undefined) {
      updateData.position_id = editingPlayer.value.position_id;
    }
    if (editingPlayer.value.geburtsdatum) {
      const formattedDate = formatDateToYMD(editingPlayer.value.geburtsdatum);
      if (formattedDate !== null) {
        updateData.geburtsdatum = formattedDate;
      }
    }

    await api.post(`/api/players/${editingPlayerId.value}/profileData`, {
      profileData: updateData,
    });

    await fetchPlayers();
    cancelEditing();
  } catch (error) {
    console.error("Failed to save player:", error);
    errorMessage.value = "Fehler beim Speichern der Spielerdaten";
  } finally {
    saving.value = false;
  }
}

function confirmDelete(player: User) {
  playerToDelete.value = player;
}

async function removePlayerFromTeam() {
  if (!playerToDelete.value?.uuid) return;

  try {
    await api.post(`/api/players/${playerToDelete.value.uuid}/profileData`, {
      profileData: {
        mannschaft_id: 2,
        trikotnummer: -1,
        position_id: -1,
      },
    });

    await fetchPlayers();
    playerToDelete.value = null;
  } catch (error) {
    console.error("Failed to remove player from team:", error);
    errorMessage.value = "Fehler beim Entfernen des Spielers";
  }
}

async function addPlayerToTeam() {
  if (!selectedPlayerId.value || !newPlayer.value.position_id) return;

  try {
    addingPlayer.value = true;
    availablePlayersError.value = "";

    const selectedPlayer = availablePlayers.value.find(
      (p) => p.uuid === selectedPlayerId.value
    );

    if (!selectedPlayer) {
      throw new Error("Spieler nicht gefunden");
    }

    const playerData = {
      mannschaft_id: store.actualUser.mannschaftId,
      position_id: newPlayer.value.position_id,
      trikotnummer: newPlayer.value.trikotnummer,
    };

    await api.post(`/api/players/${selectedPlayerId.value}/profileData`, {
      profileData: playerData,
    });

    await fetchPlayers();
    await fetchAvailablePlayers();
    await loadPlayerImage(selectedPlayerId.value);

    closeAddPlayerModal();
  } catch (error) {
    console.error("Failed to add player to team:", error);
    availablePlayersError.value = "Fehler beim Hinzufügen des Spielers";
  } finally {
    addingPlayer.value = false;
  }
}

async function openAddPlayerModal() {
  showAddPlayerModal.value = true;
  await fetchAvailablePlayers();
  resetAddPlayerForm();
}

function closeAddPlayerModal() {
  showAddPlayerModal.value = false;
  resetAddPlayerForm();
  availablePlayersError.value = "";
}

function resetAddPlayerForm() {
  selectedPlayerId.value = "";
  newPlayer.value = {
    position_id: null,
    trikotnummer: null,
  };
}
</script>

<style scoped>
.view-container {
  padding: 20px;
}

.header-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  padding: 20px;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  border: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-green {
  background-color: #10b981;
  color: white;
}

.btn-green:hover:not(:disabled) {
  background-color: #059669;
}

.icon {
  width: 20px;
  height: 20px;
}

.card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 16px;
}

.player-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.player-table th,
.player-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.player-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

/* Profile Image Styles */
.player-photo-cell {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.photo-container-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.player-image-small {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder-small,
.photo-loading-small {
  width: 40px;
  height: 40px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-icon-small {
  width: 20px;
  height: 20px;
  color: #9ca3af;
}

.loading-spinner-small {
  width: 20px;
  height: 20px;
  color: #6b7280;
}

.btn-upload-image {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.btn-upload-image:hover:not(:disabled) {
  background: #2563eb;
}

.btn-upload-image:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-action {
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 0.875rem;
  border: 1px solid #ddd;
  background: white;
}

.btn-action:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-save {
  background-color: #d1fae5;
  color: #065f46;
}

.btn-cancel {
  background-color: #fef3c7;
  color: #92400e;
}

.btn-danger {
  background-color: #fee2e2;
  color: #b91c1c;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  padding: 24px;
  min-width: 400px;
  max-width: 600px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}

.player-select,
input[type="number"],
input[type="date"],
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: flex-end;
}

.btn-gray {
  background-color: #e5e7eb;
  color: #4b5563;
}

.btn-red {
  background-color: #ef4444;
  color: white;
}

.warning {
  color: #b91c1c;
  font-weight: 500;
  margin-top: 10px;
}

.status-message.error {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  text-align: center;
  margin: 1rem 0;
}

/* Toast Notification */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1100;
  min-width: 300px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

.toast.success {
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
}

/* Toast Notification - Missing Styles */
.toast.error {
  background-color: #fee2e2;
  color: #b91c1c;
  border: 1px solid #ef4444;
}

.toast-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.toast-close {
  background: none;
  border: none;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  margin-left: 12px;
  padding: 0;
  line-height: 1;
}

.toast-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Additional utility classes that might be missing */
.text-center {
  text-align: center;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.overflow-x-auto {
  overflow-x: auto;
}
</style>
