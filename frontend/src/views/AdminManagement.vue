<template>
  <div class="admin-container">
    <!-- Header -->
    <div class="header-card">
      <div class="header-flex">
        <h1 class="page-title">Team & User Administration</h1>
        <div class="header-actions">
          <button class="btn btn-blue" @click="openUserCreateModal">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Create User
          </button>
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
            Create Team
          </button>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-nav">
      <button
        class="tab-button"
        :class="{ active: activeTab === 'teams' }"
        @click="activeTab = 'teams'"
      >
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Teams
      </button>
      <button
        class="tab-button"
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9.7a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
        Users
      </button>
    </div>

    <!-- Teams Tab Content -->
    <TeamsTab
      v-if="activeTab === 'teams'"
      :teams="teamsWithTrainers"
      :loading="loading"
      :refreshing="refreshing"
      @open-create-modal="openCreateModal"
      @open-edit-modal="openEditModal"
      @delete-team="confirmDelete"
    />

    <!-- Users Tab Content -->
    <UsersTab
      v-if="activeTab === 'users'"
      :users="filteredUsersForDisplay"
      :loading="loadingUsers"
      :search-query="userSearchQuery"
      @create-user="openUserCreateModal"
      @edit-user="openUserEditModal"
      @delete-user="confirmUserDelete"
    />

    <!-- Modals -->
    <TeamModal
      v-if="showModal"
      :leagues="leagues"
      :users="filteredUsers"
      :editing-team="editingTeam"
      :saving="saving"
      :form="form"
      :can-save="canSaveTeam"
      @close="closeModal"
      @save="saveTeam"
      @update:form="updateForm"
    />

    <UserModal
      v-if="showUserModal"
      :teams="teams"
      :editing-user="editingUser"
      :saving="savingUser"
      :form="userForm"
      :can-save="canSaveUser"
      @close="closeUserModal"
      @save="saveUser"
      @update:form="updateUserForm"
    />

    <DeleteConfirmationModal
      v-if="teamToDelete"
      type="team"
      :name="teamToDelete.name"
      @cancel="teamToDelete = null"
      @confirm="deleteTeam"
    />

    <DeleteConfirmationModal
      v-if="userToDelete"
      type="user"
      :name="`${userToDelete.vorname} ${userToDelete.nachname}`"
      @cancel="userToDelete = null"
      @confirm="deleteUser"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { api } from "../net/axios";
import type { User, Team, League } from "../types/types";
import DeleteConfirmationModal from "./admin/DeleteConfirmationModal.vue";
import UserModal from "./admin/UserModal.vue";
import TeamModal from "./admin/TeamModal.vue";
import UsersTab from "./admin/UsersTab.vue";
import TeamsTab from "./admin/TeamsTab.vue";
import { usePlayerStore } from "../stores/playerStore";

const playerStore = usePlayerStore();

// State
const activeTab = ref("teams");
const loading = ref(true);
const loadingUsers = ref(false);
const refreshing = ref(false);
const saving = ref(false);
const savingUser = ref(false);
const teams = ref<Team[]>([]);
const leagues = ref<League[]>([]);
const showModal = ref(false);
const showUserModal = ref(false);
const editingTeam = ref<Team | null>(null);
const editingUser = ref<User | null>(null);
const teamToDelete = ref<Team | null>(null);
const userToDelete = ref<User | null>(null);
const trainerSearch = ref("");
const userSearchQuery = ref("");

// Form data
const form = ref({
  name: "",
  leagueId: null as number | null,
  trainerIds: [] as string[],
});

const userForm = ref({
  vorname: "",
  nachname: "",
  email: "",
  password: "",
  teamId: null as number | null,
  positionId: -1,
});

const teamsWithTrainers = ref<Team[]>([]);

const enrichTeams = async () => {
  const enriched = await Promise.all(
    teams.value.map(async (team) => {
      await playerStore.getTeamMembers(team.id);
      const trainers = playerStore.playersArray.filter(
        (user) => user.position_id === 8 && user.mannschaftId === team.id
      );
      return { ...team, trainers };
    })
  );
  teamsWithTrainers.value = enriched;
};

const filteredUsers = computed(() => {
  const search = trainerSearch.value.toLowerCase().trim();
  return playerStore.playersArray.filter(
    (user) =>
      `${user.vorname} ${user.nachname}`.toLowerCase().includes(search) ||
      (user.email && user.email.toLowerCase().includes(search))
  );
});

const filteredUsersForDisplay = computed(() => {
  const search = userSearchQuery.value.toLowerCase().trim();
  return playerStore.playersArray.filter(
    (user) =>
      `${user.vorname} ${user.nachname}`.toLowerCase().includes(search) ||
      (user.email && user.email.toLowerCase().includes(search))
  );
});

