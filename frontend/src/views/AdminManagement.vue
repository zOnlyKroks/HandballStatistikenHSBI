<template>
  <div class="admin-container">
    <!-- Header -->
    <div class="header-card">
      <div class="header-flex">
        <h1 class="page-title">Team Administration</h1>
        <button class="btn btn-green" @click="openCreateModal">
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
          Create New Team
        </button>
      </div>
    </div>

    <!-- Teams List -->
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
        <button class="btn btn-green" @click="openCreateModal">
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
                @click="openEditModal(team)"
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
                @click="confirmDelete(team)"
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

    <!-- Create/Edit Team Modal -->
    <div v-if="showModal" class="modal-backdrop" @click="closeModal">
      <div class="modal" @click.stop>
        <h2>{{ editingTeam ? "Edit Team" : "Create New Team" }}</h2>

        <div class="form-group">
          <label for="team-name">Team Name *</label>
          <input
            id="team-name"
            v-model="form.name"
            type="text"
            placeholder="Enter team name"
            required
            :disabled="editingTeam !== null"
            @keyup.enter="saveTeam"
          />
        </div>

        <div v-if="!editingTeam" class="form-group">
          <label for="league-select">League *</label>
          <select
            id="league-select"
            v-model="form.leagueId"
            required
            class="league-select"
          >
            <option value="">Select a league</option>
            <option
              v-for="league in leagues"
              :key="league.id"
              :value="league.id"
            >
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
                  v-model="form.trainerIds"
                  type="checkbox"
                  :value="user.uuid"
                  class="user-checkbox"
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
          <button class="btn btn-gray" @click="closeModal">Cancel</button>
          <button
            class="btn btn-green"
            :disabled="!canSaveTeam || saving"
            @click="saveTeam"
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

    <!-- Delete Confirmation Modal -->
    <div
      v-if="teamToDelete"
      class="modal-backdrop"
      @click="teamToDelete = null"
    >
      <div class="modal" @click.stop>
        <h2>Delete Team</h2>
        <p>
          Are you sure you want to delete the team
          <strong>"{{ teamToDelete.name }}"</strong>?
        </p>
        <div class="warning">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          This action cannot be undone. All assigned trainers will be removed
          from this team.
        </div>
        <div class="modal-actions">
          <button class="btn btn-gray" @click="teamToDelete = null">
            Cancel
          </button>
          <button class="btn btn-red" @click="deleteTeam">Delete Team</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { api } from "../net/axios";
import type { User } from "../types/types";

interface Team {
  id: number;
  name: string;
  leagueId: number;
  leagueName: string;
  leagueLevel: number;
  trainers: User[];
}

interface League {
  id: number;
  name: string;
  level: number;
  anzahl_mannschaften: number;
}

interface TrainerAssignment {
  uuid: string;
  teamId: number;
}

// State
const loading = ref(true);
const refreshing = ref(false);
const saving = ref(false);
const teams = ref<Team[]>([]);
const leagues = ref<League[]>([]);
const allUsers = ref<User[]>([]);
const showModal = ref(false);
const editingTeam = ref<Team | null>(null);
const teamToDelete = ref<Team | null>(null);
const trainerSearch = ref("");

// Interval reference for cleanup
let refreshInterval: number | null;

// Form data
const form = ref({
  name: "",
  leagueId: null as number | null,
  trainerIds: [] as string[],
});

// Computed
const filteredUsers = computed(() => {
  const search = trainerSearch.value.toLowerCase().trim();
  if (!search) return allUsers.value;

  return allUsers.value.filter((user) => {
    const fullName = `${user.vorname} ${user.nachname}`.toLowerCase();
    return (
      fullName.includes(search) ||
      (user.email && user.email.toLowerCase().includes(search))
    );
  });
});

const canSaveTeam = computed(() => {
  if (editingTeam.value) {
    // For editing, only need name
    return form.value.name.trim() !== "";
  } else {
    // For creating, need both name and league
    return form.value.name.trim() !== "" && form.value.leagueId !== null;
  }
});

