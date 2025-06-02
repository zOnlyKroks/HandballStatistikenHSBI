export interface Player {
  id: number;
  name: string;
  position: string;
  goals: number;
  assists: number;
  matches: number;
}

export interface TeamStats {
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface TeamData {
  players: Player[];
  stats: TeamStats;
}
