import { useEffect, useState, useCallback, useRef } from 'react';
import { getSupabaseBrowserClient, supabaseBrowserConfigError } from '../multiplayer-lib/supabaseBrowser';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Local aliases to keep the hook code readable while enforcing the browser-only boundary.
const getSupabaseClient = getSupabaseBrowserClient;
const supabaseConfigError = supabaseBrowserConfigError;

// UUID v4 generator (fallback for browsers without crypto.randomUUID)
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export interface MultiplayerPlayer {
  id: string;
  name: string;
  faction: string;
  color: string;
  isReady: boolean;
  isHost: boolean;
}

export interface MultiplayerRoom {
  code: string;
  hostId: string;
  players: MultiplayerPlayer[];
  status: 'lobby' | 'in-progress' | 'finished';
}

interface UseSupabaseMultiplayerReturn {
  isConnected: boolean;
  room: MultiplayerRoom | null;
  playerId: string | null;
  roomId: string | null;
  createRoom: (hostName: string) => Promise<{ roomCode: string; playerId: string }>;
  joinRoom: (roomCode: string, playerName: string) => Promise<string>;
  rejoinRoom: (roomCode: string, playerId: string, playerName: string) => Promise<void>;
  selectFaction: (faction: string, color: string) => Promise<void>;
  toggleReady: () => Promise<void>;
  startGame: () => Promise<void>;
  updateGameState: (gameState: any) => Promise<void>;
  sendAction: (action: string, data?: any) => Promise<void>;
  disconnect: () => void;
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function ensureSupabaseConfigured(): void {
  if (supabaseConfigError) {
    throw new Error(supabaseConfigError);
  }
}

async function registerRoomCodeWithBridge(roomCode: string, roomId?: string | null) {
  const bridgeUrl = import.meta.env.VITE_HARDWARE_BRIDGE_API || 'http://localhost:3001';
  if (!bridgeUrl) return;

  try {
    const res = await fetch(`${bridgeUrl}/api/rooms/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomCode,
        roomId: roomId || undefined,
        source: 'supabase',
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn('[Bridge] Failed to register room code:', res.status, text);
    }
  } catch (e) {
    // Best-effort only; multiplayer should still work even if bridge is down.
    console.warn('[Bridge] Could not register room code:', e);
  }
}

export function useSupabaseMultiplayer(): UseSupabaseMultiplayerReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<MultiplayerRoom | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const roomCodeRef = useRef<string | null>(null);

  const createRoom = useCallback(async (hostName: string) => {
    try {
      ensureSupabaseConfigured();
      const supabase = getSupabaseBrowserClient();
      const roomCode = generateRoomCode();
      
      // Create room in database
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code: roomCode,
          host_id: generateUUID(),
          status: 'lobby'
        })
        .select()
        .single();

      if (roomError) throw roomError;

      const hostPlayerId = generateUUID();
      
      // Add host as first player
      const { error: playerError } = await supabase
        .from('players')
        .insert({
          id: hostPlayerId,
          room_id: roomData.id,
          name: hostName,
          is_host: true,
          is_ready: false,
          faction: '',
          color: ''
        });

      if (playerError) throw playerError;

      // Best-effort: register the room code with the hardware bridge so controllers can discover/join it.
      await registerRoomCodeWithBridge(roomCode, roomData.id);

      setPlayerId(hostPlayerId);
      setRoomId(roomData.id);
      roomCodeRef.current = roomCode;
      
      // Subscribe to room updates
      await subscribeToRoom(roomData.id, roomCode);

      return { roomCode, playerId: hostPlayerId };
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }, []);

  const joinRoom = useCallback(async (roomCode: string, playerName: string) => {
    try {
      ensureSupabaseConfigured();
      const supabase = getSupabaseClient();
      // Find room by code
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (roomError || !roomData) {
        throw new Error('Room not found');
      }

      // Check if player already exists in this room (for reconnection)
      const { data: existingPlayers } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomData.id);

      // Look for existing player with same name (reconnection scenario)
      // Allow finding host players for reconnection
      const existingPlayer = existingPlayers?.find(p => p.name === playerName);
      
      let newPlayerId: string;

      if (existingPlayer) {
        // Reuse existing player ID for reconnection
        console.log('Reconnecting as existing player:', existingPlayer);
        newPlayerId = existingPlayer.id;
      } else {
        // Check if room is full (excluding host-only entry)
        const actualPlayers = existingPlayers?.filter(p => !p.is_host || p.faction) || [];
        if (actualPlayers.length >= roomData.max_players) {
          throw new Error('Room is full');
        }

        newPlayerId = generateUUID();

        // Add new player to room
        const { error: playerError } = await supabase
          .from('players')
          .insert({
            id: newPlayerId,
            room_id: roomData.id,
            name: playerName,
            is_host: false,
            is_ready: false,
            faction: '',
            color: ''
          });

        if (playerError) throw playerError;
      }

      setPlayerId(newPlayerId);
      setRoomId(roomData.id);
      roomCodeRef.current = roomCode;

      // Best-effort: refresh registration so controllers can still see the room after restarts.
      await registerRoomCodeWithBridge(roomCode, roomData.id);

      // Subscribe to room updates
      await subscribeToRoom(roomData.id, roomCode);

      return newPlayerId;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }, []);

  const rejoinRoom = useCallback(async (roomCode: string, existingPlayerId: string, playerName: string) => {
    try {
      ensureSupabaseConfigured();
      const supabase = getSupabaseClient();
      
      // Find room by code
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode)
        .single();

      if (roomError || !roomData) {
        throw new Error('Room not found');
      }

      // Verify player exists in this room
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', existingPlayerId)
        .eq('room_id', roomData.id)
        .single();

      if (playerError || !playerData) {
        throw new Error('Player not found in this room');
      }

      console.log('Rejoining room as existing player:', playerData);
      
      setPlayerId(existingPlayerId);
      setRoomId(roomData.id);
      roomCodeRef.current = roomCode;
      
      // Subscribe to room updates
      await subscribeToRoom(roomData.id, roomCode);
    } catch (error) {
      console.error('Error rejoining room:', error);
      throw error;
    }
  }, []);

  const subscribeToRoom = useCallback(async (roomDbId: string, roomCode: string) => {
    ensureSupabaseConfigured();
    const supabase = getSupabaseClient();
    // Unsubscribe from previous channel if exists
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
    }

    // Create channel for this room
    const channel = supabase.channel(`room:${roomCode}`, {
      config: {
        broadcast: { self: true }
      }
    });

    // Listen for player changes
    channel
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'players',
          filter: `room_id=eq.${roomDbId}`
        }, 
        async (payload) => {
          console.log('Player change detected:', payload);
          await loadRoomData(roomDbId, roomCode);
        }
      )
      // Listen for game state changes
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_states',
          filter: `room_id=eq.${roomDbId}`
        },
        async (payload) => {
          if (payload.new && 'state_json' in payload.new) {
            // Emit game state update event
            window.dispatchEvent(new CustomEvent('gameStateUpdate', {
              detail: payload.new.state_json
            }));
          }
        }
      )
      // Listen for player actions (via broadcast)
      .on('broadcast', { event: 'player_action' }, (payload) => {
        window.dispatchEvent(new CustomEvent('playerAction', {
          detail: payload.payload
        }));
      })
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          console.log('Loading initial room data for room:', roomDbId);
          loadRoomData(roomDbId, roomCode);
        }
      });

    channelRef.current = channel;
  }, []);

  const loadRoomData = useCallback(async (roomDbId: string, roomCode: string) => {
    try {
      ensureSupabaseConfigured();
      const supabase = getSupabaseClient();
      console.log('Loading room data for:', roomDbId);
      // Load room info
      const { data: roomData } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomDbId)
        .single();

      if (!roomData) {
        console.log('No room data found');
        return;
      }

      // Load players
      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomDbId)
        .order('joined_at', { ascending: true });

      if (!playersData) {
        console.log('No players data found');
        return;
      }

      console.log('Players data:', playersData);

      const players: MultiplayerPlayer[] = playersData.map((p: any) => ({
        id: p.id,
        name: p.name,
        faction: p.faction || '',
        color: p.color || '',
        isReady: p.is_ready,
        isHost: p.is_host
      }));

      console.log('Setting room with players:', players);

      setRoom({
        code: roomCode,
        hostId: roomData.host_id,
        players,
        status: roomData.status
      });

      // Load game state if it exists
      const { data: gameStateData } = await supabase
        .from('game_states')
        .select('*')
        .eq('room_id', roomDbId)
        .single();

      if (gameStateData && gameStateData.state_json) {
        console.log('Game state found, dispatching event:', gameStateData.state_json);
        // Emit game state update event
        window.dispatchEvent(new CustomEvent('gameStateUpdate', {
          detail: gameStateData.state_json
        }));
      } else {
        console.log('No game state found yet');
      }
    } catch (error) {
      console.error('Error loading room data:', error);
    }
  }, []);

  const selectFaction = useCallback(async (faction: string, color: string, playerIdOverride?: string) => {
    const effectivePlayerId = playerIdOverride || playerId;
    console.log('selectFaction called with:', { faction, color, effectivePlayerId, roomId });
    
    if (!effectivePlayerId || !roomId) {
      console.log('Missing playerId or roomId, aborting');
      return;
    }

    try {
      ensureSupabaseConfigured();
      const supabase = getSupabaseClient();
      console.log('Attempting to update player in database...');
      const { data, error } = await supabase
        .from('players')
        .update({ faction, color })
        .eq('id', effectivePlayerId)
        .select();
      
      if (error) {
        console.error('Supabase error in selectFaction:', error);
        throw error;
      }
      
      console.log('selectFaction database update successful:', data);
      
      // Force reload room data to ensure UI updates
      if (roomCodeRef.current) {
        console.log('Force reloading room data after selectFaction...');
        await loadRoomData(roomId, roomCodeRef.current);
      }
    } catch (error) {
      console.error('Error selecting faction:', error);
      throw error;
    }
  }, [playerId, roomId, loadRoomData]);

  const toggleReady = useCallback(async (playerIdOverride?: string, forceReady?: boolean) => {
    const effectivePlayerId = playerIdOverride || playerId;
    console.log('toggleReady called with:', { effectivePlayerId, roomId, forceReady });
    
    if (!effectivePlayerId || !roomId) {
      console.log('Missing playerId or roomId, aborting');
      return;
    }

    try {
      ensureSupabaseConfigured();
      const supabase = getSupabaseClient();
      // If forceReady is specified, use that value. Otherwise, fetch current state and toggle.
      let newReadyState: boolean;
      
      if (forceReady !== undefined) {
        newReadyState = forceReady;
        console.log('Using forced ready state:', newReadyState);
      } else {
        // Fetch current player state from database
        const { data: playerData, error: fetchError } = await supabase
          .from('players')
          .select('is_ready')
          .eq('id', effectivePlayerId)
          .single();
        
        if (fetchError) {
          console.error('Error fetching player state:', fetchError);
          throw fetchError;
        }
        
        newReadyState = !playerData.is_ready;
        console.log('Current is_ready:', playerData.is_ready, 'toggling to:', newReadyState);
      }
      
      const { data, error } = await supabase
        .from('players')
        .update({ is_ready: newReadyState })
        .eq('id', effectivePlayerId)
        .select();
      
      if (error) {
        console.error('Supabase error in toggleReady:', error);
        throw error;
      }
      
      console.log('toggleReady database update successful:', data);
      
      // Force reload room data to ensure UI updates
      if (roomCodeRef.current) {
        console.log('Force reloading room data after toggleReady...');
        await loadRoomData(roomId, roomCodeRef.current);
      }
    } catch (error) {
      console.error('Error toggling ready:', error);
      throw error;
    }
  }, [playerId, roomId, loadRoomData]);

  const startGame = useCallback(async () => {
    if (!roomId) return;

    try {
      ensureSupabaseConfigured();
      const supabase = getSupabaseClient();
      await supabase
        .from('rooms')
        .update({ status: 'in-progress' })
        .eq('id', roomId);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }, [roomId]);

  const updateGameState = useCallback(async (gameState: any) => {
    if (!roomId) return;

    try {
      ensureSupabaseConfigured();
      const supabase = getSupabaseClient();
      // Upsert game state
      await supabase
        .from('game_states')
        .upsert({
          room_id: roomId,
          state_json: gameState,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'room_id'
        });
    } catch (error) {
      console.error('Error updating game state:', error);
    }
  }, [roomId]);

  const sendAction = useCallback(async (action: string, data: any = {}) => {
    if (!channelRef.current || !playerId) return;

    try {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'player_action',
        payload: { playerId, action, data }
      });
    } catch (error) {
      console.error('Error sending action:', error);
    }
  }, [playerId]);

  const disconnect = useCallback(() => {
    if (channelRef.current) {
      try {
        const supabase = getSupabaseClient();
        supabase.removeChannel(channelRef.current);
      } catch {
        // Ignore cleanup errors
      }
      channelRef.current = null;
    }
    setIsConnected(false);
    setRoom(null);
    setPlayerId(null);
    setRoomId(null);
    roomCodeRef.current = null;
  }, []);

  // Polling fallback - refresh room data every 2 seconds
  useEffect(() => {
    if (!roomId || !roomCodeRef.current) return;

    const interval = setInterval(() => {
      loadRoomData(roomId, roomCodeRef.current!);
    }, 2000);

    return () => clearInterval(interval);
  }, [roomId, loadRoomData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    room,
    playerId,
    roomId,
    createRoom,
    joinRoom,
    rejoinRoom,
    selectFaction,
    toggleReady,
    startGame,
    updateGameState,
    sendAction,
    disconnect
  };
}
