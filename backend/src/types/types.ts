export interface AuthUser {
  uuid: string;
  email: string;
  password: string;
}

export interface User {
  uuid: string;
  email: string;
  vorname: string;
  nachname: string;
  koerpergroesse: number;
  geburtsdatum: Date;
  trikotnummer: number;
  mannschaftId: number | null;
  mannschaftName: string | null;
  mannschaftLigaId: number | null;
  position: string | null;
  position_id: number | null;
  league_id: number | null;
  league_name: string | null;
  league_level: number | null;
  profileImage: string;
  isAdmin: boolean;
}

export interface Mannschaft {
  name: string;
  liga_name: string;
}

export interface Liga {
  name: string;
  stufe: number;
  anzahl_mannschaften: number;
}

export interface Position {
  id: number;
  positionstitel: string;
}

export interface BlacklistedTokens {
  id: number;
  authUser_uuid: string;
  token: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface Spielbericht {
  idSpiel: number;
  mannschaft_name: string;
  mannschaft_liga_name: string;
  spieltag: number;
  saison: number;
  datum: Date;
  gegner: string;
  spielort: string;
}

export interface Spielsituation {
  spielbericht_idSpiel: number;
  zeitstempel: Date;
}

export interface Spielaktionen {
  id: number;
  spielaktion: string;
  performance_wertung: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  teamName?: string;
  league?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    uuid: string;
    email: string;
    name?: string;
    createdAt?: Date;
  };
}

// Enums for consistency
export enum UserRole {
  PLAYER = "PLAYER",
  COACH = "COACH",
  MANAGER = "MANAGER",
}

export enum PositionType {
  UNKNOWN = 0,
  GOALKEEPER = 1,
  DEFENDER = 2,
  MIDFIELDER = 3,
  FORWARD = 4,
}
