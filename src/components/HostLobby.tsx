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
      backgroundImage: 'url(/assets/backgrounds/title-screen.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 15, 10, 0.95) 0%, rgba(30, 20, 15, 0.92) 100%)',
        border: '2px solid rgba(139, 87, 42, 0.6)',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '900px',
        width: '92%',
        boxShadow: '0 8px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(139, 87, 42, 0.2), 0 0 60px rgba(139, 87, 42, 0.15)',
        backdropFilter: 'blur(12px)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#d4af37',
            marginBottom: '6px',
            textShadow: '0 0 20px rgba(212, 175, 55, 0.6)',
            letterSpacing: '0.08em',
          }}>
            Multiplayer Lobby
          </h1>
          <p style={{ color: 'rgba(200, 190, 170, 0.75)', fontSize: '13px', letterSpacing: '0.02em' }}>
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
                background: 'linear-gradient(135deg, rgba(10, 8, 5, 0.8), rgba(15, 12, 8, 0.8))',
                border: '2px solid rgba(139, 87, 42, 0.5)',
                borderRadius: '6px',
                padding: '14px',
                fontSize: '32px',
                fontWeight: 'bold',
                fontFamily: 'monospace',
                letterSpacing: '10px',
                textAlign: 'center',
                color: '#d4af37',
                textShadow: '0 0 15px rgba(212, 175, 55, 0.6)',
                boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)',
              }}>
                {roomCode}
              </div>
            </div>
            
            <button
              onClick={handleCopyCode}
              style={{
                background: copied ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, rgba(30, 25, 20, 0.9), rgba(25, 20, 15, 0.9))',
                color: copied ? 'white' : '#d4af37',
                border: `2px solid ${copied ? '#10b981' : 'rgba(139, 87, 42, 0.5)'}`,
                borderRadius: '6px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                letterSpacing: '0.05em',
                boxShadow: copied ? '0 0 20px rgba(16, 185, 129, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.4)',
                textShadow: copied ? 'none' : '0 0 10px rgba(212, 175, 55, 0.4)',
              }}
            >
              {copied ? '✓ Copied!' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* Players List */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(10, 8, 5, 0.6), rgba(15, 12, 8, 0.6))',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid rgba(139, 87, 42, 0.3)',
          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.4)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#d4af37',
              letterSpacing: '0.05em',
              textShadow: '0 0 12px rgba(212, 175, 55, 0.5)',
            }}>
              Players ({actualPlayers.length})
            </h3>
            <div style={{
              color: 'rgba(200, 190, 170, 0.7)',
              fontSize: '13px',
              letterSpacing: '0.02em',
            }}>
              {readyCount}/{actualPlayers.length} ready
            </div>
          </div>

          {actualPlayers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'rgba(150, 140, 120, 0.6)',
              padding: '28px',
              fontStyle: 'italic',
              fontSize: '13px',
              letterSpacing: '0.02em',
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
                    background: 'linear-gradient(135deg, rgba(20, 15, 10, 0.7), rgba(25, 18, 12, 0.7))',
                    padding: '11px 14px',
                    borderRadius: '6px',
                    border: '1px solid rgba(139, 87, 42, 0.3)',
                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <span style={{
                      fontWeight: '600',
                      color: player.color || 'rgba(200, 190, 170, 0.9)',
                      fontSize: '14px',
                      letterSpacing: '0.01em',
                    }}>
                      {player.name}
                      {player.isHost && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '11px',
                          color: '#d4af37',
                          textShadow: '0 0 8px rgba(212, 175, 55, 0.4)',
                        }}>
                          ★
                        </span>
                      )}
                    </span>
                    {player.faction && (
                      <span style={{
                        fontSize: '11px',
                        color: 'rgba(180, 170, 150, 0.75)',
                        letterSpacing: '0.01em',
                      }}>
                        {player.faction}
                      </span>
                    )}
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
                    ) : player.faction ? (
                      <span style={{
                        color: '#f59e0b',
                        fontSize: '12px',
                      }}>
                        Confirming...
                      </span>
                    ) : (
                      <span style={{
                        color: 'rgba(150, 140, 120, 0.6)',
                        fontSize: '12px',
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
          gap: '14px',
          justifyContent: 'center',
        }}>
          <button
            onClick={onCancel}
            style={{
              background: 'linear-gradient(135deg, rgba(30, 25, 20, 0.8), rgba(25, 20, 15, 0.8))',
              color: 'rgba(180, 170, 150, 0.9)',
              border: '2px solid rgba(100, 80, 60, 0.4)',
              borderRadius: '6px',
              padding: '11px 28px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              letterSpacing: '0.05em',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(139, 87, 42, 0.6)';
              e.currentTarget.style.color = 'rgba(200, 190, 170, 0.95)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(100, 80, 60, 0.4)';
              e.currentTarget.style.color = 'rgba(180, 170, 150, 0.9)';
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={onStartGame}
            disabled={!canStart}
            style={{
              background: canStart ? 'linear-gradient(135deg, #d4af37, #b8941f)' : 'linear-gradient(135deg, rgba(60, 50, 40, 0.6), rgba(50, 40, 30, 0.6))',
              color: canStart ? 'rgba(20, 15, 10, 0.95)' : 'rgba(100, 90, 80, 0.5)',
              border: `2px solid ${canStart ? 'rgba(212, 175, 55, 0.8)' : 'rgba(80, 70, 60, 0.4)'}`,
              borderRadius: '6px',
              padding: '11px 28px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: canStart ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s',
              letterSpacing: '0.08em',
              boxShadow: canStart ? '0 0 25px rgba(212, 175, 55, 0.4), 0 4px 12px rgba(0, 0, 0, 0.5)' : '0 2px 6px rgba(0, 0, 0, 0.3)',
              textShadow: canStart ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (canStart) {
                e.currentTarget.style.boxShadow = '0 0 35px rgba(212, 175, 55, 0.6), 0 6px 16px rgba(0, 0, 0, 0.6)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              if (canStart) {
                e.currentTarget.style.boxShadow = '0 0 25px rgba(212, 175, 55, 0.4), 0 4px 12px rgba(0, 0, 0, 0.5)';
                e.currentTarget.style.transform = 'translateY(0)';
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
