import { RequestHandler } from "express";
import {
  LobbyListResponse,
  LobbyRoom,
  LobbyPlayer,
  CreateRoomRequest,
  CreateRoomResponse,
  JoinRoomRequest,
  JoinRoomResponse,
  LeaveRoomRequest,
  StartRoomRequest,
} from "@shared/api";

import { pool, uid } from "../db";

function nowIso() {
  return new Date().toISOString();
}

export const listRooms: RequestHandler = (_req, res) => {
  const response: LobbyListResponse = {
    rooms: Array.from(rooms.values()).sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1,
    ),
  };
  res.json(response);
};

export const getRoom: RequestHandler = (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ error: "Room not found" });
  res.json({ room });
};

export const createRoom: RequestHandler = (req, res) => {
  const body = req.body as CreateRoomRequest;
  if (!body?.name || !body?.playerName)
    return res.status(400).json({ error: "Missing name or playerName" });

  const roomId = uid();
  const playerId = uid();

  const player: LobbyPlayer = {
    id: playerId,
    name: body.playerName,
    isHost: true,
  };
  const room: LobbyRoom = {
    id: roomId,
    name: body.name.trim().slice(0, 40),
    status: "waiting",
    createdAt: nowIso(),
    players: [player],
    hostId: playerId,
    maxPlayers: Math.max(2, Math.min(body.maxPlayers ?? 2, 8)),
  };

  rooms.set(roomId, room);

  const response: CreateRoomResponse = { room, player };
  res.status(201).json(response);
};

export const joinRoom: RequestHandler = (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ error: "Room not found" });
  const body = req.body as JoinRoomRequest;
  if (!body?.playerName)
    return res.status(400).json({ error: "Missing playerName" });

  if (room.status !== "waiting")
    return res.status(400).json({ error: "Game already started" });
  if (room.players.length >= room.maxPlayers)
    return res.status(400).json({ error: "Room is full" });

  const player: LobbyPlayer = { id: uid(), name: body.playerName };
  room.players.push(player);
  res.json({ room, player } as JoinRoomResponse);
};

export const leaveRoom: RequestHandler = (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ error: "Room not found" });
  const body = req.body as LeaveRoomRequest;
  if (!body?.playerId)
    return res.status(400).json({ error: "Missing playerId" });

  room.players = room.players.filter((p) => p.id !== body.playerId);

  // If host leaves, assign new host or delete room
  if (room.hostId === body.playerId) {
    if (room.players.length > 0) {
      room.hostId = room.players[0].id;
      room.players[0].isHost = true;
    } else {
      rooms.delete(room.id);
      return res.json({ ok: true });
    }
  }

  res.json({ room });
};

import { initGameForRoom } from "./game";

export const startRoom: RequestHandler = (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ error: "Room not found" });
  const body = req.body as StartRoomRequest;
  if (!body?.playerId)
    return res.status(400).json({ error: "Missing playerId" });
  if (room.hostId !== body.playerId)
    return res.status(403).json({ error: "Only host can start the game" });

  if (room.players.length !== 2)
    return res
      .status(400)
      .json({ error: "Exactly 2 players required to start" });

  room.status = "started";
  try {
    initGameForRoom(room);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
  res.json({ room });
};