const canSaveTeam = computed(() => {
  return (
    form.value.name.trim().length > 0 &&
    (editingTeam.value ? true : form.value.leagueId !== null)
  );
});

const canSaveUser = computed(() => {
  const isValid =
    userForm.value.vorname.trim().length > 0 &&
    userForm.value.nachname.trim().length > 0 &&
    userForm.value.email.trim().length > 0;

  return editingUser.value
    ? isValid
    : isValid && userForm.value.password.trim().length > 0;
});

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
    trainerIds: team.trainers?.map((t) => t.uuid) || [],
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

const openUserCreateModal = () => {
  editingUser.value = null;
  userForm.value = {
    vorname: "",
    nachname: "",
    email: "",
    password: "",
    teamId: null,
    positionId: -1,
  };
  showUserModal.value = true;
};

const openUserEditModal = (user: User) => {
  editingUser.value = user;
  userForm.value = {
    vorname: user.vorname,
    nachname: user.nachname,
    email: user.email,
    password: "",
    teamId: user.mannschaftId || null,
    positionId: -1,
  };
  showUserModal.value = true;
};

const closeUserModal = () => {
  showUserModal.value = false;
  editingUser.value = null;
  userForm.value = {
    vorname: "",
    nachname: "",
    email: "",
    password: "",
    teamId: null,
    positionId: -1,
  };
  refreshData();
};

const confirmDelete = (team: Team) => {
  teamToDelete.value = team;
};

const confirmUserDelete = (user: User) => {
  userToDelete.value = user;
};

const updateForm = (field: keyof typeof form.value, value: any) => {
  (form.value as any)[field] = value;
};

const updateUserForm = (field: keyof typeof userForm.value, value: any) => {
  (userForm.value as any)[field] = value;
};

