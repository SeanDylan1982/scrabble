import { useEffect, useMemo, useState } from "react";
import {
  LobbyListResponse,
  LobbyRoom,
  CreateRoomRequest,
  CreateRoomResponse,
} from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, LogIn, RefreshCw, Crown, Gamepad2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Lobby() {
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [roomName, setRoomName] = useState("New Room");
  const [playerName, setPlayerName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("playerName");
    if (saved) setPlayerName(saved);
  }, []);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/lobby/rooms");
      const data = (await res.json()) as LobbyListResponse;
      setRooms(data.rooms);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    try {
      setCreating(true);
      localStorage.setItem("playerName", playerName.trim());
      const res = await fetch("/api/lobby/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName,
          playerName,
        } as CreateRoomRequest),
      });
      const data = (await res.json()) as CreateRoomResponse;
      localStorage.setItem("playerId", data.player.id);
      navigate(`/room/${data.room.id}`);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (roomId: string) => {
    if (!playerName.trim()) return;
    localStorage.setItem("playerName", playerName.trim());
    const res = await fetch(`/api/lobby/rooms/${roomId}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerName }),
    });
    const data = await res.json();
    if (data?.player?.id) localStorage.setItem("playerId", data.player.id);
    navigate(`/room/${roomId}`);
  };

  const soloStart = () => navigate("/game/solo");

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
                Scrabble Online
              </h1>
              <p className="text-gray-600">
                Create or join a room to play with friends.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={soloStart}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <Gamepad2 className="w-4 h-4" /> Start solo game
            </Button>
            <Button variant="outline" onClick={fetchRooms} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Create room */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Create a room</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Your name</label>
                <Input
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g. Alex"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Room name</label>
                <Input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Friday Night"
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={!playerName || creating}
                className="w-full gap-2"
              >
                <Plus className="w-4 h-4" /> Create
              </Button>
              <p className="text-xs text-gray-500">
                Share the room link with friends after creating.
              </p>
            </CardContent>
          </Card>

          {/* Rooms list */}
          <Card className="md:col-span-2">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Available rooms</CardTitle>
              {loading && (
                <span className="text-sm text-gray-500">Loading...</span>
              )}
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <div className="text-gray-600">No rooms yet. Create one!</div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="border rounded-lg p-4 bg-white shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-800 flex items-center gap-2">
                            {room.name}
                            {room.status === "started" && (
                              <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                                In game
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <Users className="w-4 h-4" />
                            {room.players.length} / {room.maxPlayers}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {room.status === "waiting" ? (
                            <Button
                              size="sm"
                              onClick={() => handleJoin(room.id)}
                              className="gap-2"
                            >
                              <LogIn className="w-4 h-4" /> Join
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" disabled>
                              In progress
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Players */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {room.players.map((p) => (
                          <span
                            key={p.id}
                            className="px-2 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1"
                          >
                            {p.isHost && (
                              <Crown className="w-3 h-3 text-yellow-500" />
                            )}{" "}
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
