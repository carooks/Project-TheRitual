import React from 'react';
import { Player, RoleId } from '@/lib/types';
import { ROLES } from '@/lib/roles';
import { INGREDIENTS } from '@/lib/ingredients';

interface PlayerStats {
  playerId: string;
  playerName: string;
  roleId: RoleId;
  survived: boolean;
  totalCorruption: number;
  ingredientsSelected: string[];
  votesReceived: number;
  correctVotes: number; // votes for actual corrupted players
  eliminatedRound?: number;
}

interface GameSummaryProps {
  winner: 'coven' | 'corrupted' | 'draw';
  totalRounds: number;
  playerStats: PlayerStats[];
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export function GameSummary({ 
  winner, 
  totalRounds, 
  playerStats,
  onPlayAgain,
  onBackToMenu 
}: GameSummaryProps) {
  // Calculate fun awards
  const getMostCorruptPlayer = () => {
    return playerStats.reduce((max, p) => 
      p.totalCorruption > max.totalCorruption ? p : max
    );
  };

  const getMostInnocentPlayer = () => {
    return playerStats.reduce((min, p) => 
      p.totalCorruption < min.totalCorruption ? p : min
    );
  };

  const getMostSuspectedPlayer = () => {
    return playerStats.reduce((max, p) => 
      p.votesReceived > max.votesReceived ? p : max
    );
  };

  const getBestDetective = () => {
    return playerStats.reduce((max, p) => 
      p.correctVotes > max.correctVotes ? p : max
    );
  };

  const getSurvivor = () => {
    return playerStats.filter(p => p.survived);
  };

  const getFirstEliminated = () => {
    return playerStats.reduce((first, p) => {
      if (!p.eliminatedRound) return first;
      if (!first.eliminatedRound) return p;
      return p.eliminatedRound < first.eliminatedRound ? p : first;
    }, playerStats[0]);
  };

  const corruptedPlayers = playerStats.filter(p => ROLES[p.roleId].team === 'corrupted');
  const totalCorruption = playerStats.reduce((sum, p) => sum + p.totalCorruption, 0);
  const avgCorruptionPerRound = totalCorruption / totalRounds;

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
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {/* Header - Winner Announcement */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
        }}>
          <div style={{
            fontSize: '72px',
            marginBottom: '16px',
          }}>
            {winner === 'coven' ? '🛡️' : winner === 'corrupted' ? '🔴' : '⚖️'}
          </div>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: winner === 'coven' ? '#14b8a6' : winner === 'corrupted' ? '#dc2626' : '#d4af37',
            textShadow: `0 0 30px ${winner === 'coven' ? 'rgba(20, 184, 166, 0.8)' : winner === 'corrupted' ? 'rgba(220, 38, 38, 0.8)' : 'rgba(212, 175, 55, 0.8)'}`,
            marginBottom: '12px',
          }}>
            {winner === 'coven' ? 'Coven Victorious!' : winner === 'corrupted' ? 'Corruption Prevails!' : 'Stalemate!'}
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#94a3b8',
            fontStyle: 'italic',
          }}>
            {totalRounds} rounds of mystical intrigue
          </p>
        </div>

        {/* Game Stats Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}>
          <StatCard
            icon="🎯"
            label="Total Rounds"
            value={totalRounds.toString()}
          />
          <StatCard
            icon="🧙"
            label="Players"
            value={playerStats.length.toString()}
          />
          <StatCard
            icon="🔴"
            label="Corrupted"
            value={corruptedPlayers.length.toString()}
          />
          <StatCard
            icon="💀"
            label="Avg Corruption/Round"
            value={`${(avgCorruptionPerRound * 100).toFixed(0)}%`}
          />
        </div>

        {/* Awards Section */}
        <div style={{
          backgroundColor: 'rgba(10, 10, 30, 0.8)',
          border: '2px solid rgba(212, 175, 55, 0.6)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          backdropFilter: 'blur(10px)',
        }}>
          <h2 style={{
            fontSize: '32px',
            color: '#d4af37',
            marginBottom: '24px',
            textAlign: 'center',
            textShadow: '0 0 20px rgba(212, 175, 55, 0.6)',
          }}>
            🏆 Awards & Achievements
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            <AwardCard
              icon="💀"
              title="Most Corrupted"
              player={getMostCorruptPlayer()}
              description={`${(getMostCorruptPlayer().totalCorruption * 100).toFixed(0)}% total corruption`}
              color="#dc2626"
            />
            <AwardCard
              icon="✨"
              title="Purest Soul"
              player={getMostInnocentPlayer()}
              description={`Only ${(getMostInnocentPlayer().totalCorruption * 100).toFixed(0)}% corruption`}
              color="#14b8a6"
            />
            <AwardCard
              icon="🎯"
              title="Best Detective"
              player={getBestDetective()}
              description={`${getBestDetective().correctVotes} correct accusations`}
              color="#d4af37"
            />
            <AwardCard
              icon="⚠️"
              title="Most Suspected"
              player={getMostSuspectedPlayer()}
              description={`Received ${getMostSuspectedPlayer().votesReceived} votes`}
              color="#f59e0b"
            />
            {getFirstEliminated().eliminatedRound && (
              <AwardCard
                icon="☠️"
                title="First Blood"
                player={getFirstEliminated()}
                description={`Eliminated Round ${getFirstEliminated().eliminatedRound}`}
                color="#7c3aed"
              />
            )}
            {getSurvivor().length > 0 && (
              <AwardCard
                icon="🛡️"
                title="Survivors"
                player={getSurvivor()[0]}
                description={`${getSurvivor().length} witches survived`}
                color="#10b981"
              />
            )}
          </div>
        </div>

        {/* Player Details */}
        <div style={{
          backgroundColor: 'rgba(10, 10, 30, 0.8)',
          border: '2px solid rgba(212, 175, 55, 0.6)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          backdropFilter: 'blur(10px)',
        }}>
          <h2 style={{
            fontSize: '32px',
            color: '#d4af37',
            marginBottom: '24px',
            textAlign: 'center',
            textShadow: '0 0 20px rgba(212, 175, 55, 0.6)',
          }}>
            🔮 Player Performance
          </h2>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {playerStats
              .sort((a, b) => b.totalCorruption - a.totalCorruption)
              .map((player, index) => {
                const role = ROLES[player.roleId];
                const teamColor = 
                  role.team === 'coven' ? '#14b8a6' :
                  role.team === 'corrupted' ? '#dc2626' :
                  '#94a3b8';

                return (
                  <div
                    key={player.playerId}
                    style={{
                      backgroundColor: 'rgba(30, 30, 60, 0.6)',
                      border: `2px solid ${teamColor}40`,
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px',
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: teamColor + '40',
                      border: `2px solid ${teamColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: teamColor,
                      flexShrink: 0,
                    }}>
                      {index + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px',
                      }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: '600',
                          color: '#f1f5f9',
                        }}>
                          {player.playerName}
                        </div>
                        <div style={{
                          padding: '4px 12px',
                          backgroundColor: teamColor + '30',
                          border: `1px solid ${teamColor}`,
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: teamColor,
                        }}>
                          {role.name}
                        </div>
                        {player.survived && (
                          <div style={{
                            padding: '4px 8px',
                            backgroundColor: 'rgba(16, 185, 129, 0.3)',
                            border: '1px solid #10b981',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#10b981',
                          }}>
                            ✓ Survived
                          </div>
                        )}
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '12px',
                        fontSize: '13px',
                        color: '#94a3b8',
                      }}>
                        <div>
                          💀 Corruption: <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                            {(player.totalCorruption * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div>
                          🎴 Ingredients: <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                            {player.ingredientsSelected.map(id => INGREDIENTS[id]?.icon || '?').join(' ')}
                          </span>
                        </div>
                        <div>
                          ⚖️ Votes Received: <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                            {player.votesReceived}
                          </span>
                        </div>
                        <div>
                          🎯 Correct Votes: <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                            {player.correctVotes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={onPlayAgain}
            style={{
              backgroundColor: '#4c1d95',
              color: '#d4af37',
              border: '2px solid #d4af37',
              borderRadius: '12px',
              padding: '16px 48px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
            }}
          >
            🔄 Play Again
          </button>
          <button
            onClick={onBackToMenu}
            style={{
              backgroundColor: '#1e293b',
              color: '#94a3b8',
              border: '2px solid #334155',
              borderRadius: '12px',
              padding: '16px 48px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            🏠 Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{
      backgroundColor: 'rgba(10, 10, 30, 0.8)',
      border: '2px solid rgba(212, 175, 55, 0.4)',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ fontSize: '36px', marginBottom: '8px' }}>{icon}</div>
      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37' }}>{value}</div>
    </div>
  );
}

function AwardCard({ 
  icon, 
  title, 
  player, 
  description, 
  color 
}: { 
  icon: string; 
  title: string; 
  player: PlayerStats; 
  description: string;
  color: string;
}) {
  return (
    <div style={{
      backgroundColor: `${color}15`,
      border: `2px solid ${color}`,
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{icon}</div>
      <div style={{
        fontSize: '16px',
        fontWeight: 'bold',
        color: color,
        marginBottom: '8px',
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#f1f5f9',
        marginBottom: '4px',
      }}>
        {player.playerName}
      </div>
      <div style={{
        fontSize: '12px',
        color: '#94a3b8',
        fontStyle: 'italic',
      }}>
        {description}
      </div>
    </div>
  );
}
