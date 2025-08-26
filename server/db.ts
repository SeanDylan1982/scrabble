import { Pool } from "pg";

let _pool: Pool | null = null;

export function getPool(): Pool {
  if (_pool) return _pool;
  const raw = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL not set");
  // Ensure postgres scheme and keep URL-encoded password
  const conn = raw.replace(/^postgresql:\/\//, "postgres://");
  _pool = new Pool({
    connectionString: conn,
    ssl: { rejectUnauthorized: false },
  });
  return _pool;
}

export async function initDb() {
  const pool = getPool();
  await pool.query(`
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
  `);
}

export function uid(len = 8) {
  return Math.random()
    .toString(36)
    .slice(2, 2 + len);
}
