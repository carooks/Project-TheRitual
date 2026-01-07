import React, { useEffect, useMemo, useState } from 'react';
import { IngredientId, Phase, RoleId } from '@/lib/types';
import { INGREDIENTS } from '@/lib/ingredients';
import { getIngredientPoolForRole, ROLES } from '@/lib/roles';
import type { MultiplayerPlayer } from '@/hooks/useSupabaseMultiplayer';
import type { MultiplayerSharedState, PlayerStatus } from '@/lib/multiplayerState';

interface PlayerGameScreenProps {
  playerId: string;
  playerName: string;
  roomPlayers: MultiplayerPlayer[];
  sharedState: MultiplayerSharedState | null;
  fallbackPhase: Phase;
  fallbackRound: number;
  roleId?: RoleId;
  localSelection?: IngredientId | string;
  hasVoted?: boolean;
  onSubmitNomination?: (playerId: string) => void;
  onSubmitIngredient?: (ingredientId: string) => void;
  onSubmitCouncil?: (playerId: string) => void;
  onSubmitPower?: (playerId: string) => void;
}

type PhaseDescriptor = {
  title: string;
  instruction: string;
  icon: string;
}

export function PlayerGameScreen({
  playerId,
  playerName,
  roomPlayers,
  sharedState,
  fallbackPhase,
  fallbackRound,
  roleId,
  localSelection,
  hasVoted,
  onSubmitNomination,
  onSubmitIngredient,
  onSubmitCouncil,
  onSubmitPower,
}: PlayerGameScreenProps) {
  const [showRole, setShowRole] = useState(false);
  const [phaseTimer, setPhaseTimer] = useState<number | null>(null);

  const role = roleId ? ROLES[roleId] : null;
  const isCorrupted = role?.alignment === 'HOLLOW';

  useEffect(() => {
    if (!sharedState?.phaseExpiresAt) {
      setPhaseTimer(null);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.ceil((sharedState.phaseExpiresAt - Date.now()) / 1000));
      setPhaseTimer(remaining);
    };

    updateTimer();
    const intervalId = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(intervalId);
  }, [sharedState?.phaseExpiresAt]);

  const phase = sharedState?.phase ?? fallbackPhase;
  const round = sharedState?.roundNumber ?? fallbackRound;
  const playerStatus = sharedState?.players[playerId];
  const playerAlive = playerStatus?.alive ?? true;
  const performerId = sharedState?.currentPerformerId ?? null;
  const pendingPower = sharedState?.pendingPower;
  const nominationVote = sharedState?.nominationVotes[playerId];
  const councilVote = sharedState?.councilVotes[playerId];
  const remoteSelection = sharedState?.ingredientSelections[playerId];
  const selectedIngredient = remoteSelection ?? localSelection;
  const canVoteNomination = playerAlive && !nominationVote && phase === Phase.NOMINATION_VOTE;
  const canVoteCouncil = playerAlive && !councilVote && phase === Phase.COUNCIL_VOTE;
  const canUsePower =
    pendingPower &&
    pendingPower.performerId === playerId &&
    pendingPower.availableTargets.length > 0 &&
    phase === Phase.PERFORMER_POWER;

  const sharedPlayers: PlayerStatus[] = useMemo(() => {
    if (sharedState) {
      return Object.values(sharedState.players);
    }
    return roomPlayers.map((p) => ({
      id: p.id,
      name: p.name,
      roleId: roleId || 'PROTECTION',
      alignment: 'COVEN',
      alive: true,
      isHost: p.isHost,
    }));
  }, [roomPlayers, roleId, sharedState]);

  const alivePlayers = sharedPlayers.filter((p) => p.alive);
  const currentPerformer = performerId ? sharedPlayers.find((p) => p.id === performerId) : null;

  const availableIngredients = useMemo(() => {
    if (!roleId) return Object.values(INGREDIENTS);
    try {
      const pool = getIngredientPoolForRole(roleId);
      const ids = Array.from(new Set([...(pool.core || []), ...(pool.occasional || [])]));
      return ids.map((id) => INGREDIENTS[id]);
    } catch {
      return Object.values(INGREDIENTS);
    }
  }, [roleId]);

  const corruptedSelections = useMemo(() => {
    if (!isCorrupted || !sharedState) return [];
    return sharedPlayers
      .filter((p) => p.alignment === 'HOLLOW' && p.id !== playerId)
      .map((p) => {
        const ingredientId = sharedState.ingredientSelections[p.id];
        return {
          player: p,
          ingredientId,
          ingredient: ingredientId ? INGREDIENTS[ingredientId] : null,
        };
      })
      .filter((entry) => entry.ingredientId);
  }, [isCorrupted, playerId, sharedPlayers, sharedState]);

  const phaseDescriptors: Partial<Record<Phase, PhaseDescriptor>> = {
    [Phase.NOMINATION_DISCUSSION]: {
      title: '🗣️ Discuss the Performer',
      instruction: 'Debate who should conduct the ritual before the host moves to a vote.',
      icon: '🗝️',
    },
    [Phase.NOMINATION_VOTE]: {
      title: '⚖️ Nominate the Performer',
      instruction: 'Cast a vote for the witch who must perform the ritual.',
      icon: '⚖️',
    },
    [Phase.NOMINATION_REVEAL]: {
      title: '🔮 Performer Revealed',
      instruction: 'Watch the TV to see who must act.',
      icon: '🔮',
    },
    [Phase.INGREDIENT_CHOICE]: {
      title: '🎴 Select Your Ingredient',
      instruction: 'Only the performer survives if the ritual stays pure. Choose wisely.',
      icon: '🎴',
    },
    [Phase.RITUAL_RESOLUTION]: {
      title: '🕯️ Ritual Resolving',
      instruction: 'Eyes on the TV—the cauldron judges your choices.',
      icon: '🕯️',
    },
    [Phase.PERFORMER_POWER]: {
      title: '✨ Performer Power',
      instruction: 'Use visions granted by the ritual before the council begins.',
      icon: '✨',
    },
    [Phase.COUNCIL_VOTE]: {
      title: '⚔️ Burn the Traitor',
      instruction: 'Vote to eliminate one witch from the coven.',
      icon: '⚔️',
    },
    [Phase.GAME_OVER]: {
      title: '🏁 The Ritual Ends',
      instruction: sharedState?.winnerReason ?? 'The coven has reached its fate.',
      icon: '🏁',
    },
  };

  const descriptor = phaseDescriptors[phase] ?? {
    title: 'The Ritual',
    instruction: 'Await instructions from the host.',
    icon: '🔮',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundImage: 'url(/assets/backgrounds/title-screen.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      overflow: 'auto',
    }}>
      {/* Dark Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(5, 8, 20, 0.95), rgba(30, 10, 50, 0.95))',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100%',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'rgba(10, 10, 30, 0.8)',
          border: '2px solid rgba(212, 175, 55, 0.6)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          backdropFilter: 'blur(10px)',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#d4af37',
              }}>
                {playerName}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#94a3b8',
              }}>
                Round {round}
              </div>
            </div>
            {phaseTimer !== null && phaseTimer >= 0 && (
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: phaseTimer < 10 ? '#dc2626' : '#14b8a6',
                textShadow: phaseTimer < 10
                  ? '0 0 15px rgba(220, 38, 38, 0.8)'
                  : '0 0 15px rgba(20, 184, 166, 0.8)',
              }}>
                {phaseTimer}s
              </div>
            )}
          </div>

          {/* Secret Role Button */}
          {role && (
            <button
              onClick={() => setShowRole(!showRole)}
              style={{
                width: '100%',
                backgroundColor: showRole ? '#4c1d95' : 'rgba(76, 29, 149, 0.3)',
                color: '#d4af37',
                border: '2px solid #d4af37',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
            >
              {showRole ? `🔮 ${role.name}` : '👁️ View Secret Role'}
            </button>
          )}
          
          {showRole && role && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              backgroundColor: 'rgba(76, 29, 149, 0.4)',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#e2e8f0',
              lineHeight: '1.5',
            }}>
              <div style={{ color: '#d4af37', fontWeight: '600', marginBottom: '4px' }}>
                Your Goal:
              </div>
              {role.shortDescription}
            </div>
          )}
        </div>

        {/* Phase Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#d4af37',
            marginBottom: '8px',
            textShadow: '0 0 20px rgba(212, 175, 55, 0.6)',
          }}>
            {descriptor.title}
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#94a3b8',
            fontStyle: 'italic',
          }}>
            {descriptor.instruction}
          </p>
        </div>

        <div style={{ flex: 1 }}>
          {/* NOMINATION VOTE */}
          {phase === Phase.NOMINATION_VOTE && (
            <div>
              <div style={{
                marginBottom: '16px',
                color: '#cbd5f5',
                textAlign: 'center',
              }}>
                Select the witch you want to perform the ritual.
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '12px',
              }}>
                {alivePlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => onSubmitNomination?.(player.id)}
                    disabled={!canVoteNomination || player.id === playerId}
                    style={{
                      backgroundColor: nominationVote === player.id
                        ? 'rgba(76, 29, 149, 0.8)'
                        : 'rgba(30, 30, 60, 0.75)',
                      border: `2px solid ${nominationVote === player.id ? '#d4af37' : 'rgba(100, 100, 150, 0.4)'}`,
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: !canVoteNomination ? 'not-allowed' : 'pointer',
                      color: '#f1f5f9',
                      opacity: player.id === playerId ? 0.4 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{player.name}</div>
                    <div style={{
                      marginTop: '6px',
                      fontSize: '12px',
                      color: nominationVote === player.id ? '#d4af37' : '#94a3b8',
                    }}>
                      {player.id === playerId ? 'You' : nominationVote === player.id ? 'Voted' : 'Vote' }
                    </div>
                  </button>
                ))}
              </div>
              {!canVoteNomination && nominationVote && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  textAlign: 'center',
                  color: '#94a3b8',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  borderRadius: '12px',
                }}>
                  Vote received. Waiting for the rest of the coven...
                </div>
              )}
            </div>
          )}

          {/* INGREDIENT CHOICE */}
          {phase === Phase.INGREDIENT_CHOICE && (
            <div>
              {!playerAlive && (
                <div style={{
                  marginBottom: '20px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid rgba(148, 163, 184, 0.4)',
                  backgroundColor: 'rgba(15, 10, 20, 0.8)',
                  textAlign: 'center',
                  color: '#9ca3af',
                }}>
                  You are no longer among the living. Observe and scheme.
                </div>
              )}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '12px',
              }}>
                {availableIngredients.map((ingredient) => (
                  <button
                    key={ingredient.id}
                    onClick={() => onSubmitIngredient?.(ingredient.id)}
                    disabled={!playerAlive || Boolean(selectedIngredient)}
                    style={{
                      backgroundColor: selectedIngredient === ingredient.id
                        ? '#4c1d95'
                        : 'rgba(30, 30, 60, 0.7)',
                      border: `2px solid ${selectedIngredient === ingredient.id ? '#d4af37' : 'rgba(100, 100, 150, 0.5)'}`,
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: !playerAlive || selectedIngredient ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s',
                      opacity: !playerAlive || (selectedIngredient && selectedIngredient !== ingredient.id)
                        ? 0.5
                        : 1,
                      boxShadow: selectedIngredient === ingredient.id
                        ? '0 0 20px rgba(212, 175, 55, 0.5)'
                        : 'none',
                    }}
                  >
                    <div style={{
                      fontSize: '36px',
                      marginBottom: '8px',
                    }}>
                      {ingredient.icon}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#f1f5f9',
                      marginBottom: '4px',
                    }}>
                      {ingredient.name}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#94a3b8',
                      fontStyle: 'italic',
                    }}>
                      {ingredient.shortDescription}
                    </div>
                  </button>
                ))}
              </div>

              {selectedIngredient && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  border: '2px solid #d4af37',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '16px',
                    color: '#d4af37',
                    fontWeight: '600',
                  }}>
                    ✓ Ingredient Locked In
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#94a3b8',
                    marginTop: '4px',
                  }}>
                    Waiting for the rest of the coven...
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CORRUPTED HUD */}
          {isCorrupted && selectedIngredient && phase === Phase.INGREDIENT_CHOICE && corruptedSelections.length > 0 && (
            <div style={{
              marginTop: '20px',
              padding: '16px',
              backgroundColor: 'rgba(139, 0, 0, 0.3)',
              border: '2px solid #dc2626',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{
                fontSize: '16px',
                color: '#dc2626',
                fontWeight: '600',
                marginBottom: '12px',
                textAlign: 'center',
              }}>
                {/* PASSIVE PHASE STATES */}
                {(phase === Phase.NOMINATION_DISCUSSION || phase === Phase.NOMINATION_REVEAL || phase === Phase.RITUAL_RESOLUTION) && (
                  <div style={{
                    padding: '40px 20px',
                    borderRadius: '12px',
                    border: '2px solid rgba(212, 175, 55, 0.5)',
                    backgroundColor: 'rgba(10, 10, 30, 0.8)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>{descriptor.icon}</div>
                    <div style={{ color: '#cbd5f5' }}>
                      Watch the host display. No action required on your phone yet.
                    </div>
                  </div>
                )}

                {/* PERFORMER POWER */}
                {phase === Phase.PERFORMER_POWER && (
                  <div>
                    {canUsePower ? (
                      <div>
                        <div style={{
                          marginBottom: '16px',
                          textAlign: 'center',
                          color: '#c084fc',
                        }}>
                          The ritual grants you insight. Select a target to reveal their alignment.
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                          gap: '12px',
                        }}>
                          {pendingPower?.availableTargets.map((targetId) => {
                            const target = sharedState?.players[targetId];
                            if (!target) return null;
                            return (
                              <button
                                key={targetId}
                                onClick={() => onSubmitPower?.(targetId)}
                                style={{
                                  backgroundColor: 'rgba(36, 12, 48, 0.8)',
                                  border: '2px solid rgba(192, 132, 252, 0.6)',
                                  borderRadius: '12px',
                                  padding: '16px',
                                  color: '#f3e8ff',
                                  cursor: 'pointer',
                                }}
                              >
                                <div style={{ fontWeight: 600 }}>{target.name}</div>
                                <div style={{ fontSize: '12px', color: '#cbd5f5', marginTop: '6px' }}>
                                  Reveal alignment
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        padding: '32px',
                        borderRadius: '12px',
                        border: '2px solid rgba(148, 163, 184, 0.4)',
                        backgroundColor: 'rgba(12, 10, 24, 0.8)',
                        textAlign: 'center',
                        color: '#cbd5f5',
                      }}>
                        Awaiting performer power usage...
                      </div>
                    )}
                  </div>
                )}

                {/* COUNCIL VOTE */}
                {phase === Phase.COUNCIL_VOTE && (
                  <div>
                    <div style={{
                      fontSize: '16px',
                      color: '#94a3b8',
                      marginBottom: '16px',
                      textAlign: 'center',
                    }}>
                      Vote to eliminate a coven member
                    </div>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}>
                      {alivePlayers
                        .filter((p) => p.id !== playerId)
                        .map((player) => (
                          <button
                            key={player.id}
                            onClick={() => onSubmitCouncil?.(player.id)}
                            disabled={!canVoteCouncil}
                            style={{
                              backgroundColor: canVoteCouncil ? 'rgba(30, 30, 60, 0.8)' : 'rgba(30, 30, 60, 0.5)',
                              border: '2px solid rgba(212, 175, 55, 0.5)',
                              borderRadius: '12px',
                              padding: '16px',
                              cursor: canVoteCouncil ? 'pointer' : 'not-allowed',
                              opacity: player.id === councilVote ? 1 : 0.95,
                              transition: 'all 0.3s',
                            }}
                          >
                            <div style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#f1f5f9',
                            }}>
                              {player.name}
                            </div>
                            {councilVote === player.id && (
                              <div style={{
                                fontSize: '13px',
                                color: '#d4af37',
                                marginTop: '4px',
                              }}>
                                Voted
                              </div>
                            )}
                          </button>
                        ))}
                    </div>

                    {(councilVote || hasVoted) && (
                      <div style={{
                        marginTop: '20px',
                        padding: '16px',
                        backgroundColor: 'rgba(212, 175, 55, 0.2)',
                        border: '2px solid #d4af37',
                        borderRadius: '12px',
                        textAlign: 'center',
                      }}>
                        <div style={{
                          fontSize: '16px',
                          color: '#d4af37',
                          fontWeight: '600',
                        }}>
                          ✓ Vote Cast
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#94a3b8',
                          marginTop: '4px',
                        }}>
                          Waiting for other players...
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* GAME OVER */}
                {phase === Phase.GAME_OVER && (
                  <div style={{
                    padding: '32px',
                    borderRadius: '12px',
                    border: '2px solid rgba(212, 175, 55, 0.6)',
                    backgroundColor: 'rgba(15, 12, 20, 0.85)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                      {sharedState?.winnerAlignment === 'COVEN' ? '🌕' : '🌑'}
                    </div>
                    <div style={{
                      fontSize: '20px',
                      color: '#d4af37',
                      marginBottom: '8px',
                      fontWeight: 'bold',
                    }}>
                      {sharedState?.winnerAlignment === 'COVEN' ? 'The Coven Prevails' : 'Hollow Domination'}
                    </div>
                    <div style={{ color: '#cbd5f5' }}>{sharedState?.winnerReason}</div>
                  </div>
                )}
          <div style={{
            backgroundColor: 'rgba(10, 10, 30, 0.8)',
            border: '2px solid rgba(212, 175, 55, 0.6)',
            borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '20px',
              }}>
                🕯️
              </div>
              <div style={{
                fontSize: '20px',
                color: '#d4af37',
                fontWeight: '600',
                marginBottom: '12px',
              }}>
                The Ritual Begins
              </div>
              <div style={{
                fontSize: '14px',
                color: '#94a3b8',
                lineHeight: '1.6',
              }}>
                The ingredients are being offered to the cauldron.<br />
                Watch the TV to witness the outcome...
              </div>
            </div>
          )}

          {/* REVEAL & OUTCOME PHASES - Watch TV */}
          {(phase === Phase.REVEAL || phase === Phase.OUTCOME) && (
            <div style={{
              backgroundColor: 'rgba(10, 10, 30, 0.8)',
              border: '2px solid rgba(212, 175, 55, 0.6)',
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '20px',
              }}>
                {phase === Phase.REVEAL ? '✨' : '💀'}
              </div>
              <div style={{
                fontSize: '20px',
                color: '#d4af37',
                fontWeight: '600',
                marginBottom: '12px',
              }}>
                {phase === Phase.REVEAL ? 'The Revelation' : 'The Consequences'}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#94a3b8',
              }}>
                Watch the TV screen
              </div>
            </div>
          )}

          {/* COUNCIL PHASE - Voting */}
          {phase === Phase.COUNCIL && (
            <div>
              <div style={{
                fontSize: '16px',
                color: '#94a3b8',
                marginBottom: '16px',
                textAlign: 'center',
              }}>
                Vote to eliminate a coven member
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {players.filter(p => p.id !== playerId).map((player) => (
                  <button
                    key={player.id}
                    onClick={() => onVoteNomination?.(player.id)}
                    disabled={hasVoted}
                    style={{
                      backgroundColor: hasVoted 
                        ? 'rgba(30, 30, 60, 0.5)' 
                        : 'rgba(30, 30, 60, 0.8)',
                      border: '2px solid rgba(212, 175, 55, 0.5)',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: hasVoted ? 'not-allowed' : 'pointer',
                      opacity: hasVoted ? 0.6 : 1,
                      transition: 'all 0.3s',
                    }}
                  >
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#f1f5f9',
                    }}>
                      {player.name}
                    </div>
                  </button>
                ))}
              </div>

              {hasVoted && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  backgroundColor: 'rgba(212, 175, 55, 0.2)',
                  border: '2px solid #d4af37',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontSize: '16px',
                    color: '#d4af37',
                    fontWeight: '600',
                  }}>
                    ✓ Vote Cast
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#94a3b8',
                    marginTop: '4px',
                  }}>
                    Waiting for other players...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
