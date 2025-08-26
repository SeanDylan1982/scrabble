/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Lobby types
export type RoomStatus = "waiting" | "started" | "finished";

export interface LobbyPlayer {
  id: string;
  name: string;
  isHost?: boolean;
}

export interface LobbyRoom {
  id: string;
  name: string;
  status: RoomStatus;
  createdAt: string;
  players: LobbyPlayer[];
  hostId: string;
  maxPlayers: number;
}

export interface LobbyListResponse {
  rooms: LobbyRoom[];
}

export interface CreateRoomRequest {
  name: string;
  playerName: string;
  maxPlayers?: number;
}

export interface CreateRoomResponse {
  room: LobbyRoom;
  player: LobbyPlayer;
}

export interface JoinRoomRequest {
  playerName: string;
}

export interface JoinRoomResponse {
  room: LobbyRoom;
  player: LobbyPlayer;
}

export interface LeaveRoomRequest {
  playerId: string;
}

export interface StartRoomRequest {
  playerId: string;
}
