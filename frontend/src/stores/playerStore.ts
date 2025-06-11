import { defineStore } from "pinia";
import { api } from "../net/axios";
import { AuthUser, User } from "../types/types";

export const usePlayerStore = defineStore("player", {
  state: () => ({
    players: new Map<string, AuthUser | User>(),
    loading: false,
    error: "" as string,
  }),
  actions: {
    /**
     * Fetch full player data by ID and store it
     */
    async fetchFull(id: string) {
      this.loading = true;
      this.error = "";
      try {
        const res = await api.get<{ player: User }>(`/api/players/${id}/full`);

        if (res.data && res.data.player) {
          this.players.set(id, res.data.player);
        } else {
          throw new Error("Invalid response format");
        }
        return res.data.player;
      } catch (err: unknown) {
        this.error = (err as Error).message || "Failed to load player (full)";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async loadAccuracy(id: string) {
      const accData = (await api.get(`/api/players/${id}/accuracy`)).data
        .accuracy;

      const player = await this.getUser(id);

      if (!player) {
        console.error(`Player with ID ${id} not found`);
        return;
      }

      player.accuracy = {
        gesamtSchuesse: accData.gesamtSchuesse,
        schuesseAufZiel: accData.schuesseAufZiel,
        genauigkeitProzent: accData.genauigkeitProzent,
      };

      this.players.set(id, player);
    },

    async loadBaseStatistics(id: string) {
      const basicStatistics = (
        await api.get(`/api/players/${id}/base-statistics`)
      ).data.statistics;

      const player = await this.getUser(id);

      if (player) {
        player.statistics = basicStatistics;

        this.players.set(id, player);
      } else {
        console.error(`Player with ID ${id} not found`);
      }
    },

    /**
     * Clear current player profiles
     */
    clear() {
      this.players.clear(); // Clear all players
      this.error = "";
      this.loading = false;
    },
    /**
     * Remove a player by ID
     */
    removePlayer(id: string) {
      this.players.delete(id); // Remove player by ID
    },

    async getUser(id: string): Promise<User | null> {
      const player = this.players.get(id);

      if (!player) {
        const user = await this.fetchFull(id);

        return user;
      } else {
        return player && !("password" in player) ? player : null;
      }
    },
  },
});
