import React, { useState, useEffect } from 'react';

interface PlayerJoinProps {
  onJoin: (roomCode: string, playerName: string) => void;
  onBack: () => void;
  initialRoomCode?: string;
}

export function PlayerJoin({ onJoin, onBack, initialRoomCode }: PlayerJoinProps) {
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [playerName, setPlayerName] = useState('');

  // Update room code if initialRoomCode changes
  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode);
    }
  }, [initialRoomCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim() && playerName.trim()) {
      onJoin(roomCode.toUpperCase().trim(), playerName.trim());
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 8, 20, 0.98)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '16px',
      paddingTop: 'calc(16px + env(safe-area-inset-top))',
      paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
    }}>
      <div style={{
        backgroundColor: '#0b1020',
        border: '2px solid #14b8a6',
        borderRadius: '16px',
        padding: 'clamp(18px, 4.5vw, 40px)',
        maxWidth: '500px',
        width: '90%',
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        boxShadow: '0 0 40px rgba(20, 184, 166, 0.3)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(22px, 6vw, 32px)',
            fontWeight: 'bold',
            color: '#14b8a6',
            marginBottom: '8px',
            textShadow: '0 0 20px rgba(20, 184, 166, 0.5)',
          }}>
            📱 Join Game
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Enter the room code from your host
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {initialRoomCode && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              background: 'rgba(20, 184, 166, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '12px', color: '#14b8a6', fontWeight: '600' }}>
                ✓ Room code detected from link
              </div>
            </div>
          )}
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#14b8a6',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
            }}>
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              maxLength={6}
              style={{
                width: '100%',
                backgroundColor: '#111827',
                border: '2px solid #14b8a6',
                borderRadius: '8px',
                padding: '14px 12px',
                fontSize: 'clamp(18px, 6vw, 24px)',
                fontFamily: 'monospace',
                letterSpacing: '0.18em',
                textAlign: 'center',
                color: '#14b8a6',
                textTransform: 'uppercase',
                boxSizing: 'border-box',
              }}
              autoFocus={!initialRoomCode}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#14b8a6',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
            }}>
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              style={{
                width: '100%',
                backgroundColor: '#111827',
                border: '2px solid #14b8a6',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '16px',
                color: '#f1f5f9',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
          }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                flex: 1,
                backgroundColor: '#1e293b',
                color: '#94a3b8',
                border: '2px solid #334155',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Back
            </button>

            <button
              type="submit"
              disabled={!roomCode.trim() || !playerName.trim()}
              style={{
                flex: 2,
                backgroundColor: roomCode && playerName ? '#14b8a6' : '#334155',
                color: roomCode && playerName ? '#050814' : '#64748b',
                border: `2px solid ${roomCode && playerName ? '#14b8a6' : '#334155'}`,
                borderRadius: '8px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: roomCode && playerName ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: roomCode && playerName ? '0 0 20px rgba(20, 184, 166, 0.3)' : 'none',
              }}
            >
              Join Game
            </button>
          </div>
        </form>

        {/* Tip */}
        <p style={{
          marginTop: '24px',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '12px',
          fontStyle: 'italic',
        }}>
          💡 Get the room code from your game host
        </p>
      </div>
    </div>
  );
}
