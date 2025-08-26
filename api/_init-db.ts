import { initDb } from "../server/db";

// Initialize database once when any API route is called
let dbInitialized = false;

export async function ensureDbInitialized() {
  if (!dbInitialized) {
    try {
      await initDb();
      dbInitialized = true;
      console.log("Database initialized for Vercel");
    } catch (e) {
      console.error("DB init error in Vercel:", e);
    }
  }
}