// Methods
const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const openCreateModal = () => {
  editingTeam.value = null;
  form.value = { name: "", leagueId: null, trainerIds: [] };
  trainerSearch.value = "";
  showModal.value = true;
};

const openEditModal = (team: Team) => {
  editingTeam.value = team;
  form.value = {
    name: team.name,
    leagueId: team.leagueId,
    trainerIds: team.trainers.map((t) => t.uuid),
  };
  trainerSearch.value = "";
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingTeam.value = null;
  form.value = { name: "", leagueId: null, trainerIds: [] };
  trainerSearch.value = "";
};

const saveTeam = async () => {
  if (!canSaveTeam.value) return;

  saving.value = true;

  try {
    let teamId: number;
    const teamName = form.value.name.trim();

    if (editingTeam.value) {
      // Update team name (if needed)
      teamId = editingTeam.value.id;
    } else {
      // Create new team
      const response = await api.post("/team", {
        name: teamName,
        leagueId: form.value.leagueId,
        trainerIds: form.value.trainerIds,
      });

      if (response.data.success) {
        teamId = response.data.teamId;
      } else {
        throw new Error("Failed to create team");
      }
    }

    // For editing teams, still handle trainer assignments
    if (editingTeam.value) {
      await assignTrainersToTeam(teamId);
    }

    // Refresh teams data to get updated trainers
    await loadTeams();

    closeModal();
  } catch (error: any) {
    console.error("Failed to save team:", error);
    const errorMessage =
      error?.response?.data?.error || "Error saving team. Please try again.";
    alert(errorMessage);
  } finally {
    saving.value = false;
  }
};

const assignTrainersToTeam = async (teamId: number) => {
  const assignments: TrainerAssignment[] = [];

  // 1. Assign selected trainers to the team
  for (const trainerId of form.value.trainerIds) {
    try {
      // Add to team and set position to 8 (trainer)
      await api.post(`/api/players/${trainerId}/profileData`, {
        profileData: {
          mannschaft_id: teamId,
          position_id: 8, // Trainer position ID
        },
      });

      assignments.push({ uuid: trainerId, teamId });
    } catch (error) {
      console.error(`Failed to assign trainer ${trainerId}:`, error);
    }
  }

  // 2. Remove trainers that were unassigned (if editing)
  if (editingTeam.value) {
    const previousTrainers = editingTeam.value.trainers.map((t) => t.uuid);
    const removedTrainers = previousTrainers.filter(
      (id) => !form.value.trainerIds.includes(id)
    );

    for (const trainerId of removedTrainers) {
      try {
        // Remove from team and reset position
        await api.post(`/api/players/${trainerId}/profileData`, {
          profileData: {
            mannschaft_id: -1,
            position_id: -1,
          },
        });
      } catch (error) {
        console.error(`Failed to unassign trainer ${trainerId}:`, error);
      }
    }
  }

  return assignments;
};

const confirmDelete = (team: Team) => {
  teamToDelete.value = team;
};

const deleteTeam = async () => {
  if (!teamToDelete.value) return;

  try {
    // Delete team
    await api.delete(`/team/${teamToDelete.value.id}`);

    // Remove from local state
    teams.value = teams.value.filter((t) => t.id !== teamToDelete.value!.id);
    teamToDelete.value = null;
  } catch (error) {
    console.error("Failed to delete team:", error);
    alert("Error deleting team. Please try again.");
  }
};

const loadLeagues = async () => {
  try {
    const response = await api.get("/misc/ligen");
    leagues.value = response.data.ligen;
  } catch (error) {
    console.error("Failed to load leagues:", error);
    alert("Error loading leagues. Please try again.");
  }
};

