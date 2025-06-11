import { defineStore } from "pinia";
import { api } from "../net/axios";
import { User } from "../types/types";

export const usePlayerStore = defineStore("player", {
  state: () => ({
    players: new Map<string, User>(),
    loading: false,
    error: "" as string,
  }),

  getters: {
    playersArray: (state) => {
      return Array.from(state.players.values());
    },
  },

  actions: {
    /**
     * Fetch full player data by ID and store it
     */
    async fetchFull(id: string): Promise<User> {
      this.loading = true;
      this.error = "";
      try {
        const res = (await api.get(`/api/players/${id}/full`)).data
          .player as User;

        this.players.set(id, res);
        return res;
      } catch (err: unknown) {
        this.error = (err as Error).message || "Failed to load player (full)";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getTeamMembers(id: number | null): Promise<User[]> {
      if (!id) {
        id = -1;
      }

      const response = await api.get(`/team/${id}/players`);

      const data = response.data as User[];
      const full: User[] = [];

      for (let i = 0; i < data.length; i++) {
        const player = data[i];

        full.push(await this.fetchFull(player.uuid));
      }

      return full;
    },

    /**
     * Clear current player profiles
     */
    clear() {
      this.players.clear(); // Clear all players
      this.error = "";
      this.loading = false;
    },

    removePlayer(id: string) {
      this.players.delete(id);
    },

    async getUser(id: string): Promise<User | null> {
      const player = this.players.get(id);
      if (!player) {
        const user = await this.fetchFull(id);
        return user;
      } else {
        return player && "vorname" in player ? player : null;
      }
    },

    async setPlayerProfileData(id: string, data: Partial<User>) {
      await api.post(`/api/players/${id}/profileData`, {
        profileData: data,
      });
    },
  },
});
