import { useState } from 'react';

interface PlayerViewProps {
  roomCode: string;
  roomId: string | null;
  playerId: string;
  playerName: string;
  room: any;
  toggleReady: (playerIdOverride?: string, forceReady?: boolean) => Promise<void>;
  sendAction: (action: string, data?: any) => Promise<void>;
  isConnected: boolean;
  onLeave: () => void;
}

export function PlayerView({ 
  roomCode, 
  playerId, 
  playerName, 
  room, 
  toggleReady, 
  isConnected, 
  onLeave 
}: PlayerViewProps) {
  const currentPlayer = room?.players?.find((p: any) => p.id === playerId);

  const handleToggleReady = async () => {
    try {
      await toggleReady(playerId);
    } catch (error) {
      console.error('Failed to toggle ready:', error);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#050814',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {!isConnected && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          right: '20px',
          backgroundColor: '#dc262620',
          border: '2px solid #dc2626',
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center',
          color: '#fca5a5',
          fontSize: '14px',
          zIndex: 10000,
        }}>
           Connection lost. Reconnecting...
        </div>
      )}

      <div style={{
        backgroundColor: 'rgba(11, 16, 32, 0.8)',
        border: '2px solid #d4af37',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 0 40px rgba(212, 175, 55, 0.2)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}></div>

        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#d4af37',
          marginBottom: '12px',
          textShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
        }}>
          The Circle Awaits
        </h1>

        <p style={{ color: '#94a3b8', fontSize: '18px', marginBottom: '32px' }}>
          {playerName}
        </p>

        <div style={{
          backgroundColor: '#0b1020',
          border: '2px solid #14b8a6',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '32px',
        }}>
          <div style={{
            color: '#94a3b8',
            fontSize: '12px',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Room Code
          </div>
          <div style={{
            color: '#14b8a6',
            fontSize: '36px',
            fontWeight: 'bold',
            letterSpacing: '8px',
            fontFamily: 'monospace',
          }}>
            {roomCode}
          </div>
        </div>

        <div style={{
          backgroundColor: '#0b1020',
          border: '2px solid #4c1d95',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '32px',
        }}>
          <div style={{
            color: '#94a3b8',
            fontSize: '12px',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Witches in Circle
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {room?.players?.map((player: any) => (
              <div
                key={player.id}
                style={{
                  backgroundColor: player.id === playerId ? '#4c1d9520' : 'transparent',
                  borderRadius: '8px',
                  padding: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{
                  color: player.id === playerId ? '#d4af37' : '#f1f5f9',
                  fontSize: '16px',
                }}>
                  {player.name}
                </span>
                {player.isReady && (
                  <span style={{ color: '#22c55e', fontSize: '18px' }}></span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleToggleReady}
          disabled={currentPlayer?.isReady}
          style={{
            backgroundColor: currentPlayer?.isReady ? '#22c55e' : '#d4af37',
            color: '#050814',
            border: 'none',
            borderRadius: '12px',
            padding: '16px 32px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: currentPlayer?.isReady ? 'not-allowed' : 'pointer',
            width: '100%',
            marginBottom: '16px',
            boxShadow: currentPlayer?.isReady 
              ? '0 0 20px rgba(34, 197, 94, 0.3)' 
              : '0 0 20px rgba(212, 175, 55, 0.3)',
            opacity: currentPlayer?.isReady ? 0.7 : 1,
          }}
        >
          {currentPlayer?.isReady ? ' Ready! Waiting for others...' : 'Mark Ready'}
        </button>

        <button
          onClick={onLeave}
          style={{
            backgroundColor: 'transparent',
            color: '#94a3b8',
            border: '2px solid #334155',
            borderRadius: '12px',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Leave Circle
        </button>
      </div>
    </div>
  );
}