const fetchTeams = async () => {
  try {
    loading.value = true;
    const response = await api.get("/team");
    teams.value = response.data.map((team: any) => {
      const league = leagues.value.find((l) => l.id === team.ligaId);

      return {
        id: team.teamId,
        name: team.teamName,
        leagueId: team.ligaId,
        leagueName: team.ligaName,
        leagueLevel: league ? league.level : 0,
      };
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
  } finally {
    loading.value = false;
  }
};

const fetchUsers = async () => {
  try {
    loadingUsers.value = true;
    const response = await api.get("/team/users/all");

    const users = response.data as User[];
    for (const user of users) {
      playerStore.players.set(user.uuid, user);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    loadingUsers.value = false;
  }
};

const fetchLeagues = async () => {
  try {
    const response = await api.get("/misc/ligen");
    leagues.value = response.data.ligen;
  } catch (error) {
    console.error("Error fetching leagues:", error);
  }
};

const saveTeam = async () => {
  if (!canSaveTeam.value || saving.value) return;

  try {
    saving.value = true;

    if (editingTeam.value) {
      const previousTrainerIds =
        editingTeam.value.trainers?.map((t) => t.uuid) || [];
      const selectedTrainerIds = form.value.trainerIds;

      for (const trainerId of selectedTrainerIds) {
        const trainer = await playerStore.getUser(trainerId);
        if (!trainer) continue;

        await playerStore.setPlayerProfileData(trainer.uuid, {
          position_id: 8,
          mannschaftId: editingTeam.value.id,
        });
      }

      const trainersToRemove = previousTrainerIds.filter(
        (id) => !selectedTrainerIds.includes(id)
      );

      for (const trainerId of trainersToRemove) {
        await playerStore.setPlayerProfileData(trainerId, {
          position_id: -1,
          mannschaftId: -1,
        });
      }
    } else {
      await api.post("/team", {
        name: form.value.name,
        leagueId: form.value.leagueId,
      });

      await refreshData();

      const mannschaftId = teams.value.filter((team) => {
        return team.name === form.value.name;
      });

      for (const trainerId of form.value.trainerIds) {
        const trainer = await playerStore.getUser(trainerId);
        if (!trainer) continue;

        await playerStore.setPlayerProfileData(trainer.uuid, {
          position_id: 8,
          mannschaftId: mannschaftId[0].id,
        });
      }
    }

    closeModal();
    await refreshData();
  } catch (error) {
    console.error("Error saving team:", error);
  } finally {
    saving.value = false;
  }
};

const saveUser = async () => {
  if (!canSaveUser.value || savingUser.value) return;

  try {
    savingUser.value = true;

    if (editingUser.value) {
      const updateData: Partial<User> = {
        vorname: userForm.value.vorname,
        nachname: userForm.value.nachname,
        mannschaftId: userForm.value.teamId,
        position_id: userForm.value.positionId,
      };

      // Remove null values
      const cleanUpdateData: Partial<User> = {};
      if (updateData.vorname !== undefined)
        cleanUpdateData.vorname = updateData.vorname;
      if (updateData.nachname !== undefined)
        cleanUpdateData.nachname = updateData.nachname;
      if (updateData.mannschaftId !== undefined)
        cleanUpdateData.mannschaftId = updateData.mannschaftId;
      if (updateData.position_id !== undefined)
        cleanUpdateData.position_id = updateData.position_id;

      await api.post(`/api/players/${editingUser.value.uuid}/profileData`, {
        profileData: cleanUpdateData,
      });

      const updatedUser = {
        ...editingUser.value,
        ...cleanUpdateData,
        mannschaftName:
          teams.value.find((t) => t.id === userForm.value.teamId)?.name || null,
      };
      playerStore.players.set(editingUser.value.uuid, updatedUser);
    } else {
      const response = await api.post("/auth/register", {
        email: userForm.value.email,
        password: userForm.value.password,
        name: `${userForm.value.vorname} ${userForm.value.nachname}`,
        teamId: userForm.value.teamId,
        positionId: userForm.value.positionId,
      });

      // Add new user to store
      const newUser = response.data.user;
      playerStore.players.set(newUser.uuid, {
        ...newUser,
        mannschaftId: userForm.value.teamId,
        position_id: userForm.value.positionId,
        mannschaftName:
          teams.value.find((t) => t.id === userForm.value.teamId)?.name || null,
      });
    }

    closeUserModal();
  } catch (error) {
    console.error("Error saving user:", error);
  } finally {
    savingUser.value = false;
  }
};

const deleteTeam = async () => {
  if (!teamToDelete.value) return;

  try {
    await api.delete(`/team/${teamToDelete.value.id}`);
    teamToDelete.value = null;
    await fetchTeams();
  } catch (error) {
    console.error("Error deleting team:", error);
  }
};

const deleteUser = async () => {
  if (!userToDelete.value) return;

  try {
    await api.delete(`/api/players/${userToDelete.value.uuid}`);

    playerStore.players.delete(userToDelete.value.uuid);
    userToDelete.value = null;
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

const refreshData = async () => {
  refreshing.value = true;
  await Promise.all([fetchLeagues(), fetchUsers(), fetchTeams()])
    .then(() => {
      enrichTeams();
    })
    .catch((error) => {
      console.error("Error refreshing data:", error);
    })
    .finally(() => {
      refreshing.value = false;
    });
  refreshing.value = false;
};

onMounted(async () => {
  await refreshData();
  refreshInterval = setInterval(refreshData, 30000);
});

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval);
});

let refreshInterval: ReturnType<typeof setInterval> | null = null;
</script>

<style>
.header-actions {
  display: flex;
  gap: 12px;
}

.btn-blue {
  background-color: #3b82f6;
  color: white;
}

.btn-blue:hover:not(:disabled) {
  background-color: #2563eb;
}

.tab-nav {
  display: flex;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 4px;
  margin-bottom: 24px;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  background: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
  flex: 1;
  justify-content: center;
}

.tab-button:hover {
  color: #374151;
  background-color: #f9fafb;
}

.tab-button.active {
  background-color: #10b981;
  color: white;
}

.team-league {
  color: #6b7280;
  font-size: 14px;
  margin: 4px 0 0 0;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.user-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;
  background: #fafafa;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.user-avatar-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-basic-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.user-email {
  color: #6b7280;
  font-size: 14px;
  margin: 4px 0;
}

.user-role {
  color: #059669;
  font-size: 12px;
  font-weight: 500;
  margin: 4px 0 0 0;
}

.user-actions {
  display: flex;
  gap: 8px;
}

.user-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.user-team {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
}

.no-users {
  text-align: center;
  padding: 48px;
  color: #6b7280;
}

.no-users p {
  margin: 16px 0 24px 0;
  font-size: 16px;
}

.league-select,
.team-select,
.position-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  box-sizing: border-box;
}

.league-select:focus,
.team-select:focus,
.position-select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.refresh-indicator {
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
}

@media (max-width: 640px) {
  .users-header {
    flex-direction: column;
    align-items: stretch;
  }

  .user-header {
    flex-direction: column;
    gap: 12px;
  }

  .user-actions {
    align-self: flex-end;
  }

  .header-actions {
    flex-direction: column;
  }

  .tab-nav {
    flex-direction: column;
  }

  .tab-button {
    justify-content: flex-start;
  }
}

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
