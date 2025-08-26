import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { listRooms, createRoom, joinRoom, leaveRoom, startRoom, getRoom } from "./routes/lobby";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Lobby API
  app.get("/api/lobby/rooms", listRooms);
  app.get("/api/lobby/rooms/:id", getRoom);
  app.post("/api/lobby/rooms", createRoom);
  app.post("/api/lobby/rooms/:id/join", joinRoom);
  app.post("/api/lobby/rooms/:id/leave", leaveRoom);
  app.post("/api/lobby/rooms/:id/start", startRoom);

  return app;
}
