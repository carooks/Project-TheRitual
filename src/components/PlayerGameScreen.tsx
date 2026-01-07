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
  onShowHelp?: () => void;
  onLeaveGame?: () => void;
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
  onShowHelp,
  onLeaveGame,
}: PlayerGameScreenProps) {
  const [showRole, setShowRole] = useState(false);
  const [phaseTimer, setPhaseTimer] = useState<number | null>(null);
  const [pendingNominationVote, setPendingNominationVote] = useState<string | null>(null);
  const [pendingCouncilVote, setPendingCouncilVote] = useState<string | null>(null);

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
        padding: '16px',
        display: 'flex',
        flexDirection: window.innerWidth >= 768 ? 'row' : 'column',
        gap: '16px',
      }}>
        {/* Role Info Sidebar (Desktop) / Top Panel (Mobile) */}
        {role && showRole && (
          <div style={{
            width: window.innerWidth >= 768 ? '280px' : '100%',
            flexShrink: 0,
            backgroundColor: 'rgba(10, 10, 30, 0.9)',
            border: '2px solid rgba(212, 175, 55, 0.6)',
            borderRadius: '12px',
            padding: '16px',
            backdropFilter: 'blur(10px)',
            maxHeight: window.innerWidth >= 768 ? 'calc(100vh - 32px)' : 'auto',
            overflowY: 'auto',
            position: window.innerWidth >= 768 ? 'sticky' : 'relative',
            top: window.innerWidth >= 768 ? '16px' : 'auto',
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '16px',
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#d4af37',
                marginBottom: '8px',
                textShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
              }}>
                🔮 {role.name}
              </div>
              {role.image && (
                <div style={{
                  width: '100%',
                  marginBottom: '12px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '2px solid #d4af37',
                }}>
                  <img
                    src={role.image}
                    alt={role.name}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
            <div style={{
              padding: '12px',
              backgroundColor: 'rgba(76, 29, 149, 0.3)',
              borderRadius: '8px',
              marginBottom: '12px',
            }}>
              <div style={{ 
                color: '#d4af37', 
                fontWeight: '600', 
                marginBottom: '6px',
                fontSize: '14px',
              }}>
                Your Goal:
              </div>
              <div style={{
                fontSize: '13px',
                color: '#e2e8f0',
                lineHeight: '1.5',
              }}>
                {role.shortDescription}
              </div>
            </div>
            <button
              onClick={() => setShowRole(false)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(76, 29, 149, 0.4)',
                color: '#d4af37',
                border: '2px solid #d4af37',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Hide Role
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{
            backgroundColor: 'rgba(10, 10, 30, 0.8)',
            border: '2px solid rgba(212, 175, 55, 0.6)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}>
              <div style={{ flex: '1 1 auto' }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#d4af37',
                }}>
                  {playerName}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                }}>
                  Round {round}
                </div>
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}>
                {role && (
                  <button
                    onClick={() => setShowRole(!showRole)}
                    style={{
                      backgroundColor: showRole ? '#4c1d95' : 'rgba(76, 29, 149, 0.3)',
                      color: '#d4af37',
                      border: '2px solid #d4af37',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {showRole ? '🔮 Role' : '👁️ Role'}
                  </button>
                )}
                {onShowHelp && (
                  <button
                    onClick={() => {
                      try {
                        onShowHelp()
                      } catch (error) {
                        console.error('Error showing help:', error)
                      }
                    }}
                    style={{
                      backgroundColor: 'rgba(76, 29, 149, 0.3)',
                      color: '#d4af37',
                      border: '2px solid #d4af37',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    ❓
                  </button>
                )}
                {onLeaveGame && (
                  <button
                    onClick={() => {
                      if (confirm('Leave the game? You can rejoin with the same room code.')) {
                        onLeaveGame()
                      }
                    }}
                    style={{
                      backgroundColor: 'rgba(220, 38, 38, 0.3)',
                      color: '#fca5a5',
                      border: '2px solid #dc2626',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    🚪
                  </button>
                )}
                {phaseTimer !== null && phaseTimer >= 0 && (
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: phaseTimer < 10 ? '#dc2626' : '#14b8a6',
                    textShadow: phaseTimer < 10
                      ? '0 0 15px rgba(220, 38, 38, 0.8)'
                      : '0 0 15px rgba(20, 184, 166, 0.8)',
                    minWidth: '60px',
                    textAlign: 'center',
                  }}>
                    {phaseTimer}s
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* Phase Title */}
        <div style={{
          textAlign: 'center',
          marginBottom: '16px',
        }}>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 'bold',
            color: '#d4af37',
            marginBottom: '6px',
            textShadow: '0 0 20px rgba(212, 175, 55, 0.6)',
          }}>
            {descriptor.title}
          </h1>
          <p style={{
            fontSize: '13px',
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
                color: '#e9d5ff',
                textAlign: 'center',
                fontFamily: 'Georgia, serif',
                fontSize: '15px',
              }}>
                Select the witch you want to perform the ritual.
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '10px',
              }}>
                {alivePlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => {
                      if (player.id === playerId || nominationVote) return
                      setPendingNominationVote(player.id)
                    }}
                    style={{
                      background: pendingNominationVote === player.id
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(76, 29, 149, 0.8) 100%)'
                        : nominationVote === player.id
                        ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.4) 0%, rgba(139, 92, 246, 0.6) 100%)'
                        : 'rgba(30, 30, 60, 0.75)',
                      border: `2px solid ${pendingNominationVote === player.id ? '#d4af37' : nominationVote === player.id ? '#a78bfa' : 'rgba(100, 100, 150, 0.4)'}`,
                      borderRadius: '10px',
                      padding: '14px',
                      cursor: (player.id === playerId || nominationVote) ? 'not-allowed' : 'pointer',
                      color: '#f1f5f9',
                      opacity: player.id === playerId ? 0.4 : 1,
                      transition: 'all 0.2s',
                      boxShadow: pendingNominationVote === player.id ? '0 0 20px rgba(212, 175, 55, 0.5)' : 'none',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{player.name}</div>
                    <div style={{
                      marginTop: '6px',
                      fontSize: '12px',
                      color: pendingNominationVote === player.id ? '#d4af37' : nominationVote === player.id ? '#a78bfa' : '#94a3b8',
                    }}>
                      {player.id === playerId ? 'You' : pendingNominationVote === player.id ? 'Selected' : nominationVote === player.id ? 'Locked' : 'Vote' }
                    </div>
                  </button>
                ))}
              </div>
              {pendingNominationVote && !nominationVote && (
                <button
                  onClick={() => {
                    onSubmitNomination?.(pendingNominationVote)
                    setPendingNominationVote(null)
                  }}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                    border: '2px solid #d4af37',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontFamily: 'Georgia, serif',
                    boxShadow: '0 0 25px rgba(139, 92, 246, 0.6)',
                    transition: 'all 0.2s',
                  }}
                >
                  ⚡ Lock In Vote
                </button>
              )}
              {nominationVote && sharedState?.nominationVotes[playerId] && (
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  textAlign: 'center',
                  color: '#a78bfa',
                  background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.3) 0%, rgba(139, 92, 246, 0.2) 100%)',
                  border: '2px solid rgba(212, 175, 55, 0.5)',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontFamily: 'Georgia, serif',
                  boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
                }}>
                  ✓ Vote sealed. Awaiting the rest of the coven...
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
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '10px',
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
                      padding: '12px',
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
                      fontSize: '10px',
                      fontWeight: '600',
                      color: ingredient.corruptionValue < 0 ? '#4ade80' : ingredient.corruptionValue > 0.1 ? '#f87171' : '#fbbf24',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      {ingredient.corruptionValue < 0 ? '✓ Helpful' : ingredient.corruptionValue > 0.1 ? '⚠ Harmful' : '○ Neutral'}
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
                  🔴 Corrupted Witch Network
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#fca5a5',
                  marginBottom: '12px',
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}>
                  Only you can see this channel. Coordinate through corruption values.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {corruptedSelections.map(({ player, ingredient }) => (
                    <div
                      key={player.id}
                      style={{
                        backgroundColor: 'rgba(20, 10, 10, 0.6)',
                        border: '1px solid rgba(220, 38, 38, 0.5)',
                        borderRadius: '8px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div style={{ fontSize: '24px' }}>{ingredient?.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
                          {player.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {ingredient?.name}
                        </div>
                      </div>
                      <div style={{
                        backgroundColor: ingredient && ingredient.corruptionValue > 0.15
                          ? 'rgba(220, 38, 38, 0.3)'
                          : 'rgba(100, 100, 100, 0.3)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: ingredient && ingredient.corruptionValue > 0.15 ? '#fca5a5' : '#94a3b8',
                      }}>
                        {ingredient && ingredient.corruptionValue > 0.15 ? '🗡️ KILL' : '💀 Save'}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{
                  marginTop: '12px',
                  padding: '8px',
                  backgroundColor: 'rgba(220, 38, 38, 0.15)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: '#fca5a5',
                  textAlign: 'center',
                }}>
                  💡 High corruption (&gt;15%) = Kill vote | Low corruption = Save vote
                </div>
              </div>
            )}

            {/* PASSIVE PHASE STATES */}
            {(phase === Phase.NOMINATION_DISCUSSION || phase === Phase.NOMINATION_REVEAL || phase === Phase.RITUAL_RESOLUTION) && (
              <div style={{
                padding: '40px 20px',
                borderRadius: '12px',
                border: '2px solid rgba(212, 175, 55, 0.6)',
                background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.4) 0%, rgba(30, 30, 60, 0.6) 100%)',
                textAlign: 'center',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>{descriptor.icon}</div>
                <div style={{ 
                  color: '#e9d5ff',
                  fontFamily: 'Georgia, serif',
                  fontSize: '15px',
                }}>
                  Watch the host display. No action required on your phone yet.
                </div>
              </div>
            )}

                {/* PERFORMER POWER */}
                {phase === Phase.PERFORMER_POWER && (
                  <div>
                    {canUsePower ? (
                      <div>
                        {(() => {
                          const powerType = pendingPower?.type
                          
                          // Auto-applied powers (no target selection needed)
                          if (powerType === 'DOUBLE_VOTE' || powerType === 'CHAOS_SPREAD' || powerType === 'AMPLIFY_CHAOS') {
                            const powerMessages = {
                              DOUBLE_VOTE: {
                                title: '⚖️ Double Vote Power',
                                desc: 'Your next council vote will count TWICE. Use it wisely to banish corruption!'
                              },
                              CHAOS_SPREAD: {
                                title: '🌀 Chaos Spread',
                                desc: 'You channel the Hollow\'s power. Your presence corrupts the next ritual...'
                              },
                              AMPLIFY_CHAOS: {
                                title: '⚡ Chaos Amplifier',
                                desc: 'Your power intensifies—the next ritual will be EXTREME (no middle ground).'
                              }
                            }
                            const msg = powerMessages[powerType]
                            
                            return (
                              <div style={{
                                padding: '24px',
                                borderRadius: '12px',
                                border: '2px solid #d4af37',
                                background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.6) 0%, rgba(30, 30, 60, 0.8) 100%)',
                                textAlign: 'center',
                                boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)',
                              }}>
                                <div style={{
                                  fontSize: '20px',
                                  fontWeight: '600',
                                  color: '#d4af37',
                                  marginBottom: '12px',
                                  fontFamily: 'Georgia, serif',
                                }}>
                                  {msg?.title}
                                </div>
                                <div style={{
                                  fontSize: '15px',
                                  color: '#e9d5ff',
                                  fontFamily: 'Georgia, serif',
                                }}>
                                  {msg?.desc}
                                </div>
                              </div>
                            )
                          }

                          // Targeted powers
                          const powerInstructions = {
                            ALIGNMENT_REVEAL: '✨ The ritual grants you insight. Select a target to reveal their alignment.',
                            PROTECT_PLAYER: '🛡️ Your protective wards overflow. Choose someone to shield from the next death.',
                            STEAL_VISION: '👁️ Your power mirrors another\'s sight. Choose whose visions to steal.'
                          }
                          const instruction = powerInstructions[powerType as keyof typeof powerInstructions] || 'Select a target for your power.'

                          return (
                            <>
                              <div style={{
                                marginBottom: '16px',
                                textAlign: 'center',
                                color: '#e9d5ff',
                                fontFamily: 'Georgia, serif',
                                fontSize: '15px',
                              }}>
                                {instruction}
                              </div>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                gap: '12px',
                              }}>
                                {pendingPower?.availableTargets.map((targetId) => {
                                  const target = sharedState?.players[targetId];
                                  if (!target) return null;
                                  
                                  const buttonLabels = {
                                    ALIGNMENT_REVEAL: '🔮 Reveal alignment',
                                    PROTECT_PLAYER: '🛡️ Protect',
                                    STEAL_VISION: '👁️ Steal visions'
                                  }
                                  const label = buttonLabels[powerType as keyof typeof buttonLabels] || '✨ Use power'

                                  return (
                                    <button
                                      key={targetId}
                                      onClick={() => onSubmitPower?.(targetId)}
                                      style={{
                                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(76, 29, 149, 0.6) 100%)',
                                        border: '2px solid rgba(212, 175, 55, 0.5)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        color: '#f3e8ff',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s',
                                        boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
                                      }}
                                    >
                                      <div style={{ fontWeight: 600 }}>{target.name}</div>
                                      <div style={{ fontSize: '12px', color: '#d4af37', marginTop: '6px' }}>
                                        {label}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    ) : pendingPower?.used && pendingPower?.revealedAlignment ? (
                      <div style={{
                        padding: '24px',
                        borderRadius: '12px',
                        border: '2px solid #d4af37',
                        background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.6) 0%, rgba(30, 30, 60, 0.8) 100%)',
                        textAlign: 'center',
                        boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)',
                      }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#d4af37',
                          marginBottom: '12px',
                          fontFamily: 'Georgia, serif',
                        }}>
                          ✨ Vision Received
                        </div>
                        <div style={{
                          fontSize: '16px',
                          color: '#e9d5ff',
                          marginBottom: '8px',
                        }}>
                          {sharedState?.players[pendingPower.targetId!]?.name} is aligned with:
                        </div>
                        <div style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: pendingPower.revealedAlignment === 'COVEN' ? '#4ade80' : '#f87171',
                          marginTop: '8px',
                          fontFamily: 'Georgia, serif',
                        }}>
                          {pendingPower.revealedAlignment === 'COVEN' ? '🌟 THE COVEN' : '💀 THE HOLLOW'}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        padding: '32px',
                        borderRadius: '12px',
                        border: '2px solid rgba(212, 175, 55, 0.3)',
                        background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.3) 0%, rgba(30, 30, 60, 0.6) 100%)',
                        textAlign: 'center',
                        color: '#cbd5f5',
                        fontFamily: 'Georgia, serif',
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
                      color: '#e9d5ff',
                      marginBottom: '16px',
                      textAlign: 'center',
                      fontFamily: 'Georgia, serif',
                    }}>
                      The Council must decide who burns
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
                            onClick={() => {
                              if (councilVote) return
                              setPendingCouncilVote(player.id)
                            }}
                            style={{
                              background: pendingCouncilVote === player.id
                                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(76, 29, 149, 0.8) 100%)'
                                : councilVote === player.id
                                ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.4) 0%, rgba(139, 92, 246, 0.6) 100%)'
                                : 'rgba(30, 30, 60, 0.8)',
                              border: `2px solid ${pendingCouncilVote === player.id ? '#d4af37' : councilVote === player.id ? '#a78bfa' : 'rgba(212, 175, 55, 0.5)'}`,
                              borderRadius: '12px',
                              padding: '16px',
                              cursor: councilVote ? 'not-allowed' : 'pointer',
                              transition: 'all 0.3s',
                              boxShadow: pendingCouncilVote === player.id ? '0 0 20px rgba(212, 175, 55, 0.5)' : 'none',
                            }}
                          >
                            <div style={{
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#f1f5f9',
                            }}>
                              {player.name}
                            </div>
                            {(pendingCouncilVote === player.id || councilVote === player.id) && (
                              <div style={{
                                fontSize: '13px',
                                color: pendingCouncilVote === player.id ? '#d4af37' : '#a78bfa',
                                marginTop: '4px',
                              }}>
                                {pendingCouncilVote === player.id ? 'Selected' : '✓ Locked'}
                              </div>
                            )}
                          </button>
                        ))}
                      <button
                        onClick={() => {
                          if (councilVote) return
                          setPendingCouncilVote('SKIP')
                        }}
                        style={{
                          background: pendingCouncilVote === 'SKIP'
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(76, 29, 149, 0.8) 100%)'
                            : councilVote === 'SKIP'
                            ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.4) 0%, rgba(139, 92, 246, 0.6) 100%)'
                            : 'rgba(30, 30, 60, 0.6)',
                          border: `2px solid ${pendingCouncilVote === 'SKIP' ? '#d4af37' : councilVote === 'SKIP' ? '#a78bfa' : 'rgba(148, 163, 184, 0.5)'}`,
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: councilVote ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s',
                          boxShadow: pendingCouncilVote === 'SKIP' ? '0 0 20px rgba(212, 175, 55, 0.5)' : 'none',
                        }}
                      >
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          color: '#94a3b8',
                        }}>
                          Skip Vote
                        </div>
                        {(pendingCouncilVote === 'SKIP' || councilVote === 'SKIP') && (
                          <div style={{
                            fontSize: '13px',
                            color: pendingCouncilVote === 'SKIP' ? '#d4af37' : '#a78bfa',
                            marginTop: '4px',
                          }}>
                            {pendingCouncilVote === 'SKIP' ? 'Selected' : '✓ Locked'}
                          </div>
                        )}
                      </button>
                    </div>
                    {pendingCouncilVote && !councilVote && (
                      <button
                        onClick={() => {
                          onSubmitCouncil?.(pendingCouncilVote)
                          setPendingCouncilVote(null)
                        }}
                        style={{
                          width: '100%',
                          marginTop: '16px',
                          padding: '16px',
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                          border: '2px solid #d4af37',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontFamily: 'Georgia, serif',
                          boxShadow: '0 0 25px rgba(139, 92, 246, 0.6)',
                          transition: 'all 0.2s',
                        }}
                      >
                        🔥 Seal the Verdict
                      </button>
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
          </div>
        </div>
      </div>
    </div>
  );
}
