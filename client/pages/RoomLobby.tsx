import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LobbyRoom } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Crown, Loader2, Play, Share2, Users } from "lucide-react";

export default function RoomLobby() {
  const { roomId } = useParams();
  const [room, setRoom] = useState<LobbyRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const navigate = useNavigate();

  const playerId = localStorage.getItem("playerId") || "";
  const playerName = localStorage.getItem("playerName") || "";

  const isHost = room?.hostId === playerId;

  const pollDelayRef = useRef(3000);
  const timerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const schedule = (delay: number) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => void fetchRoom(true), delay);
  };

  const fetchRoom = async (silent = false) => {
    if (!roomId || document.visibilityState === "hidden") return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`/api/lobby/rooms/${roomId}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      if (data?.room) setRoom(data.room);
      pollDelayRef.current = 3000;
    } catch {
      // Backoff on network/server errors to avoid hammering and FullStory noise
      pollDelayRef.current = Math.min(pollDelayRef.current * 2, 30000);
    } finally {
      if (!silent) setLoading(false);
      schedule(pollDelayRef.current);
    }
  };

  useEffect(() => {
    let mounted = true;
    const onVis = () => {
      if (document.visibilityState === "visible") schedule(0);
      else abortRef.current?.abort();
    };
    document.addEventListener("visibilitychange", onVis);
    fetchRoom(false);
    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", onVis);
      abortRef.current?.abort();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [roomId]);

  const copyLink = async () => {
    const url = window.location.origin + `/room/${roomId}`;
    await navigator.clipboard.writeText(url);
  };

  const handleStart = async () => {
    if (!roomId) return;
    const res = await fetch(`/api/lobby/rooms/${roomId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
    if (res.ok) navigate(`/game/${roomId}`);
  };

  const handleJoin = async () => {
    if (!roomId || !playerName) return;
    setJoining(true);
    const res = await fetch(`/api/lobby/rooms/${roomId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName }),
    });
    const data = await res.json();
    if (data?.player?.id) localStorage.setItem("playerId", data.player.id);
    setJoining(false);
    fetchRoom();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!room) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl shadow-lg">
              <div className="text-white font-bold text-2xl">S</div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                {room.name}
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" /> {room.players?.length ?? 0} /{" "}
                {room.maxPlayers} players
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={copyLink} className="gap-2">
              <Share2 className="w-4 h-4" /> Copy link
            </Button>
            {isHost && (
              <Button
                onClick={handleStart}
                disabled={(room.players?.length ?? 0) !== 2}
                className="bg-green-600 hover:bg-green-700 gap-2 disabled:opacity-60"
              >
                <Play className="w-4 h-4" /> Start game
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Players</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 flex-wrap">
            {(room.players ?? []).map((p) => (
              <span
                key={p.id}
                className="px-3 py-1 rounded-full bg-white border flex items-center gap-2 shadow-sm"
              >
                {p.isHost && <Crown className="w-4 h-4 text-yellow-500" />}{" "}
                {p.name}
              </span>
            ))}
            {(room.players?.length ?? 0) === 0 && (
              <div className="text-gray-600">No players yet.</div>
            )}
          </CardContent>
        </Card>

        {!playerId && (
          <div className="mt-4">
            <Button onClick={handleJoin} disabled={joining} className="gap-2">
              <LogInIcon /> Join room
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function LogInIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-log-in"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}
