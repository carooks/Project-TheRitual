import React, { useEffect, useMemo, useState } from 'react';
import { DiscussionChat } from './DiscussionChat';
import { Phase, RoundState } from '@/lib/types';
import type { MultiplayerSharedState, PlayerStatus } from '@/lib/multiplayerState';

interface TVDisplayProps {
  round: RoundState;
  roomCode: string;
  timer?: number;
  sharedState: MultiplayerSharedState | null;
  onAdvancePhase?: () => void;
  onBeginNomination?: () => void;
}

interface PhaseMeta {
  title: string;
  description: string;
  accent: string;
}

export function TVDisplay({
  round,
  roomCode,
  timer,
  sharedState,
  onAdvancePhase,
  onBeginNomination,
}: TVDisplayProps) {
  const [phaseTimer, setPhaseTimer] = useState<number | null>(null);

  useEffect(() => {
    if (!sharedState?.phaseExpiresAt) {
      setPhaseTimer(null);
      return;
    }
    const updateTimer = () => {
      setPhaseTimer(Math.max(0, Math.ceil((sharedState.phaseExpiresAt - Date.now()) / 1000)));
    };
    updateTimer();
    const id = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(id);
  }, [sharedState?.phaseExpiresAt]);

  const phase = sharedState?.phase ?? round.phase;
  const roundNumber = sharedState?.roundNumber ?? round.id;
  const performerId = sharedState?.currentPerformerId ?? null;
  const pendingPower = sharedState?.pendingPower;
  const nominationVotes = sharedState?.nominationVotes ?? {};
  const councilVotes = sharedState?.councilVotes ?? {};
  const ingredientSelections = sharedState?.ingredientSelections ?? {};
  const ritualOutcome = sharedState?.ritualOutcome ?? round.outcome ?? undefined;
  const voteRevealOrder = sharedState?.nominationRevealOrder ?? [];

  const displayPlayers: Array<PlayerStatus & { dead?: boolean }> = useMemo(() => {
    if (sharedState) {
      return Object.values(sharedState.players);
    }
    return round.players.map((p) => ({
      id: p.id,
      name: p.name,
      roleId: p.roleId,
      alignment: p.alignment,
      alive: p.alive,
    }));
  }, [round.players, sharedState]);

  const alivePlayers = displayPlayers.filter((p) => p.alive);
  const nominationTally = useMemo(() => tallyVotes(nominationVotes), [nominationVotes]);
  const councilTally = useMemo(() => tallyVotes(councilVotes), [councilVotes]);
  const lockedIngredientCount = Object.keys(ingredientSelections).length;
  const displayTimer = phaseTimer ?? (typeof timer === 'number' ? timer : null);

  const phaseMeta: Record<Phase, PhaseMeta> = {
    [Phase.LOBBY]: { title: '⏳ Waiting Room', description: 'Gather the coven before starting.', accent: '#94a3b8' },
    [Phase.NOMINATION_DISCUSSION]: {
      title: '🗣️ Nomination Discussion',
      description: 'Let the coven debate. Advance when ready.',
      accent: '#facc15',
    },
    [Phase.NOMINATION_VOTE]: {
      title: '⚖️ Nomination Vote',
      description: 'Players are voting on the next performer.',
      accent: '#f87171',
    },
    [Phase.NOMINATION_REVEAL]: {
      title: '🔮 Performer Reveal',
      description: 'Announce who must act.',
      accent: '#a78bfa',
    },
    [Phase.INGREDIENT_CHOICE]: {
      title: '🎴 Ingredient Selection',
      description: 'Track ingredient locks in real time.',
      accent: '#38bdf8',
    },
    [Phase.RITUAL_RESOLUTION]: {
      title: '🕯️ Ritual Resolution',
      description: 'Narrate the outcome as it unfolds.',
      accent: '#f472b6',
    },
    [Phase.PERFORMER_POWER]: {
      title: '✨ Performer Power',
      description: 'Performer is choosing a target.',
      accent: '#fbcfe8',
    },
    [Phase.COUNCIL_VOTE]: {
      title: '🔥 Council Vote',
      description: 'All alive witches must vote to burn someone.',
      accent: '#f97316',
    },
    [Phase.GAME_OVER]: {
      title: '🏁 Ritual Complete',
      description: sharedState?.winnerReason ?? 'Final verdict delivered.',
      accent: '#c084fc',
    },
    [Phase.CHOOSING]: { title: '🎴 The Choosing', description: 'Legacy solo flow', accent: '#94a3b8' },
    [Phase.OFFERING]: { title: '🕯️ The Offering', description: 'Legacy solo flow', accent: '#94a3b8' },
    [Phase.REVEAL]: { title: '✨ The Revelation', description: 'Legacy solo flow', accent: '#94a3b8' },
    [Phase.OUTCOME]: { title: '💀 The Consequences', description: 'Legacy solo flow', accent: '#94a3b8' },
    [Phase.COUNCIL]: { title: '⚖️ The Council', description: 'Legacy panel', accent: '#94a3b8' },
    [Phase.END]: { title: '🏁 End', description: 'Legacy panel', accent: '#94a3b8' },
  };

  const meta = phaseMeta[phase] ?? { title: 'The Ritual', description: '', accent: '#d4af37' };

  const performer = performerId ? displayPlayers.find((p) => p.id === performerId) : null;
  const pendingPowerTargets = pendingPower?.availableTargets || [];

  function renderPhasePanel() {
    switch (phase) {
      case Phase.NOMINATION_DISCUSSION:
        return (
          <div>
            <p style={{ 
              color: '#e9d5ff', 
              marginBottom: '16px',
              fontFamily: 'Georgia, serif',
            }}>
              Let the coven debate freely. When the conversation peaks, start the vote.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={onBeginNomination}
                disabled={!onBeginNomination}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid rgba(212, 175, 55, 0.6)',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.5) 0%, rgba(76, 29, 149, 0.7) 100%)',
                  color: '#fef3c7',
                  fontWeight: 600,
                  cursor: onBeginNomination ? 'pointer' : 'not-allowed',
                  opacity: onBeginNomination ? 1 : 0.5,
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
                  fontFamily: 'Georgia, serif',
                }}
              >
                🗳️ Begin Nomination Vote
              </button>
              <button
                onClick={onAdvancePhase}
                disabled={!onAdvancePhase}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '2px solid rgba(148, 163, 184, 0.4)',
                  background: 'rgba(30, 30, 60, 0.6)',
                  color: '#cbd5f5',
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: onAdvancePhase ? 'pointer' : 'not-allowed',
                  opacity: onAdvancePhase ? 0.9 : 0.5,
                }}
              >
                ⏭️ Skip Discussion (Force Timer)
              </button>
            </div>
          </div>
        );
      case Phase.NOMINATION_VOTE: {
        const votesCast = Object.keys(nominationVotes).length;
        return (
          <div>
            <p style={{ color: '#fecdd3', marginBottom: '8px' }}>
              {votesCast} / {alivePlayers.length} votes recorded
            </p>
            <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
              {Object.entries(nominationTally).map(([targetId, count]) => {
                const target = displayPlayers.find((p) => p.id === targetId);
                if (!target) return null;
                return (
                  <div key={targetId} style={voteRowStyle}>
                    <span>{target.name}</span>
                    <span>{count} vote{count > 1 ? 's' : ''}</span>
                  </div>
                );
              })}
            </div>
            {voteRevealOrder.length > 0 && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: '#94a3b8' }}>
                Reveal Order:{' '}
                {voteRevealOrder
                  .map((entry) => {
                    const target = displayPlayers.find((p) => p.id === entry.targetId);
                    return `${entry.voteNumber}. ${target ? target.name : entry.targetId.substring(0, 4)}`;
                  })
                  .join(' · ')}
              </div>
            )}
          </div>
        );
      }
      case Phase.NOMINATION_REVEAL:
        return (
          <div>
            <p style={{ color: '#c084fc', marginBottom: '12px' }}>Announce the player who must conduct the ritual.</p>
            {performer && (
              <div style={performerCardStyle(meta.accent)}>
                <div style={{ fontSize: '48px' }}>🔮</div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{performer.name}</div>
                  <div style={{ color: '#cbd5f5' }}>Performer</div>
                </div>
              </div>
            )}
          </div>
        );
      case Phase.INGREDIENT_CHOICE:
        return (
          <div>
            <p style={{ color: '#bae6fd', marginBottom: '12px' }}>
              {lockedIngredientCount} of {alivePlayers.length} ingredients locked in.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {alivePlayers.map((player) => {
                const hasSelected = Boolean(ingredientSelections[player.id]);
                return (
                  <div key={player.id} style={voteRowStyle}>
                    <span>{player.name}</span>
                    <span style={{ color: hasSelected ? '#22d3ee' : '#64748b' }}>
                      {hasSelected ? 'Locked' : 'Waiting'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case Phase.RITUAL_RESOLUTION:
        return (
          <div>
            {ritualOutcome ? (
              <div>
                <div style={{ fontSize: '42px', marginBottom: '8px' }}>
                  {ritualOutcome.state === 'PURE' ? '🌕' : ritualOutcome.state === 'TAINTED' ? '🌘' : '🌑'}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                  {ritualOutcome.state}
                </div>
                <div style={{ color: '#cbd5f5' }}>Dominant Ingredient: {ritualOutcome.dominantIngredientId}</div>
                {ritualOutcome.notes?.length > 0 && (
                  <ul style={{ marginTop: '12px', color: '#94a3b8', paddingLeft: '20px' }}>
                    {ritualOutcome.notes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p style={{ color: '#e0e7ff' }}>Waiting on resolver...</p>
            )}
          </div>
        );
      case Phase.PERFORMER_POWER:
        return (
          <div>
            {pendingPower && performer ? (
              <>
                {(() => {
                  const powerType = pendingPower.type
                  const powerTitles = {
                    INGREDIENT_REVEAL: 'choosing whose ingredient to reveal',
                    ALIGNMENT_REVEAL: 'choosing a target to reveal',
                    PROTECT_PLAYER: 'choosing who to shield from death',
                    STEAL_VISION: 'choosing whose visions to steal',
                    DOUBLE_VOTE: 'receives double vote power',
                    CHAOS_SPREAD: 'spreading Hollow corruption',
                    AMPLIFY_CHAOS: 'amplifying the next ritual'
                  }
                  const title = powerTitles[powerType] || 'using their power'
                  
                  // Auto-applied powers (no targets)
                  if (powerType === 'DOUBLE_VOTE' || powerType === 'CHAOS_SPREAD' || powerType === 'AMPLIFY_CHAOS') {
                    return (
                      <p style={{ color: '#fbcfe8', marginBottom: '12px' }}>
                        {performer.name} {title}
                      </p>
                    )
                  }

                  // Targeted powers
                  return (
                    <>
                      <p style={{ color: '#fbcfe8', marginBottom: '12px' }}>
                        {performer.name} is {title} ({pendingPowerTargets.length} available)
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {pendingPowerTargets.map((targetId) => {
                          const target = displayPlayers.find((p) => p.id === targetId);
                          if (!target) return null;
                          return (
                            <div key={targetId} style={voteRowStyle}>
                              <span>{target.name}</span>
                              <span>Awaiting selection</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )
                })()}
              </>
            ) : (
              <p style={{ color: '#fbcfe8' }}>No performer power available this round.</p>
            )}
          </div>
        );
      case Phase.COUNCIL_VOTE: {
        const votesCast = Object.keys(councilVotes).length;
        return (
          <div>
            <p style={{ color: '#fed7aa', marginBottom: '8px' }}>
              {votesCast} / {alivePlayers.length} council votes submitted
            </p>
            <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '4px' }}>
              {Object.entries(councilTally).map(([targetId, count]) => {
                const target = displayPlayers.find((p) => p.id === targetId);
                if (!target) return null;
                return (
                  <div key={targetId} style={voteRowStyle}>
                    <span>{target.name}</span>
                    <span>{count} burn vote{count > 1 ? 's' : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      case Phase.GAME_OVER:
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>
              {sharedState?.winnerAlignment === 'COVEN' ? '🌕' : '🌑'}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              {sharedState?.winnerAlignment === 'COVEN' ? 'Coven Victory' : 'Hollow Triumph'}
            </div>
            <div style={{ color: '#cbd5f5' }}>{sharedState?.winnerReason}</div>
          </div>
        );
      default:
        return (
          <div>
            <p style={{ color: '#cbd5f5' }}>Legacy solo mode UI. No multiplayer data yet.</p>
          </div>
        );
    }
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundImage: 'url(/assets/backgrounds/title-screen.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      color: '#f1f5f9',
      overflow: 'hidden',
    }}>
      {/* Dark Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(5, 8, 20, 0.85), rgba(30, 10, 50, 0.85))',
      }} />

      {/* Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '40px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px',
        }}>
          <div>
            <h1 style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: meta.accent,
              textShadow: `0 0 20px ${meta.accent}80`,
              marginBottom: '8px',
            }}>
              {meta.title}
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#94a3b8',
              fontStyle: 'italic',
            }}>
              {meta.description}
            </p>
          </div>

          <div style={{
            textAlign: 'right',
          }}>
            <div style={{
              fontSize: '16px',
              color: '#94a3b8',
              marginBottom: '8px',
            }}>
              Room Code
            </div>
            <div style={{
              fontSize: '42px',
              fontWeight: 'bold',
              color: '#14b8a6',
              fontFamily: 'monospace',
              letterSpacing: '0.15em',
              textShadow: '0 0 15px rgba(20, 184, 166, 0.6)',
            }}>
              {roomCode}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          gap: '40px',
        }}>
          {/* Left Column: Players */}
          <div style={{
            flex: 1,
            backgroundColor: 'rgba(10, 10, 30, 0.7)',
            border: '2px solid rgba(212, 175, 55, 0.5)',
            borderRadius: '16px',
            padding: '24px',
            backdropFilter: 'blur(10px)',
          }}>
            <h2 style={{
              fontSize: '28px',
              color: '#d4af37',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              🧙 Coven Members
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: 'calc(100vh - 240px)',
              overflowY: 'auto',
            }}>
              {displayPlayers.map((player, index) => {
                const isPerformer = performerId === player.id;
                const isDead = !player.alive;
                return (
                  <div
                    key={player.id}
                    style={{
                      backgroundColor: isPerformer ? 'rgba(212, 175, 55, 0.2)' : 'rgba(30, 30, 60, 0.5)',
                      border: `2px solid ${isPerformer ? '#d4af37' : 'rgba(100, 100, 150, 0.3)'}`,
                      borderRadius: '12px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      opacity: isDead ? 0.4 : 1,
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#4c1d95',
                      border: '2px solid #d4af37',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#d4af37',
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#f1f5f9',
                      }}>
                        {player.name}
                      </div>
                      {isPerformer && (
                        <div style={{
                          fontSize: '14px',
                          color: '#d4af37',
                          marginTop: '4px',
                        }}>
                          Performer
                        </div>
                      )}
                      {isDead && (
                        <div style={{
                          fontSize: '14px',
                          color: '#f87171',
                          marginTop: '4px',
                        }}>
                          Deceased
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {nominationTally[player.id] && (
                        <span style={chipStyle('#a855f7')}>
                          ⚖️ {nominationTally[player.id]}
                        </span>
                      )}
                      {ingredientSelections[player.id] && (
                        <span style={chipStyle('#14b8a6')}>
                          🧪
                        </span>
                      )}
                      {councilTally[player.id] && (
                        <span style={chipStyle('#f97316')}>
                          🔥 {councilTally[player.id]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Round Info & Timer */}
          <div style={{
            width: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}>
            {/* Round Info */}
            <div style={{
              backgroundColor: 'rgba(10, 10, 30, 0.7)',
              border: '2px solid rgba(212, 175, 55, 0.5)',
              borderRadius: '16px',
              padding: '24px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{
                fontSize: '18px',
                color: '#94a3b8',
                marginBottom: '8px',
                textAlign: 'center',
              }}>
                Current Round
              </div>
              <div style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: '#d4af37',
                textAlign: 'center',
                textShadow: '0 0 30px rgba(212, 175, 55, 0.6)',
              }}>
                {roundNumber}
              </div>
            </div>

            {/* Timer */}
            {displayTimer !== null && displayTimer > 0 && (
              <div style={{
                backgroundColor: 'rgba(10, 10, 30, 0.7)',
                border: '2px solid rgba(212, 175, 55, 0.5)',
                borderRadius: '16px',
                padding: '24px',
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{
                  fontSize: '18px',
                  color: '#94a3b8',
                  marginBottom: '12px',
                  textAlign: 'center',
                }}>
                  ⏱️ Time Remaining
                </div>
                <div style={{
                  fontSize: '64px',
                  fontWeight: 'bold',
                  color: displayTimer < 10 ? '#dc2626' : '#14b8a6',
                  textAlign: 'center',
                  textShadow: displayTimer < 10 
                    ? '0 0 30px rgba(220, 38, 38, 0.6)' 
                    : '0 0 30px rgba(20, 184, 166, 0.6)',
                  animation: displayTimer < 10 ? 'pulse 1s infinite' : 'none',
                }}>
                  {displayTimer}
                </div>
              </div>
            )}

            {/* Phase Details */}
            <div style={{
              backgroundColor: 'rgba(10, 10, 30, 0.7)',
              border: '2px solid rgba(100, 100, 150, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
            }}>
              {renderPhasePanel()}
            </div>

            {sharedState && phase !== Phase.GAME_OVER && (
              <button
                onClick={onAdvancePhase}
                disabled={!onAdvancePhase}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid rgba(148, 163, 184, 0.5)',
                  background: 'rgba(148, 163, 184, 0.15)',
                  color: '#e2e8f0',
                  fontWeight: 600,
                  cursor: onAdvancePhase ? 'pointer' : 'not-allowed',
                  opacity: onAdvancePhase ? 1 : 0.5,
                }}
              >
                Force Advance Phase
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animation for pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

function tallyVotes(votes: Record<string, string>): Record<string, number> {
  return Object.values(votes).reduce<Record<string, number>>((tally, targetId) => {
    tally[targetId] = (tally[targetId] || 0) + 1;
    return tally;
  }, {});
}

const voteRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 12px',
  borderRadius: '10px',
  backgroundColor: 'rgba(15, 15, 35, 0.7)',
  border: '1px solid rgba(148, 163, 184, 0.2)',
  color: '#f8fafc',
  fontSize: '14px',
};

const performerCardStyle = (accent: string): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '16px',
  borderRadius: '16px',
  border: `2px solid ${accent}`,
  backgroundColor: 'rgba(15, 10, 30, 0.8)',
});

const chipStyle = (borderColor: string): React.CSSProperties => ({
  border: `1px solid ${borderColor}`,
  borderRadius: '20px',
  padding: '4px 10px',
  fontSize: '12px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
});
