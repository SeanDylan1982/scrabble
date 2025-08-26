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

import { getPool, tryGetPool, uid } from "../db";
import { initGameForRoom } from "./game";

function nowIso() {
  return new Date().toISOString();
}

const memRooms = new Map<string, LobbyRoom>();

export const listRooms: RequestHandler = async (_req, res) => {
  const pool = tryGetPool();
  if (!pool) {
    const rooms = Array.from(memRooms.values()).sort((a,b)=>a.createdAt < b.createdAt ? 1 : -1);
    return res.json({ rooms } as LobbyListResponse);
  }
  const { rows } = await pool.query(
    `select r.*, coalesce(json_agg(jsonb_build_object('id', p.id, 'name', p.name, 'isHost', p.is_host)) filter (where p.id is not null), '[]') as players
     from rooms r left join room_players p on p.room_id = r.id
     group by r.id
     order by r.created_at desc`,
  );
  const rooms = rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    status: r.status,
    createdAt: r.created_at,
    players: r.players,
    hostId: r.host_id,
    maxPlayers: r.max_players,
  }));
  const response: LobbyListResponse = { rooms };
  res.json(response);
};

export const getRoom: RequestHandler = async (req, res) => {
  const pool = getPool();
  const id = req.params.id;
  const { rows } = await pool.query(
    `select r.*, coalesce(json_agg(jsonb_build_object('id', p.id, 'name', p.name, 'isHost', p.is_host)) filter (where p.id is not null), '[]') as players
     from rooms r left join room_players p on p.room_id = r.id
     where r.id = $1
     group by r.id`,
    [id],
  );
  if (rows.length === 0)
    return res.status(404).json({ error: "Room not found" });
  const r = rows[0];
  const room: LobbyRoom = {
    id: r.id,
    name: r.name,
    status: r.status,
    createdAt: r.created_at,
    players: r.players,
    hostId: r.host_id,
    maxPlayers: r.max_players,
  };
  res.json({ room });
};

export const createRoom: RequestHandler = async (req, res) => {
  const pool = getPool();
  const body = req.body as CreateRoomRequest;
  if (!body?.name || !body?.playerName)
    return res.status(400).json({ error: "Missing name or playerName" });

  const roomId = uid();
  const playerId = uid();
  const maxPlayers = Math.max(2, Math.min(body.maxPlayers ?? 2, 8));

  await pool.query(
    "insert into rooms(id, name, status, host_id, max_players) values ($1,$2,$3,$4,$5)",
    [roomId, body.name.trim().slice(0, 40), "waiting", playerId, maxPlayers],
  );
  await pool.query(
    "insert into room_players(id, room_id, name, is_host) values ($1,$2,$3,$4)",
    [playerId, roomId, body.playerName, true],
  );

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
    maxPlayers,
  };

  const response: CreateRoomResponse = { room, player };
  res.status(201).json(response);
};

export const joinRoom: RequestHandler = async (req, res) => {
  const pool = getPool();
  const id = req.params.id;
  const body = req.body as JoinRoomRequest;
  if (!body?.playerName)
    return res.status(400).json({ error: "Missing playerName" });

  const { rows } = await pool.query("select * from rooms where id=$1", [id]);
  if (rows.length === 0)
    return res.status(404).json({ error: "Room not found" });
  const roomRow = rows[0];
  if (roomRow.status !== "waiting")
    return res.status(400).json({ error: "Game already started" });
  const { rows: countRows } = await pool.query(
    "select count(*)::int as c from room_players where room_id=$1",
    [id],
  );
  if (countRows[0].c >= roomRow.max_players)
    return res.status(400).json({ error: "Room is full" });

  const playerId = uid();
  await pool.query(
    "insert into room_players(id, room_id, name, is_host) values ($1,$2,$3,false)",
    [playerId, id, body.playerName],
  );

  const { rows: r2 } = await pool.query(
    `select r.*, coalesce(json_agg(jsonb_build_object('id', p.id, 'name', p.name, 'isHost', p.is_host)) filter (where p.id is not null), '[]') as players
     from rooms r left join room_players p on p.room_id = r.id where r.id=$1 group by r.id`,
    [id],
  );
  const r = r2[0];
  const room: LobbyRoom = {
    id: r.id,
    name: r.name,
    status: r.status,
    createdAt: r.created_at,
    players: r.players,
    hostId: r.host_id,
    maxPlayers: r.max_players,
  };
  const player: LobbyPlayer = { id: playerId, name: body.playerName };
  res.json({ room, player } as JoinRoomResponse);
};

export const leaveRoom: RequestHandler = async (req, res) => {
  const pool = getPool();
  const id = req.params.id;
  const body = req.body as LeaveRoomRequest;
  if (!body?.playerId)
    return res.status(400).json({ error: "Missing playerId" });

  await pool.query("delete from room_players where id=$1 and room_id=$2", [
    body.playerId,
    id,
  ]);

  // If host left
  const { rows: hostRows } = await pool.query(
    "select host_id from rooms where id=$1",
    [id],
  );
  if (hostRows.length === 0) return res.json({ ok: true });
  if (hostRows[0].host_id === body.playerId) {
    const { rows: remaining } = await pool.query(
      "select id from room_players where room_id=$1 limit 1",
      [id],
    );
    if (remaining.length === 0) {
      await pool.query("delete from rooms where id=$1", [id]);
      return res.json({ ok: true });
    } else {
      await pool.query("update rooms set host_id=$1 where id=$2", [
        remaining[0].id,
        id,
      ]);
      await pool.query("update room_players set is_host=true where id=$1", [
        remaining[0].id,
      ]);
    }
  }

  // Return updated room
  const { rows } = await pool.query(
    `select r.*, coalesce(json_agg(jsonb_build_object('id', p.id, 'name', p.name, 'isHost', p.is_host)) filter (where p.id is not null), '[]') as players
     from rooms r left join room_players p on p.room_id = r.id where r.id=$1 group by r.id`,
    [id],
  );
  if (rows.length === 0) return res.json({ ok: true });
  const r = rows[0];
  const room: LobbyRoom = {
    id: r.id,
    name: r.name,
    status: r.status,
    createdAt: r.created_at,
    players: r.players,
    hostId: r.host_id,
    maxPlayers: r.max_players,
  };

  res.json({ room });
};

export const startRoom: RequestHandler = async (req, res) => {
  const pool = getPool();
  const id = req.params.id;
  const body = req.body as StartRoomRequest;
  if (!body?.playerId)
    return res.status(400).json({ error: "Missing playerId" });
  const { rows } = await pool.query("select * from rooms where id=$1", [id]);
  if (rows.length === 0)
    return res.status(404).json({ error: "Room not found" });
  const roomRow = rows[0];
  if (roomRow.host_id !== body.playerId)
    return res.status(403).json({ error: "Only host can start the game" });
  const { rows: players } = await pool.query(
    "select id, name, is_host from room_players where room_id=$1 order by is_host desc",
    [id],
  );
  if (players.length !== 2)
    return res
      .status(400)
      .json({ error: "Exactly 2 players required to start" });
  await pool.query("update rooms set status='started' where id=$1", [id]);

  const room: LobbyRoom = {
    id,
    name: roomRow.name,
    status: "started",
    createdAt: roomRow.created_at,
    players: players.map((p: any) => ({
      id: p.id,
      name: p.name,
      isHost: p.is_host,
    })),
    hostId: roomRow.host_id,
    maxPlayers: roomRow.max_players,
  };
  try {
    initGameForRoom(room);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
  res.json({ room });
};
