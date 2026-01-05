import { useState, useEffect, useCallback } from 'react';
import { BattleCanvas } from './BattleCanvasPixi';
import { useBattleSync } from '../hooks/useBattleSync';

const COLOR_PALETTE = [
  '#dc2626', '#ef4444', '#f97316', '#f59e0b', '#fbbf24', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a78bfa', '#7c3aed', '#f43f5e',
  '#be123c', '#991b1b', '#78716c', '#64748b', '#cbd5e1', '#65a30d',
];

const FACTIONS = [
  // Base Game
  { name: 'The Arborec', color: '#22c55e' },
  { name: 'The Barony of Letnev', color: '#dc2626' },
  { name: 'The Clan of Saar', color: '#f59e0b' },
  { name: 'The Embers of Muaat', color: '#f97316' },
  { name: 'The Emirates of Hacan', color: '#fbbf24' },
  { name: 'The Federation of Sol', color: '#3b82f6' },
  { name: 'The Ghosts of Creuss', color: '#8b5cf6' },
  { name: 'The L1Z1X Mindnet', color: '#64748b' },
  { name: 'The Mentak Coalition', color: '#f43f5e' },
  { name: 'The Naalu Collective', color: '#84cc16' },
  { name: 'The Nekro Virus', color: '#7c3aed' },
  { name: 'Sardakk N\'orr', color: '#ef4444' },
  { name: 'The Universities of Jol-Nar', color: '#06b6d4' },
  { name: 'The Winnu', color: '#eab308' },
  { name: 'The Xxcha Kingdom', color: '#10b981' },
  { name: 'The Yin Brotherhood', color: '#6366f1' },
  { name: 'The Yssaril Tribes', color: '#14b8a6' },
  // PoK Expansion
  { name: 'The Argent Flight', color: '#cbd5e1' },
  { name: 'The Empyrean', color: '#a78bfa' },
  { name: 'The Mahact Gene-Sorcerers', color: '#be123c' },
  { name: 'The Naaz-Rokha Alliance', color: '#65a30d' },
  { name: 'The Nomad', color: '#78716c' },
  { name: 'The Titans of Ul', color: '#0ea5e9' },
  { name: 'The Vuil\'raith Cabal', color: '#991b1b' },
  // Discordant Stars
  { name: 'The Augurs of Ilyxum', color: '#8b5cf6' },
  { name: 'The Bentor Conglomerate', color: '#f59e0b' },
  { name: 'The Berserkers of Kjalengard', color: '#dc2626' },
  { name: 'The Celdauri Trade Confederation', color: '#fbbf24' },
  { name: 'The Cheiran Hordes', color: '#ef4444' },
  { name: 'The Collegium of Science', color: '#06b6d4' },
  { name: 'The Dih-Mohn Flotilla', color: '#64748b' },
  { name: 'The Edyn Mandate', color: '#10b981' },
  { name: 'The Florzen Profiteers', color: '#84cc16' },
  { name: 'The Free Systems Pact', color: '#cbd5e1' },
  { name: 'The Ghemina Raiders', color: '#f43f5e' },
  { name: 'The Ghoti Wayfarers', color: '#0ea5e9' },
  { name: 'The Gledge Union', color: '#eab308' },
  { name: 'The Glimmer of Mortheus', color: '#a78bfa' },
  { name: 'The Kortali Tribunal', color: '#78716c' },
  { name: 'The Kyro Sodality', color: '#14b8a6' },
  { name: 'The L\'tokk Khrask', color: '#991b1b' },
  { name: 'The Li-Zho Dynasty', color: '#be123c' },
  { name: 'The Mirveda Protectorate', color: '#22c55e' },
  { name: 'The Monks of Kolume', color: '#6366f1' },
  { name: 'The Myko-Mentori', color: '#65a30d' },
  { name: 'The Nivyn Star Kings', color: '#7c3aed' },
  { name: 'The Olradin League', color: '#3b82f6' },
  { name: 'The Roh\'Dhna Mechatronics', color: '#f97316' },
  { name: 'The Savages of Cymiae', color: '#f59e0b' },
  { name: 'The Shipwrights of Axis', color: '#64748b' },
  { name: 'The Tnelis Syndicate', color: '#fbbf24' },
  { name: 'The Vaden Banking Clans', color: '#10b981' },
  { name: 'The Vaylerian Scourge', color: '#dc2626' },
  { name: 'The Zelian Purifier', color: '#8b5cf6' },
];

