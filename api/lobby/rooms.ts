import type { VercelRequest, VercelResponse } from "@vercel/node";
import { listRooms, createRoom } from "../../server/routes/lobby";
import { ensureDbInitialized } from "../_init-db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureDbInitialized();

    if (req.method === "GET") {
      return listRooms(req as any, res as any, () => {});
    } else if (req.method === "POST") {
      return createRoom(req as any, res as any, () => {});
    } else {
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (e: any) {
    console.error("--- LOBBY API ERROR (rooms) ---");
    console.error(e);
    res.status(500).json({
      error: "An internal server error occurred in /api/lobby/rooms.",
      details: e.message || "No error message available.",
    });
  }
}
