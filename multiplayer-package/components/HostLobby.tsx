import { useState } from 'react';
// @ts-ignore
import QRCode from 'react-qr-code';
import { MultiplayerPlayer } from '../hooks/useSupabaseMultiplayer';

interface HostLobbyProps {
  roomCode: string;
  players: MultiplayerPlayer[];
  onStartGame: () => void;
  onCancel: () => void;
}

export function HostLobby({ roomCode, players, onStartGame, onCancel }: HostLobbyProps) {
  const [copied, setCopied] = useState(false);
  
  const joinUrl = `${window.location.origin}/join/${roomCode}`;
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Filter out the host if they haven't joined as a player (empty name)
  const actualPlayers = players.filter(p => !p.isHost || p.faction);
  const readyCount = actualPlayers.filter(p => p.isReady).length;
  const canStart = actualPlayers.length >= 2 && readyCount === actualPlayers.length;
  
  // Debug logging
  console.log('HostLobby render:', {
    totalPlayers: players.length,
    actualPlayers: actualPlayers.length,
    readyCount,
    canStart,
    playersDetail: players.map(p => ({
      name: p.name,
      faction: p.faction,
      isReady: p.isReady,
      isHost: p.isHost
    }))
  });
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 8, 20, 0.98)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        backgroundColor: '#0b1020',
        border: '2px solid #fbbf24',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '800px',
        width: '90%',
        boxShadow: '0 0 40px rgba(251, 191, 36, 0.3)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#fbbf24',
            marginBottom: '8px',
            textShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
          }}>
             Multiplayer Lobby
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Scan the QR code or enter the room code to join
          </p>
        </div>

        {/* Room Code & QR Code */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          marginBottom: '32px',
        }}>
          {/* QR Code */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '16px',
              borderRadius: '12px',
            }}>
              <QRCode value={joinUrl} size={200} />
            </div>
            <p style={{
              color: '#94a3b8',
              fontSize: '12px',
              textAlign: 'center',
            }}>
              Scan with phone camera
            </p>
          </div>

          {/* Room Code */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '16px',
          }}>
            <div>
              <label style={{
                display: 'block',
                color: '#fbbf24',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
              }}>
                Room Code
              </label>
              <div style={{
                position: 'relative',
              }}>
                <div style={{
                  backgroundColor: '#111827',
                  border: '2px solid #fbbf24',
                  borderRadius: '8px',
                  padding: '16px',
                  fontSize: '36px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  color: '#fbbf24',
                  textShadow: '0 0 10px rgba(251, 191, 36, 0.5)',
                }}>
                  {roomCode}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCopyCode}
              style={{
                backgroundColor: copied ? '#10b981' : '#1e293b',
                color: copied ? 'white' : '#fbbf24',
                border: `2px solid `,
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {copied ? ' Copied!' : ' Copy Code'}
            </button>
          </div>
        </div>

        {/* Players List */}
        <div style={{
          backgroundColor: '#111827',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#fbbf24',
            }}>
              Players ({actualPlayers.length})
            </h3>
            <div style={{
              color: '#94a3b8',
              fontSize: '14px',
            }}>
              {readyCount}/{actualPlayers.length} ready
            </div>
          </div>

          {actualPlayers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#64748b',
              padding: '32px',
              fontStyle: 'italic',
            }}>
              Waiting for players to join...
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {actualPlayers.map((player) => (
                <div
                  key={player.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#0b1020',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: `2px solid `,
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <span style={{
                      fontWeight: '600',
                      color: player.color || '#94a3b8',
                    }}>
                      {player.name}
                      {player.isHost && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '12px',
                          color: '#fbbf24',
                        }}>
                          
                        </span>
                      )}
                    </span>
                    {player.faction && (
                      <span style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                      }}>
                         {player.faction}
                      </span>
                    )}
                  </div>
                  <div>
                    {player.isReady ? (
                      <span style={{
                        color: '#10b981',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}>
                        ✓ Ready
                      </span>
                    ) : player.faction ? (
                      <span style={{
                        color: '#f59e0b',
                        fontSize: '14px',
                      }}>
                        Confirming...
                      </span>
                    ) : (
                      <span style={{
                        color: '#64748b',
                        fontSize: '14px',
                      }}>
                        Selecting faction...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
        }}>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#1e293b',
              color: '#94a3b8',
              border: '2px solid #334155',
              borderRadius: '8px',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={onStartGame}
            disabled={!canStart}
            style={{
              backgroundColor: canStart ? '#fbbf24' : '#334155',
              color: canStart ? '#050814' : '#64748b',
              border: `2px solid `,
              borderRadius: '8px',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: canStart ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: canStart ? '0 0 20px rgba(251, 191, 36, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (canStart) {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(251, 191, 36, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (canStart) {
                e.currentTarget.style.boxShadow = '0 0 20px rgba(251, 191, 36, 0.3)';
              }
            }}
          >
             Start Game
          </button>
        </div>

        {!canStart && actualPlayers.length > 0 && (
          <p style={{
            textAlign: 'center',
            color: '#64748b',
            fontSize: '12px',
            marginTop: '16px',
            fontStyle: 'italic',
          }}>
            {actualPlayers.length < 2 
              ? 'Need at least 2 players to start'
              : 'Waiting for all players to be ready'}
          </p>
        )}
      </div>
    </div>
  );
}
