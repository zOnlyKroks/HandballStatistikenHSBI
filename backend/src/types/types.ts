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
  accuracy: {
    gesamtSchuesse: number;
    schuesseAufZiel: number;
    genauigkeitProzent: number;
  };
  statistics: {
    spiele: number;
    tore: number;
    assists: number;
    throws: number;
    quoteSeven: number;
    zeitstrafen: number;
    roteKarten: number;
    paradeQuote: number;
  };
}

export interface Spielaktionen {
  id: number;
  spielaktion: string;
  performance_wertung: number;
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
