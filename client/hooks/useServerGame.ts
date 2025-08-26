import { useEffect, useMemo, useState, useCallback } from 'react';

export interface ServerTile { id: string; letter: string; points: number; isBlank?: boolean }
export interface ServerBoardTile { row: number; col: number; tile: ServerTile }
export interface ServerPlayer { id: string; name: string; score: number; rack: ServerTile[]; rackCount?: number }

interface ServerState {
  roomId: string;
  board: (ServerBoardTile | null)[][];
  players: ServerPlayer[];
  currentPlayerId: string;
  tilesRemaining: number;
  turnNumber: number;
  lastWord?: string;
  lastScore?: number;
}

export function useServerGame(roomId: string) {
  const [state, setState] = useState<ServerState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<{ row:number; col:number; tile: ServerTile }[]>([]);
  const [selected, setSelected] = useState<ServerTile[]>([]);

  const playerId = localStorage.getItem('playerId') || '';

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/game/${roomId}/state?playerId=${playerId}`);
      const data = await res.json();
      if (res.ok) setState(data);
      else setError(data?.error || 'Error');
    } catch (e:any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [roomId, playerId]);

  useEffect(() => {
    fetchState();
    const i = setInterval(fetchState, 1500);
    return () => clearInterval(i);
  }, [fetchState]);

  const currentPlayer = useMemo(() => state?.players.find(p => p.id === state?.currentPlayerId), [state]);
  const me = useMemo(() => state?.players.find(p => p.id === playerId), [state, playerId]);

  const selectTile = (tile: ServerTile) => {
    if (selected.find(t => t.id === tile.id)) return;
    setSelected(prev => [...prev, tile]);
  };
  const deselectTile = (tileId: string) => setSelected(prev => prev.filter(t => t.id !== tileId));

  const placeTile = (row:number, col:number) => {
    if (!selected.length) return;
    const tile = selected[0];
    setSelected(prev => prev.filter(t => t.id !== tile.id));
    setPlaced(prev => [...prev, { row, col, tile }]);
  };
  const removeTile = (row:number, col:number) => {
    const pt = placed.find(p => p.row===row && p.col===col);
    if (!pt) return;
    setPlaced(prev => prev.filter(p => !(p.row===row && p.col===col)));
    setSelected(prev => [...prev, pt.tile]);
  };

  const shuffleRack = () => setSelected(s => [...s]);
  const recallTiles = () => { setSelected(prev => [...prev, ...placed.map(p=>p.tile)]); setPlaced([]); };

  const playWord = async () => {
    if (!placed.length) return;
    const body = {
      playerId,
      placements: placed.map(p => ({ row: p.row, col: p.col, tileId: p.tile.id }))
    };
    const res = await fetch(`/api/game/${roomId}/move`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || 'Move failed');
    } else {
      setPlaced([]); setSelected([]); fetchState();
    }
  };

  const passTurn = async () => {
    const res = await fetch(`/api/game/${roomId}/pass`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ playerId }) });
    if (res.ok) fetchState();
  };

  return {
    state, loading, error,
    me, currentPlayer,
    placedTiles: placed,
    selectedTiles: selected,
    actions: { selectTile, deselectTile, placeTile: (r:number,c:number)=>placeTile(r,c), removeTile, playWord, shuffleRack, recallTiles, passTurn }
  };
}
