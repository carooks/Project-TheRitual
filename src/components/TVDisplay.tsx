import React from 'react';
import { Phase, Player, RoundState } from '@/lib/types';
import { ROLES } from '@/lib/roles';

interface TVDisplayProps {
  round: RoundState;
  roomCode: string;
  timer?: number;
  nominated?: Player[];
  currentPlayer?: Player;
}

export function TVDisplay({ round, roomCode, timer, nominated, currentPlayer }: TVDisplayProps) {
  const getPhaseTitle = () => {
    switch (round.phase) {
      case Phase.LOBBY: return '⏳ Waiting in the Coven...';
      case Phase.CHOOSING: return '🎴 The Choosing';
      case Phase.OFFERING: return '🕯️ The Offering';
      case Phase.REVEAL: return '✨ The Revelation';
      case Phase.OUTCOME: return '💀 The Consequences';
      case Phase.COUNCIL: return '⚖️ The Council';
      default: return 'The Ritual';
    }
  };

  const getPhaseDescription = () => {
    switch (round.phase) {
      case Phase.LOBBY: return 'Gathering the coven members...';
      case Phase.CHOOSING: return 'Each witch selects their ingredient';
      case Phase.OFFERING: return 'The ingredients are offered to the cauldron';
      case Phase.REVEAL: return 'The ritual\'s fate is revealed';
      case Phase.OUTCOME: return 'Face the consequences of your choices';
      case Phase.COUNCIL: return 'Deliberate and accuse the guilty';
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
              color: '#d4af37',
              textShadow: '0 0 20px rgba(212, 175, 55, 0.6)',
              marginBottom: '8px',
            }}>
              {getPhaseTitle()}
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#94a3b8',
              fontStyle: 'italic',
            }}>
              {getPhaseDescription()}
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
            }}>
              {round.players.map((player, index) => (
                <div
                  key={player.id}
                  style={{
                    backgroundColor: currentPlayer?.id === player.id 
                      ? 'rgba(212, 175, 55, 0.2)' 
                      : 'rgba(30, 30, 60, 0.5)',
                    border: `2px solid ${currentPlayer?.id === player.id ? '#d4af37' : 'rgba(100, 100, 150, 0.3)'}`,
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.3s',
                    boxShadow: currentPlayer?.id === player.id 
                      ? '0 0 20px rgba(212, 175, 55, 0.4)' 
                      : 'none',
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
                    {currentPlayer?.id === player.id && (
                      <div style={{
                        fontSize: '14px',
                        color: '#d4af37',
                        marginTop: '4px',
                      }}>
                        Currently Acting...
                      </div>
                    )}
                  </div>
                  {nominated && nominated.some(p => p.id === player.id) && (
                    <div style={{
                      backgroundColor: '#dc2626',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                    }}>
                      ⚠️ NOMINATED
                    </div>
                  )}
                </div>
              ))}
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
                {round.id}
              </div>
            </div>

            {/* Timer */}
            {timer !== undefined && timer > 0 && (
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
                  color: timer < 10 ? '#dc2626' : '#14b8a6',
                  textAlign: 'center',
                  textShadow: timer < 10 
                    ? '0 0 30px rgba(220, 38, 38, 0.6)' 
                    : '0 0 30px rgba(20, 184, 166, 0.6)',
                  animation: timer < 10 ? 'pulse 1s infinite' : 'none',
                }}>
                  {timer}
                </div>
              </div>
            )}

            {/* Nominated Players */}
            {nominated && nominated.length > 0 && (
              <div style={{
                backgroundColor: 'rgba(30, 10, 10, 0.7)',
                border: '2px solid rgba(220, 38, 38, 0.5)',
                borderRadius: '16px',
                padding: '24px',
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{
                  fontSize: '20px',
                  color: '#dc2626',
                  marginBottom: '16px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}>
                  ⚖️ On Trial
                </div>
                {nominated.map(player => (
                  <div
                    key={player.id}
                    style={{
                      backgroundColor: 'rgba(220, 38, 38, 0.2)',
                      border: '2px solid #dc2626',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '8px',
                      textAlign: 'center',
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#fff',
                    }}
                  >
                    {player.name}
                  </div>
                ))}
              </div>
            )}

            {/* Phase Instructions */}
            <div style={{
              backgroundColor: 'rgba(10, 10, 30, 0.7)',
              border: '2px solid rgba(100, 100, 150, 0.3)',
              borderRadius: '16px',
              padding: '20px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{
                fontSize: '14px',
                color: '#94a3b8',
                lineHeight: '1.6',
              }}>
                {round.phase === Phase.CHOOSING && '📱 Players: Look at your phones and select an ingredient'}
                {round.phase === Phase.OFFERING && '🕯️ The ingredients are being offered...'}
                {round.phase === Phase.REVEAL && '✨ Witness the outcome of the ritual'}
                {round.phase === Phase.OUTCOME && '💀 The ritual has concluded'}
                {round.phase === Phase.COUNCIL && '⚖️ Discuss and vote on who to eliminate'}
              </div>
            </div>
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
