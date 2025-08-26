# Scrabble Online

A modern, production‑ready, multiplayer Scrabble game with a lobby, turn‑based 2‑player matches, persistent rooms (Supabase Postgres), and a polished React UI.

## Features

- Multiplayer lobby with create/join/leave, host control, 2‑player requirement to start
- Turn‑based gameplay: racks, board placement, scoring, premium squares, move validation, pass/recall/shuffle
- Solo mode for quick play/testing
- Persistent rooms backed by Supabase Postgres (no secrets committed)
- TypeScript end‑to‑end, React 18 + Vite + TailwindCSS
- Express server integrated with Vite (single dev server)

## Tech Stack

- Frontend: React 18, React Router 6, TailwindCSS 3
- Backend: Express + Vite SSR integration
- DB: Supabase Postgres (via `pg` client)
- Tooling: TypeScript, Vitest, SWC, shadcn/ui components

## Quick Start

Requirements: Node 18+ and pnpm.

```bash
pnpm install
pnpm dev
```

App runs on http://localhost:8080

- Lobby (homepage): create or join rooms
- Room lobby: /room/:roomId
- Game: /game/:roomId (server multiplayer) or /game/solo (local solo)

## Environment Variables

Set a single environment variable for persistence:

- SUPABASE_DB_URL: your Postgres connection string (from Supabase “Direct connection”).
  - If the password contains special characters (&, #, +, /, etc.), URL‑encode them (e.g. `&` → `%26`, `#` → `%23`, `+` → `%2B`, `/` → `%2F`).
  - Example scheme normalization: `postgresql://…` should be accepted, but this app normalizes to `postgres://…` internally.

In development (local), you can export it in your shell before `pnpm dev`.

Never commit secrets to git.

## Database Schema

The server will auto‑create these tables if they do not exist:

```sql
create table if not exists rooms (
  id text primary key,
  name text not null,
  status text not null default 'waiting',
  created_at timestamptz not null default now(),
  host_id text not null,
  max_players int not null default 2
);

create table if not exists room_players (
  id text primary key,
  room_id text not null references rooms(id) on delete cascade,
  name text not null,
  is_host boolean not null default false
);

create index if not exists idx_room_players_room on room_players(room_id);
```

## API

Base path: `/api`

Lobby
- GET `/lobby/rooms` → `{ rooms: LobbyRoom[] }`
- GET `/lobby/rooms/:id` → `{ room: LobbyRoom }`
- POST `/lobby/rooms` body `{ name, playerName, maxPlayers? }` → `{ room, player }`
- POST `/lobby/rooms/:id/join` body `{ playerName }` → `{ room, player }`
- POST `/lobby/rooms/:id/leave` body `{ playerId }` → `{ room | ok }`
- POST `/lobby/rooms/:id/start` body `{ playerId }` → `{ room }` (requires exactly 2 players; host only)

Game (2‑player)
- GET `/game/:id/state?playerId=…` → redacted state (only your rack)
- POST `/game/:id/move` body `{ playerId, placements: [{ row, col, tileId, letter? }] }` → `{ ok }`
- POST `/game/:id/pass` body `{ playerId }` → `{ ok }`

## Usage Flow

1) Open homepage → enter your name → Create room → share link.
2) Second player joins room → host presses Start → both are redirected to game.
3) Current player selects tiles from rack, clicks squares to place, then “Play Word”.
4) Draw tiles, turn passes to opponent. Pass/Recall/Shuffle as needed.

Solo testing: `/game/solo` (local state).

## Scripts

- `pnpm dev` – run client+server dev (Vite + Express)
- `pnpm build` – build client and server
- `pnpm start` – run built server
- `pnpm typecheck` – TypeScript checks
- `pnpm test` – Vitest

## Deployment

- Vercel or Netlify are recommended. Ensure SUPABASE_DB_URL is set in the platform’s env settings.
- On Builder.io, you can connect providers via MCP: 
  - Connect Vercel or Netlify in [Open MCP popover](#open-mcp-popover) and deploy.

## Troubleshooting

- 404 “Room not found”: ensure you created a room (persisted in DB) and are using the correct URL.
- DB connection errors: verify SUPABASE_DB_URL and URL‑encoding of special characters, and that the project IPs are allowed in Supabase if applicable.
- First move must cover center; moves must be contiguous and single row/column; squares cannot overwrite existing tiles.

## Roadmap

- Supabase Realtime channels for live updates (remove polling)
- Auth (Supabase Auth) and profiles
- Spectator mode, rematches, chat
- Dictionary‑based validation
