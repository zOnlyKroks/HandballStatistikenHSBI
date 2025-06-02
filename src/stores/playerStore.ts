import { defineStore } from "pinia";
import { api } from "../net/axios";
import { PlayerFull, PlayerPartial } from "../interface/interfaces";

export const usePlayerStore = defineStore("player", {
  state: () => ({
    // Store a collection of players, which can be identified by their IDs
    players: new Map<number, PlayerPartial | PlayerFull>(), // Use a Map to store players by their ID
    loading: false,
    error: "" as string,
  }),
  actions: {
    /**
     * Fetch full player data by ID and store it
     */
    async fetchFull(id: number) {
      this.loading = true;
      this.error = "";
      try {
        const res = await api.get<{ player: PlayerFull }>(
          `/api/players/${id}/full`
        );
        // Ensure we're setting data properly in the Map
        if (res.data && res.data.player) {
          this.players.set(id, res.data.player); // Store player in the map by ID
        } else {
          throw new Error("Invalid response format");
        }
        return res.data.player; // Return the player data for convenience
      } catch (err: unknown) {
        this.error = (err as Error).message || "Failed to load player (full)";
        throw err; // Re-throw the error so the calling component can handle it
      } finally {
        this.loading = false;
      }
    },
    /**
     * Fetch multiple players' data and store them
     */
    async fetchMultiple(ids: number[]) {
      this.loading = true;
      this.error = "";
      try {
        const res = await api.get<{ players: PlayerFull[] }>(
          `/api/players/multiple`,
          {
            params: { ids: ids.join(",") }, // Assuming the API accepts comma-separated player IDs
          }
        );
        if (res.data && Array.isArray(res.data.players)) {
          res.data.players.forEach((player) => {
            if (player && player.id) {
              this.players.set(player.id, player); // Store each player in the map by ID
            }
          });
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err: unknown) {
        this.error =
          (err as Error & { response?: { data?: { message?: string } } })
            .response?.data?.message || "Failed to load players";
        throw err; // Re-throw the error so the calling component can handle it
      } finally {
        this.loading = false;
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
    removePlayer(id: number) {
      this.players.delete(id); // Remove player by ID
    },
    /**
     * Get a player by ID
     */
    getPlayer(id: number): PlayerFull | PlayerPartial | undefined {
      return this.players.get(id); // Retrieve a player by ID
    },
  },
});
