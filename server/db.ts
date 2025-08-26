import { Pool } from 'pg';

const DATABASE_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '';

export const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

export async function initDb() {
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
  return Math.random().toString(36).slice(2, 2 + len);
}