interface PlayerViewProps {
  roomCode: string;
  roomId: string | null;
  playerId: string;
  playerName: string;
  room: any;
  selectFaction: (faction: string, color: string, playerIdOverride?: string) => Promise<void>;
  toggleReady: (playerIdOverride?: string, forceReady?: boolean) => Promise<void>;
  sendAction: (action: string, data?: any) => Promise<void>;
  isConnected: boolean;
  onLeave: () => void;
}

export function PlayerView({ roomCode, roomId, playerId, playerName, room, selectFaction, toggleReady, sendAction, isConnected, onLeave }: PlayerViewProps) {
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  // Game state hooks - must be declared at top level
  const [showRules, setShowRules] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showQuickRef, setShowQuickRef] = useState(false);
  const [planets, setPlanets] = useState<{name: string, resources: number, influence: number}[]>([]);
  const [newPlanet, setNewPlanet] = useState({ name: '', resources: 0, influence: 0 });

  const [battleState, setBattleState] = useState<any>(null);
  const handleBattleUpdate = useCallback((state: any) => {
    setBattleState(state);
  }, []);

  const battleSync = useBattleSync({
    roomId,
    onBattleUpdate: handleBattleUpdate,
    enabled: Boolean(roomId),
  });

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    (async () => {
      const existing = await battleSync.loadBattle();
      if (!cancelled && existing) setBattleState(existing);
    })();
    return () => {
      cancelled = true;
    };
  }, [roomId, battleSync]);

  const currentPlayer = room?.players.find((p: any) => p.id === playerId);
  const isMyTurn = gameState?.activePlayerId === playerId;
  const speakerName = (() => {
    const sid = gameState?.speakerPlayerId;
    if (!sid) return null;
    const sp = gameState?.players?.find((p: any) => p.id === sid);
    return sp?.name || null;
  })();

  // Debug logging
  useEffect(() => {
    console.log('PlayerView state check:', {
      playerId,
      roomPlayers: room?.players,
      currentPlayer,
      isReady: currentPlayer?.isReady,
      gameState: gameState ? 'exists' : 'null'
    });
  }, [playerId, room?.players, currentPlayer, gameState]);

  // Reset confirming state when player becomes ready
  useEffect(() => {
    if (currentPlayer?.isReady && isConfirming) {
      console.log('Player is now ready, resetting isConfirming state');
      setIsConfirming(false);
    }
  }, [currentPlayer?.isReady, isConfirming]);

  // Listen for game state updates
  useEffect(() => {
    const handleGameStateUpdate = (event: any) => {
      setGameState(event.detail);
    };

    window.addEventListener('gameStateUpdate', handleGameStateUpdate);
    return () => window.removeEventListener('gameStateUpdate', handleGameStateUpdate);
  }, []);

  useEffect(() => {
    if (isMyTurn && !showNotification) {
      setShowNotification(true);
      
      // Request notification permission if not granted
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Your Turn!', {
          body: `It's your turn in Twilight Imperium`,
          icon: '/vite.svg',
        });
      }
      
      // Vibrate if supported
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      
      setTimeout(() => setShowNotification(false), 5000);
    }
  }, [isMyTurn, showNotification]);

  const handleSelectFaction = async (faction: string, color: string) => {
    console.log('Faction selected:', faction, 'Color:', color);
    setSelectedFaction(faction);
    setSelectedColor(color);
  };

  const handleConfirmSelection = async () => {
    console.log('Confirm button clicked!');
    console.log('Selected faction:', selectedFaction);
    console.log('Selected color:', selectedColor);
    console.log('Player ID:', playerId);
    
    if (selectedFaction && selectedColor) {
      setIsConfirming(true);
      try {
        console.log('Calling selectFaction...');
        await selectFaction(selectedFaction, selectedColor, playerId);
        console.log('selectFaction completed, calling toggleReady with forceReady=true...');
        await toggleReady(playerId, true);
        console.log('toggleReady completed! Player should now be ready.');
        // Don't reset isConfirming here - keep button disabled since player is now ready
      } catch (error) {
        console.error('Error in handleConfirmSelection:', error);
        alert('Failed to confirm selection. Please try again.');
        setIsConfirming(false); // Only reset on error
      }
    } else {
      console.log('Missing faction or color!');
      alert('Please select both a faction and color first.');
    }
  };

  const handleEndTurn = () => {
    sendAction('END_TURN');
  };

  // Not selected faction yet
  if (!currentPlayer?.isReady) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#050814',
        padding: '16px',
        paddingTop: 'calc(16px + env(safe-area-inset-top))',
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#0b1020',
          borderRadius: '12px',
          border: '2px solid #14b8a6',
        }}>
          <div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#14b8a6',
              marginBottom: '4px',
            }}>
              Select Your Faction
            </h1>
            <p style={{ color: '#64748b', fontSize: '12px' }}>
              Room: {roomCode} • {playerName}
            </p>
          </div>
          <button
            onClick={onLeave}
            style={{
              backgroundColor: '#1e293b',
              color: '#94a3b8',
              border: '2px solid #334155',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Leave
          </button>
        </div>

        {/* Faction Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px',
        }}>
          {FACTIONS.map((faction) => {
            const isSelected = selectedFaction === faction.name;
            const isTaken = room?.players.some((p: any) => p.faction === faction.name && p.id !== playerId);
            
            return (
              <button
                key={faction.name}
                onClick={() => !isTaken && handleSelectFaction(faction.name, faction.color)}
                onTouchEnd={(e) => {
                  if (!isTaken) {
                    e.preventDefault();
                    handleSelectFaction(faction.name, faction.color);
                  }
                }}
                disabled={isTaken}
                style={{
                  backgroundColor: isSelected ? '#111827' : '#0b1020',
                  border: `3px solid ${isSelected ? faction.color : isTaken ? '#334155' : '#334155'}`,
                  borderRadius: '12px',
                  padding: '16px 12px',
                  cursor: isTaken ? 'not-allowed' : 'pointer',
                  opacity: isTaken ? 0.4 : 1,
                  transition: 'all 0.2s',
                  textAlign: 'center',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: faction.color,
                  margin: '0 auto 8px',
                  border: '2px solid #fff',
                }} />
                <div style={{
                  color: isSelected ? faction.color : '#f1f5f9',
                  fontSize: '13px',
                  fontWeight: isSelected ? '600' : '400',
                  lineHeight: '1.3',
                }}>
                  {faction.name}
                </div>
                {isTaken && (
                  <div style={{
                    color: '#64748b',
                    fontSize: '10px',
                    marginTop: '4px',
                  }}>
                    Taken
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedFaction && (
          <div style={{
            position: 'fixed',
            bottom: 'calc(16px + env(safe-area-inset-bottom))',
            left: '16px',
            right: '16px',
            backgroundColor: '#0b1020',
            border: `3px solid ${selectedColor}`,
            borderRadius: '12px',
            padding: '16px',
            boxShadow: `0 0 30px ${selectedColor}60`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '8px',
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: selectedColor || '#fbbf24',
                border: '2px solid #fff',
              }} />
              <div style={{ flex: 1 }}>
                <p style={{
                  color: selectedColor || '#fbbf24',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '2px',
                }}>
                  {selectedFaction}
                </p>
                <p style={{
                  color: '#64748b',
                  fontSize: '11px',
                }}>
                  {currentPlayer?.isReady ? 'Ready! Waiting for others...' : 'Tap Confirm when ready'}
                </p>
              </div>
              <button
                onClick={() => setShowColorPicker(true)}
                disabled={currentPlayer?.isReady}
                style={{
                  backgroundColor: '#111827',
                  color: '#fbbf24',
                  border: '2px solid #fbbf24',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: currentPlayer?.isReady ? 'not-allowed' : 'pointer',
                  opacity: currentPlayer?.isReady ? 0.5 : 1,
                  marginRight: '8px',
                  minHeight: '48px',
                  minWidth: '48px',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                🎨
              </button>
              {!currentPlayer?.isReady && (
                <button
                  onClick={handleConfirmSelection}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleConfirmSelection();
                  }}
                  disabled={isConfirming}
                  style={{
                    backgroundColor: isConfirming ? '#6b7280' : '#10b981',
                    color: 'white',
                    border: `2px solid ${isConfirming ? '#6b7280' : '#10b981'}`,
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isConfirming ? 'not-allowed' : 'pointer',
                    minHeight: '48px',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    opacity: isConfirming ? 0.7 : 1,
                  }}
                >
                  {isConfirming ? '⏳ Confirming...' : '✓ Confirm'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Color Picker Modal */}
        {showColorPicker && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20000,
          }} onClick={() => setShowColorPicker(false)}>
            <div style={{
              backgroundColor: '#0b1020',
              border: '2px solid #fbbf24',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
            }} onClick={(e) => e.stopPropagation()}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#fbbf24',
                marginBottom: '16px',
                textAlign: 'center',
              }}>
                Choose Your Color
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '12px',
                marginBottom: '16px',
              }}>
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      if (selectedFaction) {
                        selectFaction(selectedFaction, color);
                      }
                      setShowColorPicker(false);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      setSelectedColor(color);
                      if (selectedFaction) {
                        selectFaction(selectedFaction, color);
                      }
                      setShowColorPicker(false);
                    }}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: `3px solid ${selectedColor === color ? '#fff' : '#334155'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: selectedColor === color ? `0 0 12px ${color}` : 'none',
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  />
                ))}
              </div>
              <button
                onClick={() => setShowColorPicker(false)}
                style={{
                  width: '100%',
                  backgroundColor: '#1e293b',
                  color: '#94a3b8',
                  border: '2px solid #334155',
                  borderRadius: '8px',
                  padding: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Ready but waiting for game to start
  if (!gameState) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#050814',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          backgroundColor: '#0b1020',
          border: '2px solid #14b8a6',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '400px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '24px',
            animation: 'pulse 2s infinite',
          }}>
            ✓
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#14b8a6',
            marginBottom: '12px',
          }}>
            Ready!
          </h2>
          <p style={{
            color: '#94a3b8',
            fontSize: '14px',
            marginBottom: '8px',
          }}>
            You selected: {currentPlayer?.faction}
          </p>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: currentPlayer?.color || '#64748b',
            margin: '0 auto 24px',
            border: '3px solid #f1f5f9',
          }} />
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            marginBottom: '16px',
          }}>
            Waiting for host to start the game...
          </p>
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#14b8a6',
              animation: 'bounce 1s infinite',
              animationDelay: '0s',
            }} />
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#14b8a6',
              animation: 'bounce 1s infinite',
              animationDelay: '0.2s',
            }} />
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#14b8a6',
              animation: 'bounce 1s infinite',
              animationDelay: '0.4s',
            }} />
          </div>
          <p style={{
            color: '#64748b',
            fontSize: '12px',
            marginTop: '24px',
          }}>
            Room: {roomCode}
          </p>
          <button
            onClick={onLeave}
            style={{
              backgroundColor: '#1e293b',
              color: '#94a3b8',
              border: '2px solid #334155',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: 'pointer',
              marginTop: '16px',
            }}
          >
            Leave Room
          </button>
        </div>
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
      </div>
    );
  }

  // Game in progress
  const playerGameState = gameState?.players?.find((p: any) => p.id === playerId);
  const totalResources = planets.reduce((sum, p) => sum + p.resources, 0);
  const totalInfluence = planets.reduce((sum, p) => sum + p.influence, 0);

  const handleAddPlanet = () => {
    if (newPlanet.name) {
      setPlanets([...planets, newPlanet]);
      setNewPlanet({ name: '', resources: 0, influence: 0 });
    }
  };

  const handleRemovePlanet = (index: number) => {
    setPlanets(planets.filter((_, i) => i !== index));
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#050814',
      padding: '16px',
      paddingTop: 'calc(16px + env(safe-area-inset-top))',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom))', // Space for bottom nav
    }}>
      {/* Turn Notification */}
      {showNotification && isMyTurn && (
        <div style={{
          position: 'fixed',
          top: 'calc(16px + env(safe-area-inset-top))',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#fbbf24',
          color: '#050814',
          padding: '16px 32px',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 'bold',
          zIndex: 10000,
          boxShadow: '0 8px 24px rgba(251, 191, 36, 0.5)',
          animation: 'pulse 1s infinite',
        }}>
          🔔 It's Your Turn!
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        padding: '12px',
        backgroundColor: '#0b1020',
        borderRadius: '12px',
        border: `2px solid ${currentPlayer?.color || '#334155'}`,
      }}>
        <div>
          <h1 style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: (currentPlayer?.color as string) || '#fbbf24',
            marginBottom: '2px',
          }}>
            {currentPlayer?.faction}
          </h1>
          <p style={{ color: '#64748b', fontSize: '11px' }}>
            {playerName} • Round {gameState?.currentRound || 1} • {gameState?.currentPhase || 'Strategy'}{speakerName ? ` • Speaker: ${speakerName}` : ''}
          </p>
        </div>
        <button
          onClick={onLeave}
          style={{
            backgroundColor: '#1e293b',
            color: '#94a3b8',
            border: '2px solid #334155',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Leave
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        marginBottom: '16px',
      }}>
        <div style={{
          backgroundColor: '#0b1020',
          border: '2px solid #fbbf24',
          borderRadius: '8px',
          padding: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fbbf24' }}>
            {playerGameState?.victoryPoints || 0}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '10px' }}>VP</div>
        </div>

        <div style={{
          backgroundColor: '#0b1020',
          border: '2px solid #22c55e',
          borderRadius: '8px',
          padding: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>
            {totalResources}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '10px' }}>Resources</div>
        </div>

        <div style={{
          backgroundColor: '#0b1020',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          padding: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>
            {totalInfluence}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '10px' }}>Influence</div>
        </div>

        <div style={{
          backgroundColor: '#0b1020',
          border: '2px solid #8b5cf6',
          borderRadius: '8px',
          padding: '8px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8b5cf6' }}>
            {playerGameState?.totalTurns || 0}
          </div>
          <div style={{ color: '#94a3b8', fontSize: '10px' }}>Turns</div>
        </div>
      </div>

      {/* Battle Visuals (read-only) */}
      {battleState && battleState.attackerFleet && battleState.defenderFleet && (
        <div style={{
          backgroundColor: '#0b1020',
          borderRadius: '12px',
          border: '2px solid rgba(251, 191, 36, 0.35)',
          padding: '12px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '14px' }}>Combat Visuals</div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>{battleState.currentStep || 'combat'} • Round {battleState.currentRound ?? 1}</div>
          </div>

          <BattleCanvas
            attackerFleet={battleState.attackerFleet}
            defenderFleet={battleState.defenderFleet}
            attackerColor={room?.players?.find((p: any) => p.id === battleState.attackerId)?.color || '#ff6ec7'}
            defenderColor={room?.players?.find((p: any) => p.id === battleState.defenderId)?.color || '#b8b8ff'}
            attackerRolls={battleState.attackerRolls || []}
            defenderRolls={battleState.defenderRolls || []}
            currentStep={battleState.currentStep || 'combat'}
            attackerRetreating={Boolean(battleState.attackerRetreating)}
            defenderRetreating={Boolean(battleState.defenderRetreating)}
          />
        </div>
      )}

      {/* Turn Status */}
      <div style={{
        backgroundColor: isMyTurn ? '#fbbf2420' : '#0b1020',
        border: `2px solid ${isMyTurn ? '#fbbf24' : '#334155'}`,
        borderRadius: '12px',
        padding: '16px',
        textAlign: 'center',
        marginBottom: '16px',
      }}>
        {isMyTurn ? (
          <>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24', marginBottom: '4px' }}>
              🎯 Your Turn
            </div>
            <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '8px' }}>
              Time this turn: {Math.floor((playerGameState?.totalTimeMs || 0) / 1000 / 60)} min
            </div>
            <button
              onClick={handleEndTurn}
              style={{
                backgroundColor: '#fbbf24',
                color: '#050814',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(251, 191, 36, 0.3)',
              }}
            >
              End Turn
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: '14px', color: '#94a3b8' }}>
              ⏳ Waiting for {gameState?.players?.[gameState?.currentPlayerIndex]?.name || 'next player'}
            </div>
          </>
        )}
      </div>

      {/* Planet Tracker */}
      <div style={{
        backgroundColor: '#0b1020',
        border: '2px solid #14b8a6',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '16px',
      }}>
        <h3 style={{ color: '#14b8a6', fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>
          🪐 My Planets
        </h3>
        
        {/* Add Planet Form */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              placeholder="Planet name"
              value={newPlanet.name}
              onChange={(e) => setNewPlanet({...newPlanet, name: e.target.value})}
              style={{
                backgroundColor: '#111827',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '8px',
                color: '#f1f5f9',
                fontSize: '12px',
              }}
            />
            <input
              type="number"
              placeholder="Res"
              value={newPlanet.resources || ''}
              onChange={(e) => setNewPlanet({...newPlanet, resources: parseInt(e.target.value) || 0})}
              style={{
                backgroundColor: '#111827',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '8px',
                color: '#f1f5f9',
                fontSize: '12px',
              }}
            />
            <input
              type="number"
              placeholder="Inf"
              value={newPlanet.influence || ''}
              onChange={(e) => setNewPlanet({...newPlanet, influence: parseInt(e.target.value) || 0})}
              style={{
                backgroundColor: '#111827',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '8px',
                color: '#f1f5f9',
                fontSize: '12px',
              }}
            />
          </div>
          <button
            onClick={handleAddPlanet}
            style={{
              backgroundColor: '#14b8a6',
              color: '#050814',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            + Add Planet
          </button>
        </div>

        {/* Planet List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {planets.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '11px', padding: '12px' }}>
              No planets yet
            </div>
          ) : (
            planets.map((planet, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#111827',
                  borderRadius: '6px',
                  padding: '8px',
                }}
              >
                <span style={{ color: '#f1f5f9', fontSize: '12px', fontWeight: '600' }}>{planet.name}</span>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ color: '#22c55e', fontSize: '11px' }}>⚡{planet.resources}</span>
                  <span style={{ color: '#3b82f6', fontSize: '11px' }}>🗳️{planet.influence}</span>
                  <button
                    onClick={() => handleRemovePlanet(index)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#ef4444',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '0 4px',
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0b1020',
        borderTop: '2px solid #334155',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        zIndex: 1000,
      }}>
        <button
          onClick={() => setShowRules(!showRules)}
          style={{
            backgroundColor: showRules ? '#1e293b' : 'transparent',
            color: showRules ? '#fbbf24' : '#94a3b8',
            border: 'none',
            padding: '12px',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            borderRight: '1px solid #334155',
          }}
        >
          📖 Rules
        </button>
        <button
          onClick={() => setShowMetrics(!showMetrics)}
          style={{
            backgroundColor: showMetrics ? '#1e293b' : 'transparent',
            color: showMetrics ? '#fbbf24' : '#94a3b8',
            border: 'none',
            padding: '12px',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
            borderRight: '1px solid #334155',
          }}
        >
          📊 Metrics
        </button>
        <button
          onClick={() => setShowQuickRef(!showQuickRef)}
          style={{
            backgroundColor: showQuickRef ? '#1e293b' : 'transparent',
            color: showQuickRef ? '#fbbf24' : '#94a3b8',
            border: 'none',
            padding: '12px',
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          ⚡ Quick Ref
        </button>
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 8, 20, 0.95)',
          zIndex: 9999,
          overflowY: 'auto',
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#0b1020',
            border: '2px solid #fbbf24',
            borderRadius: '12px',
            padding: '16px',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ color: '#fbbf24', fontSize: '18px', fontWeight: 'bold' }}>📖 Game Rules</h2>
              <button onClick={() => setShowRules(false)} style={{
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
              }}>×</button>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>
              <h3 style={{ color: '#fbbf24', fontSize: '14px', marginTop: '12px', marginBottom: '8px' }}>Phase Order:</h3>
              <ol style={{ paddingLeft: '20px', marginBottom: '12px' }}>
                <li>Strategy Phase - Pick strategy cards</li>
                <li>Action Phase - Take turns activating systems</li>
                <li>Status Phase - Score objectives, ready cards</li>
                <li>Agenda Phase - Vote on galactic laws</li>
              </ol>
              <h3 style={{ color: '#fbbf24', fontSize: '14px', marginTop: '12px', marginBottom: '8px' }}>Victory Conditions:</h3>
              <p>First to 10 Victory Points wins!</p>
              <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                <li>Public Objectives (2 VP each)</li>
                <li>Secret Objectives (1 VP each)</li>
                <li>Control Mecatol Rex (1 VP)</li>
                <li>Complete Secret Agenda (varies)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Modal */}
      {showMetrics && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 8, 20, 0.95)',
          zIndex: 9999,
          overflowY: 'auto',
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#0b1020',
            border: '2px solid #14b8a6',
            borderRadius: '12px',
            padding: '16px',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ color: '#14b8a6', fontSize: '18px', fontWeight: 'bold' }}>📊 My Metrics</h2>
              <button onClick={() => setShowMetrics(false)} style={{
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
              }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ backgroundColor: '#111827', borderRadius: '8px', padding: '12px' }}>
                <div style={{ color: '#14b8a6', fontSize: '12px', marginBottom: '4px' }}>Total Time Played</div>
                <div style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: 'bold' }}>
                  {Math.floor((playerGameState?.totalTimeMs || 0) / 1000 / 60)} minutes
                </div>
              </div>
              <div style={{ backgroundColor: '#111827', borderRadius: '8px', padding: '12px' }}>
                <div style={{ color: '#14b8a6', fontSize: '12px', marginBottom: '4px' }}>Average Time Per Turn</div>
                <div style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: 'bold' }}>
                  {playerGameState?.totalTurns ? Math.floor((playerGameState?.totalTimeMs || 0) / 1000 / 60 / playerGameState.totalTurns) : 0} min
                </div>
              </div>
              <div style={{ backgroundColor: '#111827', borderRadius: '8px', padding: '12px' }}>
                <div style={{ color: '#14b8a6', fontSize: '12px', marginBottom: '4px' }}>Public Objectives</div>
                <div style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: 'bold' }}>
                  {playerGameState?.publicObjectivesScored || 0}
                </div>
              </div>
              <div style={{ backgroundColor: '#111827', borderRadius: '8px', padding: '12px' }}>
                <div style={{ color: '#14b8a6', fontSize: '12px', marginBottom: '4px' }}>Secret Objectives</div>
                <div style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: 'bold' }}>
                  {playerGameState?.secretObjectivesScored || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Reference Modal */}
      {showQuickRef && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 8, 20, 0.95)',
          zIndex: 9999,
          overflowY: 'auto',
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#0b1020',
            border: '2px solid #8b5cf6',
            borderRadius: '12px',
            padding: '16px',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ color: '#8b5cf6', fontSize: '18px', fontWeight: 'bold' }}>⚡ Quick Reference</h2>
              <button onClick={() => setShowQuickRef(false)} style={{
                backgroundColor: 'transparent',
                color: '#94a3b8',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
              }}>×</button>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.6' }}>
              <h3 style={{ color: '#8b5cf6', fontSize: '14px', marginTop: '8px', marginBottom: '8px' }}>Action Phase Actions:</h3>
              <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
                <li><strong>Tactical Action:</strong> Activate a system, move ships, invade planets</li>
                <li><strong>Strategic Action:</strong> Play your strategy card</li>
                <li><strong>Component Action:</strong> Use abilities (action cards, faction abilities)</li>
                <li><strong>Pass:</strong> No more actions this round</li>
              </ul>
              <h3 style={{ color: '#8b5cf6', fontSize: '14px', marginTop: '12px', marginBottom: '8px' }}>Combat:</h3>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Space Combat → Invasion Combat → Production</li>
                <li>Roll dice equal to combat value</li>
                <li>Hits on results ≥ to combat rating</li>
                <li>Assign hits, remove casualties</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Connection Status */}
      {!isConnected && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: '16px',
          right: '16px',
          backgroundColor: '#dc262620',
          border: '2px solid #dc2626',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center',
          color: '#fca5a5',
          fontSize: '12px',
          zIndex: 10000,
        }}>
          ⚠️ Connection lost. Reconnecting...
        </div>
      )}
    </div>
  );
}
