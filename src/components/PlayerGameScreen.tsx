import React, { useState } from 'react';
import { Phase, Player, Ingredient } from '@/lib/types';
import { INGREDIENTS } from '@/lib/ingredients';
import { ROLES } from '@/lib/roles';

interface PlayerGameScreenProps {
  playerId: string;
  playerName: string;
  players: Player[];
  phase: Phase;
  round: number;
  roleId?: string;
  timer?: number;
  onSelectIngredient?: (ingredientId: string) => void;
  onVoteNomination?: (playerId: string) => void;
  onReady?: () => void;
  selectedIngredient?: string;
  hasVoted?: boolean;
  isReady?: boolean;
  allPlayerSelections?: Record<string, string>; // playerId -> ingredientId
}

export function PlayerGameScreen({
  playerId,
  playerName,
  players,
  phase,
  round,
  roleId,
  timer,
  onSelectIngredient,
  onVoteNomination,
  onReady,
  selectedIngredient,
  hasVoted,
  isReady,
  allPlayerSelections,
}: PlayerGameScreenProps) {
  const [showRole, setShowRole] = useState(false);
  
  const currentPlayer = players.find(p => p.id === playerId);
  const role = roleId ? ROLES[roleId as RoleId] : null;
  const isCorrupted = role?.team === 'corrupted';
  
  // Get other corrupted witches and their selections
  const corruptedPlayers = players.filter(p => {
    const playerRole = ROLES[p.roleId];
    return playerRole?.team === 'corrupted' && p.id !== playerId;
  });
  
  const corruptedSelections = isCorrupted && allPlayerSelections 
    ? corruptedPlayers.map(p => ({
        player: p,
        ingredientId: allPlayerSelections[p.id],
        ingredient: allPlayerSelections[p.id] ? INGREDIENTS[allPlayerSelections[p.id]] : null
      })).filter(s => s.ingredientId)
    : [];

  const getPhaseTitle = () => {
    switch (phase) {
      case Phase.CHOOSING: return '🎴 Select Your Ingredient';
      case Phase.OFFERING: return '🕯️ The Offering';
      case Phase.REVEAL: return '✨ The Revelation';
      case Phase.OUTCOME: return '💀 The Consequences';
      case Phase.COUNCIL: return '⚖️ Vote to Eliminate';
      default: return 'The Ritual';
    }
  };

  const getPhaseInstruction = () => {
    switch (phase) {
      case Phase.CHOOSING: return 'Choose wisely - your selection shapes the ritual';
      case Phase.OFFERING: return 'The ingredients are being offered to the cauldron...';
      case Phase.REVEAL: return 'Watch the TV to see the ritual unfold';
      case Phase.OUTCOME: return 'Witness the consequences of your collective choices';
      case Phase.COUNCIL: return 'Discuss and vote on who to eliminate from the coven';
      default: return '';
    }
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
            {timer !== undefined && timer > 0 && (
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: timer < 10 ? '#dc2626' : '#14b8a6',
                textShadow: timer < 10 
                  ? '0 0 15px rgba(220, 38, 38, 0.8)' 
                  : '0 0 15px rgba(20, 184, 166, 0.8)',
              }}>
                {timer}s
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
              {role.description}
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
            {getPhaseTitle()}
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#94a3b8',
            fontStyle: 'italic',
          }}>
            {getPhaseInstruction()}
          </p>
        </div>

        {/* Phase-Specific Content */}
        <div style={{ flex: 1 }}>
          {/* CHOOSING PHASE - Ingredient Selection */}
          {phase === Phase.CHOOSING && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '12px',
            }}>
              {Object.values(INGREDIENTS).map((ingredient) => (
                <button
                  key={ingredient.id}
                  onClick={() => onSelectIngredient?.(ingredient.id)}
                  disabled={!!selectedIngredient}
                  style={{
                    backgroundColor: selectedIngredient === ingredient.id 
                      ? '#4c1d95' 
                      : 'rgba(30, 30, 60, 0.7)',
                    border: `2px solid ${selectedIngredient === ingredient.id ? '#d4af37' : 'rgba(100, 100, 150, 0.5)'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: selectedIngredient ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    opacity: selectedIngredient && selectedIngredient !== ingredient.id ? 0.5 : 1,
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
                    {ingredient.flavor}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedIngredient && phase === Phase.CHOOSING && (
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
                ✓ Ingredient Selected
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

          {/* Corrupted Witch Coordination - Show other corrupted witches' selections */}
          {isCorrupted && selectedIngredient && phase === Phase.CHOOSING && corruptedSelections.length > 0 && (
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
                Only you can see this - coordinate through ingredient corruption values
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {corruptedSelections.map(({ player, ingredient }) => (
                  <div
                    key={player.id}
                    style={{
                      backgroundColor: 'rgba(20, 10, 10, 0.6)',
                      border: '1px solid rgba(220, 38, 38, 0.5)',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}>
                      <div style={{ fontSize: '24px' }}>
                        {ingredient?.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#f1f5f9',
                        }}>
                          {player.name}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#94a3b8',
                        }}>
                          {ingredient?.name}
                        </div>
                      </div>
                      <div style={{
                        backgroundColor: ingredient && ingredient.corruptionValue > 0.15 
                          ? 'rgba(220, 38, 38, 0.4)' 
                          : 'rgba(100, 100, 100, 0.4)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: ingredient && ingredient.corruptionValue > 0.15 
                          ? '#fca5a5' 
                          : '#94a3b8',
                      }}>
                        {ingredient && ingredient.corruptionValue > 0.15 ? '🗡️ KILL' : '💀 Save'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: '12px',
                padding: '8px',
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#fca5a5',
                textAlign: 'center',
              }}>
                💡 High corruption (>15%) = Kill vote | Low corruption = Save vote
              </div>
            </div>
          )}

          {/* OFFERING PHASE - Waiting */}
          {phase === Phase.OFFERING && (
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
