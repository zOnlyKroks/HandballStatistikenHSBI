export interface AuthUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

// Player interfaces
export type PlayerPartial = {
  id: number;
  name: string;
  email: string;
  role: string;
  position: string;
};

export type PlayerFull = PlayerPartial & {
  age: number;
  height: number;
  jerseyNumber: number;
};