// Updated loadTeams function to refresh trainers data
const loadTeams = async (isRefresh = false) => {
  if (!isRefresh) {
    loading.value = true;
  } else {
    refreshing.value = true;
  }

  try {
    const teamsResponse = await api.get("/team");
    const allTeams: [
      {
        teamId: number;
        teamName: string;
        ligaId: number;
        ligaName: string;
        trainers: User[];
      }
    ] = teamsResponse.data;

    // Load trainers for each team by fetching team players
    const teamsWithTrainers = await Promise.all(
      allTeams.map(async (team) => {
        try {
          const playersResponse = await api.get(`/team/${team.teamId}/players`);

          const players = playersResponse.data || [];

          const trainers = players.filter(
            (player: User) => player.position === "Trainer"
          );

          return {
            ...team,
            trainers: trainers,
          };
        } catch (error) {
          console.error(
            `Failed to load players for team ${team.teamId}:`,
            error
          );
          return {
            ...team,
            trainers: [],
          };
        }
      })
    );

    // Transform to the expected format
    teams.value = teamsWithTrainers.map((team) => {
      const league = leagues.value.find((l) => l.id === team.ligaId);
      return {
        id: team.teamId,
        name: team.teamName,
        leagueId: team.ligaId,
        leagueName: team.ligaName,
        leagueLevel: league?.level || 0,
        trainers: team.trainers,
      };
    });
  } catch (error) {
    console.error("Failed to load teams:", error);
    if (!isRefresh) {
      alert("Error loading teams. Please try again.");
    }
  } finally {
    if (!isRefresh) {
      loading.value = false;
    } else {
      refreshing.value = false;
    }
  }
};

const loadUsers = async () => {
  try {
    const response = await api.get("/team/users/all");
    allUsers.value = response.data;
  } catch (error) {
    console.error("Failed to load users:", error);
    alert("Error loading users. Please try again.");
  }
};

// Function to start the refresh interval
const startRefreshInterval = () => {
  // Clear any existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  // Set up interval to refresh teams every 5 seconds
  refreshInterval = setInterval(() => {
    loadTeams(true); // Pass true to indicate this is a refresh
  }, 5000);
};

// Function to stop the refresh interval
const stopRefreshInterval = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

onMounted(async () => {
  await Promise.all([loadLeagues(), loadUsers()]);
  await loadTeams();

  startRefreshInterval();
});

onUnmounted(() => {
  stopRefreshInterval();
});
</script>

<style scoped>
.admin-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 24px 0;
}

.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.large-icon {
  width: 48px;
  height: 48px;
}

.status-message {
  text-align: center;
  padding: 48px;
  color: #6b7280;
  font-size: 16px;
}

.no-teams {
  text-align: center;
  padding: 48px;
  color: #6b7280;
}

.no-teams p {
  margin: 16px 0 24px 0;
  font-size: 16px;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.team-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
  background: #fafafa;
}

.team-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.team-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.team-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-action:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-action.btn-danger:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.team-description {
  color: #6b7280;
  margin-bottom: 20px;
  font-size: 14px;
  line-height: 1.5;
}

.trainers-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.no-trainers {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 6px;
  color: #9ca3af;
  font-size: 14px;
}

.trainers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trainer-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trainer-avatar,
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-placeholder {
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.trainer-info,
.user-info {
  display: flex;
  flex-direction: column;
}

.trainer-name,
.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.trainer-email,
.user-email {
  font-size: 12px;
  color: #6b7280;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  font-size: 14px;
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

.btn-gray {
  background-color: #e5e7eb;
  color: #4b5563;
}

.btn-gray:hover:not(:disabled) {
  background-color: #d1d5db;
}

.btn-red {
  background-color: #ef4444;
  color: white;
}

.btn-red:hover:not(:disabled) {
  background-color: #dc2626;
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
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal h2 {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.search-container {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.trainers-selection {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fafafa;
}

.no-results {
  text-align: center;
  padding: 32px 16px;
  color: #9ca3af;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.users-list {
  max-height: 280px;
  overflow-y: auto;
}

.user-item {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-item:last-child {
  border-bottom: none;
}

.user-checkbox {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.user-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex: 1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
}

.warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #b91c1c;
  font-size: 14px;
  font-weight: 500;
  margin: 16px 0;
}

.loading-spinner {
  animation: spin 1s linear infinite;
  width: 16px;
  height: 16px;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .admin-container {
    padding: 16px;
  }

  .header-flex {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .teams-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    margin: 20px;
    padding: 20px;
  }
}
</style>
