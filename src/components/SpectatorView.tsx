import React from 'react';
import { MultiplayerSharedState, PlayerStatus } from '../lib/multiplayerState';

interface SpectatorViewProps {
  gameState: MultiplayerSharedState;
  playerNames: Map<string, string>;
  currentPlayerId: string;
}

export function SpectatorView({ gameState, playerNames, currentPlayerId }: SpectatorViewProps) {
  const currentPlayer = gameState.players[currentPlayerId];
  
  if (!currentPlayer || currentPlayer.isAlive) {
    return null; // Not a spectator
  }

  // Get alive players
  const alivePlayers = Object.entries(gameState.players)
    .filter(([_, status]) => status.isAlive)
    .map(([id, status]) => ({ id, status, name: playerNames.get(id) || 'Unknown' }));

  // Get dead players
  const deadPlayers = Object.entries(gameState.players)
    .filter(([_, status]) => !status.isAlive)
    .map(([id, status]) => ({ id, status, name: playerNames.get(id) || 'Unknown' }))
    .sort((a, b) => (a.status.eliminatedRound || 0) - (b.status.eliminatedRound || 0));

  const getAlignmentDisplay = (alignment?: 'COVEN' | 'HOLLOW') => {
    if (!alignment) return { text: '???', color: '#6b7280', emoji: '❓' };
    return alignment === 'COVEN' 
      ? { text: 'Sacred Coven', color: '#3b82f6', emoji: '✨' }
      : { text: 'Hollow One', color: '#8b5cf6', emoji: '💀' };
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 0, 40, 0.9) 100%)',
        borderBottom: '2px solid rgba(139, 92, 246, 0.5)',
        padding: '16px 24px',
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Spectator Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.2))',
            border: '2px solid rgba(139, 92, 246, 0.6)',
            borderRadius: '24px',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontSize: '20px' }}>👻</span>
            <span style={{
              color: '#a78bfa',
              fontSize: '16px',
              fontWeight: '700',
            }}>
              SPECTATOR MODE
            </span>
          </div>
          <div style={{
            color: 'rgba(200, 190, 230, 0.8)',
            fontSize: '14px',
          }}>
            You were eliminated in Round {currentPlayer.eliminatedRound}
            {currentPlayer.wasInfected && ' (Infected 🦠)'}
          </div>
        </div>

        {/* Alive Players */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '12px',
          marginBottom: '12px',
        }}>
          {alivePlayers.map(({ id, status, name }) => {
            const alignment = getAlignmentDisplay(status.alignment);
            const isInfected = gameState.infectedPlayers.includes(id);
            
            return (
              <div
                key={id}
                style={{
                  background: 'rgba(16, 20, 40, 0.6)',
                  border: `1px solid ${alignment.color}40`,
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{alignment.emoji}</span>
                  <div>
                    <div style={{
                      color: '#e5e7eb',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}>
                      {name}
                    </div>
                    <div style={{
                      color: alignment.color,
                      fontSize: '11px',
                      fontWeight: '500',
                    }}>
                      {alignment.text}
                    </div>
                  </div>
                </div>
                {isInfected && (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    border: '1px solid rgba(245, 158, 11, 0.5)',
                    borderRadius: '12px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    color: '#fbbf24',
                    fontWeight: '600',
                  }}>
                    🦠 Infected
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Dead Players */}
        {deadPlayers.length > 0 && (
          <details style={{ marginTop: '12px' }}>
            <summary style={{
              color: '#9ca3af',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '4px',
              background: 'rgba(20, 20, 40, 0.4)',
              userSelect: 'none',
            }}>
              💀 Eliminated Players ({deadPlayers.length})
            </summary>
            <div style={{
              marginTop: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '8px',
            }}>
              {deadPlayers.map(({ id, status, name }) => {
                const alignment = getAlignmentDisplay(status.alignment);
                
                return (
                  <div
                    key={id}
                    style={{
                      background: 'rgba(20, 20, 30, 0.4)',
                      border: '1px solid rgba(100, 100, 120, 0.3)',
                      borderRadius: '6px',
                      padding: '10px',
                      opacity: 0.7,
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '4px',
                    }}>
                      <span style={{ fontSize: '14px' }}>{alignment.emoji}</span>
                      <span style={{
                        color: '#9ca3af',
                        fontSize: '13px',
                        fontWeight: '600',
                      }}>
                        {name}
                      </span>
                    </div>
                    <div style={{
                      color: '#6b7280',
                      fontSize: '11px',
                    }}>
                      Round {status.eliminatedRound}
                      {status.wasInfected && ' • Infected 🦠'}
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        )}

        {/* Game Info */}
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{
            color: '#a78bfa',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            Round {gameState.roundNumber} • Phase: {gameState.phase.replace('_', ' ').toUpperCase()}
          </div>
          <div style={{
            color: 'rgba(200, 190, 230, 0.7)',
            fontSize: '11px',
          }}>
            {alivePlayers.length} players alive
          </div>
        </div>
      </div>
    </div>
  );
}
