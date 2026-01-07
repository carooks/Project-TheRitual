import { useState } from 'react';
// @ts-ignore
import QRCode from 'react-qr-code';
import { MultiplayerPlayer } from '../hooks/useSupabaseMultiplayer';

interface HostLobbyProps {
  roomCode: string;
  players: MultiplayerPlayer[];
  onStartGame: () => void;
  onCancel: () => void;
  onToggleReady: (playerId: string) => Promise<void>;
}

export function HostLobby({ roomCode, players, onStartGame, onCancel, onToggleReady }: HostLobbyProps) {
  const [copied, setCopied] = useState(false);
  const [readyingPlayerId, setReadyingPlayerId] = useState<string | null>(null);
  
  // Use the actual host (could be network IP when running with --host)
  const joinUrl = `${window.location.origin}/join/${roomCode}`;
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHostReady = async (playerId: string) => {
    try {
      setReadyingPlayerId(playerId);
      await onToggleReady(playerId);
    } catch (error) {
      console.error('Failed to mark host ready:', error);
    } finally {
      setReadyingPlayerId(null);
    }
  };
  
  // Filter out the host if they haven't joined as a player (empty name)
  const actualPlayers = players.filter(p => p.name && p.name.trim() !== '');
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
      background: 'radial-gradient(circle at 50% 50%, rgba(76, 29, 149, 0.5) 0%, rgba(17, 24, 39, 0.95) 70%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.6) 0%, rgba(30, 30, 60, 0.9) 100%)',
        border: '2px solid rgba(212, 175, 55, 0.6)',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '900px',
        width: '92%',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.9), 0 0 60px rgba(139, 92, 246, 0.3)',
        backdropFilter: 'blur(16px)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#d4af37',
            marginBottom: '8px',
            textShadow: '0 0 25px rgba(212, 175, 55, 0.7)',
            letterSpacing: '0.1em',
            fontFamily: 'Georgia, serif',
          }}>
            ✦ Multiplayer Lobby ✦
          </h1>
          <p style={{ 
            color: '#e9d5ff', 
            fontSize: '14px', 
            letterSpacing: '0.02em',
            fontFamily: 'Georgia, serif',
          }}>
            Scan the QR code or enter the room code to join
          </p>
        </div>

        {/* Room Code & QR Code */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '28px',
        }}>
          {/* QR Code */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '14px',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            }}>
              <QRCode value={joinUrl} size={180} />
            </div>
            <p style={{
              color: 'rgba(200, 190, 170, 0.7)',
              fontSize: '11px',
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}>
              Scan with phone camera
            </p>
          </div>

          {/* Room Code */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '14px',
          }}>
            <div>
              <label style={{
                display: 'block',
                color: '#d4af37',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '8px',
                letterSpacing: '0.05em',
                textShadow: '0 0 10px rgba(212, 175, 55, 0.4)',
              }}>
                Room Code
              </label>
              <div style={{
                background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.4) 0%, rgba(30, 30, 60, 0.6) 100%)',
                border: '2px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '6px',
                padding: '14px',
                fontSize: '32px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                letterSpacing: '10px',
                textAlign: 'center',
                color: '#d4af37',
                textShadow: '0 0 20px rgba(212, 175, 55, 0.7)',
                boxShadow: '0 0 25px rgba(139, 92, 246, 0.3)',
              }}>
                {roomCode}
              </div>
            </div>
            
            <button
              onClick={handleCopyCode}
              style={{
                background: copied 
                  ? 'linear-gradient(135deg, #10b981, #059669)' 
                  : 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(76, 29, 149, 0.6) 100%)',
                color: copied ? 'white' : '#e9d5ff',
                border: `2px solid ${copied ? '#10b981' : 'rgba(212, 175, 55, 0.5)'}`,
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                letterSpacing: '0.05em',
                boxShadow: copied ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 0 15px rgba(139, 92, 246, 0.3)',
              }}
            >
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* Players List */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.5) 0%, rgba(20, 20, 40, 0.6) 100%)',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#d4af37',
              letterSpacing: '0.05em',
              textShadow: '0 0 15px rgba(212, 175, 55, 0.6)',
              fontFamily: 'Georgia, serif',
            }}>
              Players ({actualPlayers.length})
            </h3>
            <div style={{
              color: '#cbd5f5',
              fontSize: '13px',
              letterSpacing: '0.02em',
            }}>
              {readyCount}/{actualPlayers.length} ready
            </div>
          </div>

          {actualPlayers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#94a3b8',
              padding: '28px',
              fontStyle: 'italic',
              fontSize: '14px',
              letterSpacing: '0.02em',
              fontFamily: 'Georgia, serif',
            }}>
              Waiting for players to join...
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              {actualPlayers.map((player) => (
                <div
                  key={player.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.3) 0%, rgba(30, 30, 60, 0.5) 100%)',
                    padding: '11px 14px',
                    borderRadius: '6px',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <span style={{
                      fontWeight: '600',
                      color: player.color || '#e9d5ff',
                      fontSize: '14px',
                      letterSpacing: '0.01em',
                    }}>
                      {player.name}
                      {player.isHost && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '11px',
                          color: '#d4af37',
                          textShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
                        }}>
                          ★
                        </span>
                      )}
                    </span>
                  </div>
                  <div>
                    {player.isReady ? (
                      <span style={{
                        color: '#10b981',
                        fontSize: '13px',
                        fontWeight: '600',
                        letterSpacing: '0.02em',
                      }}>
                        ✓ Ready
                      </span>
                    ) : player.isHost ? (
                      <button
                        onClick={() => handleHostReady(player.id)}
                        disabled={readyingPlayerId === player.id}
                        style={{
                          background: readyingPlayerId === player.id
                            ? 'rgba(60, 50, 80, 0.5)'
                            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(76, 29, 149, 0.6) 100%)',
                          color: readyingPlayerId === player.id ? '#94a3b8' : '#e9d5ff',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: readyingPlayerId === player.id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {readyingPlayerId === player.id ? 'Marking…' : 'Mark Ready'}
                      </button>
                    ) : (
                      <span style={{
                        color: '#94a3b8',
                        fontSize: '12px',
                      }}>
                        Waiting to mark ready…
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
          gap: '14px',
          justifyContent: 'center',
        }}>
          <button
            onClick={onCancel}
            style={{
              background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.6) 0%, rgba(20, 20, 40, 0.7) 100%)',
              color: '#cbd5f5',
              border: '2px solid rgba(148, 163, 184, 0.4)',
              borderRadius: '6px',
              padding: '11px 28px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              letterSpacing: '0.05em',
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.6)';
              e.currentTarget.style.color = '#e9d5ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.4)';
              e.currentTarget.style.color = '#cbd5f5';
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={onStartGame}
            disabled={!canStart}
            style={{
              background: canStart 
                ? 'linear-gradient(135deg, #d4af37, #b8941f)' 
                : 'linear-gradient(135deg, rgba(60, 50, 80, 0.4), rgba(40, 30, 60, 0.5))',
              color: canStart ? 'rgba(20, 15, 10, 0.95)' : 'rgba(148, 163, 184, 0.5)',
              border: `2px solid ${canStart ? 'rgba(212, 175, 55, 0.8)' : 'rgba(148, 163, 184, 0.3)'}`,
              borderRadius: '6px',
              padding: '11px 28px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: canStart ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s',
              letterSpacing: '0.08em',
              fontFamily: 'Georgia, serif',
              boxShadow: canStart 
                ? '0 0 30px rgba(212, 175, 55, 0.5), 0 4px 12px rgba(0, 0, 0, 0.6)' 
                : '0 0 10px rgba(139, 92, 246, 0.1)',
              textShadow: canStart ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (canStart) {
                e.currentTarget.style.boxShadow = '0 0 40px rgba(212, 175, 55, 0.7), 0 6px 16px rgba(0, 0, 0, 0.7)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (canStart) {
                e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.5), 0 4px 12px rgba(0, 0, 0, 0.6)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            ✨ Start Game
          </button>
        </div>

        {!canStart && actualPlayers.length > 0 && (
          <p style={{
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '12px',
            marginTop: '16px',
            fontStyle: 'italic',
            fontFamily: 'Georgia, serif',
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
