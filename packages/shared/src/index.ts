// ── User ──
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
}

// ── Room ──
export interface Room {
  id: string;
  name: string;
  createdAt: Date;
}

// ── Auth ──
export interface AuthPayload {
  userId: string;
  username: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  serverPassword: string;
}

// ── Rooms ──
export interface JoinRoomRequest {
  roomName: string;
}

export interface TokenResponse {
  token: string;
  roomName: string;
}

// ── Server Info ──
export interface ServerInfo {
  name: string;
  requiresPassword: boolean;
}
