export interface AuthUser {
  uuid: string;
  email: string;
  password: string;
}

export interface Team {
  id: number;
  name: string;
  leagueId: number;
  leagueName: string;
  leagueLevel: number;
  trainers: User[];
}

export interface TrainerAssignment {
  uuid: string;
  teamId: number;
}

export interface League {
  id: number;
  name: string;
  level: number;
  anzahl_mannschaften: number;
}

export interface User {
  uuid: string;
  email: string;
  vorname: string;
  nachname: string;
  koerpergroesse: number;
  geburtsdatum: string | Date;
  trikotnummer: number;

  mannschaftId: number | null;
  mannschaftName: string | null;
  mannschaftLigaId: number | null;

  position_id: number | null;
  position: string | null;

  league_id: number | null;
  league_name: string | null;
  league_level: number | null;

  profileImage: string;
  isAdmin: boolean;

  goals?: number;
  assists?: number;
  games?: number;
  rating?: number;

  accuracy?: {
    gesamtSchuesse: number;
    schuesseAufZiel: number;
    genauigkeitProzent: number;
  };

  statistics?: {
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

export interface Position {
  title: string;
  id: string;
}
