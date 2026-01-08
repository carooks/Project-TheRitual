import React from 'react';
import { MultiplayerSharedState } from '../lib/multiplayerState';
import Button from './UI/Button';

interface PostGameSummaryProps {
  gameState: MultiplayerSharedState;
  playerNames: Record<string, string>;
  onClose: () => void;
  onPlayAgain?: () => void;
}

export function PostGameSummary({ gameState, playerNames, onClose, onPlayAgain }: PostGameSummaryProps) {
  const { winnerAlignment, players, roundHistory, meta } = gameState;

  // Sort players by survival (alive first, then by elimination round)
  const sortedPlayers = Object.entries(players).sort(([, a], [, b]) => {
    if (a.isAlive && !b.isAlive) return -1;
    if (!a.isAlive && b.isAlive) return 1;
    if (!a.isAlive && !b.isAlive) {
      return (a.eliminatedRound || 0) - (b.eliminatedRound || 0);
    }
    return 0;
  });

  const getFactionColor = (roleId: string) => {
    if (roleId === 'SACRED_LEADER') return '#3b82f6'; // Blue
    if (roleId === 'HOLLOW_LEADER') return '#8b5cf6'; // Purple
    return roleId.includes('SACRED') ? '#3b82f6' : '#8b5cf6';
  };

  const getFactionName = (roleId: string) => {
    return roleId.includes('SACRED') ? 'Sacred' : 'Hollow';
  };

  const getRoleName = (roleId: string) => {
    const roleNames: Record<string, string> = {
      SACRED_LEADER: 'Sacred Leader',
      SACRED_MEMBER: 'Sacred Member',
      HOLLOW_LEADER: 'Hollow Leader',
      HOLLOW_MEMBER: 'Hollow Member',
    };
    return roleNames[roleId] || roleId;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        overflowY: 'auto',
      }}
      role="dialog"
      aria-labelledby="summary-title"
      aria-modal="true"
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.95) 0%, rgba(30, 30, 60, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.6)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.9)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1
            id="summary-title"
            style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#d4af37',
              marginBottom: '12px',
              fontFamily: 'Georgia, serif',
              textShadow: '0 0 25px rgba(212, 175, 55, 0.7)',
            }}
          >
            {winnerAlignment === 'COVEN' ? '✨ Sacred Victory ✨' : winnerAlignment === 'HOLLOW' ? '🌙 Hollow Victory 🌙' : '⚔️ Draw ⚔️'}
          </h1>
          <p
            style={{
              color: 'rgba(200, 190, 170, 0.9)',
              fontSize: '16px',
              marginBottom: '8px',
            }}
          >
            Game lasted {gameState.roundNumber} rounds
          </p>
          {meta.rulesets && (meta.rulesets.enableInfection || meta.rulesets.enableCorruption) && (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
              {meta.rulesets.enableInfection && (
                <span
                  style={{
                    background: 'rgba(139, 92, 246, 0.3)',
                    border: '1px solid rgba(139, 92, 246, 0.5)',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    color: '#c4b5fd',
                  }}
                >
                  🦠 Infection
                </span>
              )}
              {meta.rulesets.enableCorruption && (
                <span
                  style={{
                    background: 'rgba(234, 179, 8, 0.3)',
                    border: '1px solid rgba(234, 179, 8, 0.5)',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    color: '#fde047',
                  }}
                >
                  ☠️ Corruption
                </span>
              )}
            </div>
          )}
        </div>

        {/* Player Results */}
        <div style={{ marginBottom: '32px' }}>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#d4af37',
              marginBottom: '16px',
              fontFamily: 'Georgia, serif',
            }}
          >
            Final Results
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedPlayers.map(([playerId, playerState]) => (
              <div
                key={playerId}
                style={{
                  background: playerState.isAlive
                    ? 'rgba(34, 197, 94, 0.1)'
                    : 'rgba(100, 100, 100, 0.1)',
                  border: `2px solid ${playerState.isAlive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(100, 100, 100, 0.3)'}`,
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ flex: '1', minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: playerState.isAlive ? '#22c55e' : '#9ca3af',
                      }}
                    >
                      {playerNames[playerId] || 'Unknown'}
                    </span>
                    {playerState.wasInfected && (
                      <span
                        style={{
                          fontSize: '16px',
                          filter: 'grayscale(0.3)',
                        }}
                        title="Was infected"
                      >
                        🦠
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: getFactionColor(playerState.roleId),
                      }}
                    />
                    <span
                      style={{
                        fontSize: '14px',
                        color: getFactionColor(playerState.roleId),
                        fontWeight: '500',
                      }}
                    >
                      {getRoleName(playerState.roleId)}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {!playerState.isAlive && (
                    <span
                      style={{
                        fontSize: '13px',
                        color: '#9ca3af',
                        fontStyle: 'italic',
                      }}
                    >
                      Eliminated Round {playerState.eliminatedRound}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: '20px',
                    }}
                  >
                    {playerState.isAlive ? '✅' : '💀'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Round History */}
        {roundHistory && roundHistory.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#d4af37',
                marginBottom: '16px',
                fontFamily: 'Georgia, serif',
              }}
            >
              Round History
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {roundHistory.map((round, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(76, 29, 149, 0.3)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#d4af37',
                      }}
                    >
                      Round {round.roundNumber}
                    </span>
                    {round.outcome && (
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color:
                            round.outcome.state === 'PURE'
                              ? 'var(--color-pure)'
                              : round.outcome.state === 'TAINTED'
                              ? 'var(--color-tainted)'
                              : 'var(--color-backfired)',
                        }}
                      >
                        {round.outcome.state}
                      </span>
                    )}
                  </div>
                  {round.eliminated && (
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#ef4444',
                      }}
                    >
                      ⚰️ {playerNames[round.eliminated] || 'Unknown'} was eliminated
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {onPlayAgain && (
            <Button
              onClick={onPlayAgain}
              style={{
                background: 'linear-gradient(135deg, #d4af37, #b8941f)',
                color: 'rgba(20, 15, 10, 0.95)',
                border: '2px solid rgba(212, 175, 55, 0.8)',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 0 25px rgba(212, 175, 55, 0.4)',
              }}
            >
              🔄 Play Again
            </Button>
          )}
          <Button
            onClick={onClose}
            style={{
              background: 'rgba(30, 20, 15, 0.85)',
              color: 'rgba(200, 190, 170, 0.85)',
              border: '2px solid rgba(139, 87, 42, 0.5)',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
