/**
 * Multiplayer Web App Integration Example
 * 
 * This example shows how to integrate the multiplayer lobby system
 * into your React application.
 */

import { useState, useEffect } from 'react';
import { ModeSelection } from '../components/ModeSelection';
import { HostLobby } from '../components/HostLobby';
import { PlayerJoin } from '../components/PlayerJoin';
import { PlayerView } from '../components/PlayerView';
import { useSupabaseMultiplayer } from '../hooks/useSupabaseMultiplayer';

type AppMode = 'selection' | 'host-lobby' | 'host-game' | 'player-join' | 'player-game';

function App() {
  const [appMode, setAppMode] = useState<AppMode>('selection');
  const [roomCode, setRoomCode] = useState<string>('');
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  
  const multiplayer = useSupabaseMultiplayer();

  // ===== URL ROUTING =====
  // Detect /join/:roomCode URLs on mount
  useEffect(() => {
    const path = window.location.pathname;
    const joinMatch = path.match(/^\/join\/([A-Za-z0-9]{6})$/i);
    
    if (joinMatch) {
      const codeFromUrl = joinMatch[1].toUpperCase();
      console.log('✓ Detected join URL with code:', codeFromUrl);
      setRoomCode(codeFromUrl);
      setAppMode('player-join');
      // Clean up URL without reloading
      window.history.replaceState({}, '', '/');
      return;
    }
    
    // Load saved multiplayer session on mount (for reconnecting)
    const savedSession = localStorage.getItem('multiplayer-session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const now = Date.now();
        // Session expires after 4 hours
        if (session.timestamp && now - session.timestamp < 4 * 60 * 60 * 1000) {
          console.log('Restoring multiplayer session:', session);
          setRoomCode(session.roomCode);
          setPlayerId(session.playerId);
          setPlayerName(session.playerName);
          
          // Reconnect to room
          if (session.isHost) {
            multiplayer.joinRoom(session.roomCode, session.playerName)
              .then(() => {
                // Check room status and set appropriate mode
                if (multiplayer.room?.status === 'in-progress') {
                  setAppMode('host-game');
                } else {
                  setAppMode('host-lobby');
                }
              });
          } else {
            setAppMode('player-game');
            multiplayer.joinRoom(session.roomCode, session.playerName);
          }
        } else {
          localStorage.removeItem('multiplayer-session');
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('multiplayer-session');
      }
    }
  }, []);

  // ===== MODE HANDLERS =====
  const handleModeSelect = async (mode: 'solo' | 'host' | 'join') => {
    if (mode === 'host') {
      try {
        const hostName = prompt('Enter your name:') || 'Host';
        const { roomCode: newRoomCode, playerId: newPlayerId } = await multiplayer.createRoom(hostName);
        
        setRoomCode(newRoomCode);
        setPlayerId(newPlayerId);
        setPlayerName(hostName);
        setAppMode('host-lobby');
        
        // Save session
        localStorage.setItem('multiplayer-session', JSON.stringify({
          roomCode: newRoomCode,
          playerId: newPlayerId,
          playerName: hostName,
          isHost: true,
          timestamp: Date.now(),
        }));
      } catch (error) {
        console.error('Failed to create room:', error);
        alert('Failed to create room. Please check your Supabase configuration.');
      }
    } else if (mode === 'join') {
      setAppMode('player-join');
    } else {
      // Handle solo mode in your app
      console.log('Solo mode selected');
    }
  };

  const handlePlayerJoin = async (code: string, name: string) => {
    try {
      const newPlayerId = await multiplayer.joinRoom(code, name);
      setRoomCode(code);
      setPlayerId(newPlayerId);
      setPlayerName(name);
      setAppMode('player-game');
      
      // Save session
      localStorage.setItem('multiplayer-session', JSON.stringify({
        roomCode: code,
        playerId: newPlayerId,
        playerName: name,
        isHost: false,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Failed to join room:', error);
      alert('Failed to join room. Please check the room code.');
    }
  };

  const handleStartGame = async () => {
    await multiplayer.startGame();
    setAppMode('host-game');
  };

  const handleLeave = () => {
    multiplayer.disconnect();
    localStorage.removeItem('multiplayer-session');
    setAppMode('selection');
  };

  // ===== RENDER =====
  if (appMode === 'selection') {
    return <ModeSelection onSelectMode={handleModeSelect} />;
  }

  if (appMode === 'host-lobby' && multiplayer.room) {
    return (
      <HostLobby
        roomCode={multiplayer.room.code}
        players={multiplayer.room.players}
        onStartGame={handleStartGame}
        onCancel={handleLeave}
      />
    );
  }

  if (appMode === 'player-join') {
    return (
      <PlayerJoin
        onJoin={handlePlayerJoin}
        onBack={() => setAppMode('selection')}
        initialRoomCode={roomCode || undefined}
      />
    );
  }

  if ((appMode === 'player-game' || appMode === 'host-game') && multiplayer.room) {
    // Replace this with your actual game view component
    return (
      <PlayerView
        roomCode={multiplayer.room.code}
        roomId={multiplayer.roomId || ''}
        playerId={playerId}
        playerName={playerName}
        room={multiplayer.room}
        selectFaction={multiplayer.selectFaction}
        toggleReady={multiplayer.toggleReady}
        sendAction={multiplayer.sendAction}
        isConnected={multiplayer.isConnected}
        onLeave={handleLeave}
      />
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Loading...</p>
    </div>
  );
}

export default App;
