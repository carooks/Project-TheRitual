import React, { useState, useEffect } from 'react';
import { generateWitchyNameVariations } from '../lib/nameGenerator';

interface PlayerJoinProps {
  onJoin: (roomCode: string, playerName: string) => void;
  onBack: () => void;
  initialRoomCode?: string;
}

export function PlayerJoin({ onJoin, onBack, initialRoomCode }: PlayerJoinProps) {
  const [roomCode, setRoomCode] = useState(initialRoomCode || '');
  const [playerName, setPlayerName] = useState('');
  const [inputName, setInputName] = useState('');
  const [showGenerator, setShowGenerator] = useState(false);
  const [nsfwMode, setNsfwMode] = useState(false);
  const [witchyNames, setWitchyNames] = useState<string[]>([]);

  // Update room code if initialRoomCode changes
  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode);
    }
  }, [initialRoomCode]);

  const handleGenerateNames = () => {
    if (inputName.trim()) {
      const names = generateWitchyNameVariations(inputName, nsfwMode, 4);
      setWitchyNames(names);
      setShowGenerator(true);
    }
  };

  const handleSelectWitchyName = (name: string) => {
    setPlayerName(name);
    setInputName(name);
    setShowGenerator(false);
  };

  const handleManualName = () => {
    const cleanName = inputName.trim();
    if (!cleanName) return;
    setPlayerName(cleanName);
    setInputName(cleanName);
    setShowGenerator(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim() && playerName.trim()) {
      onJoin(roomCode.toUpperCase().trim(), playerName.trim());
    }
  };

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
      padding: '16px',
      paddingTop: 'calc(16px + env(safe-area-inset-top))',
      paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(10, 5, 0, 0.9), rgba(25, 12, 3, 0.92))',
        backdropFilter: 'blur(6px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'relative',
        background: 'linear-gradient(145deg, rgba(20, 15, 10, 0.95), rgba(30, 20, 15, 0.92))',
        border: '2px solid rgba(139, 87, 42, 0.7)',
        borderRadius: '16px',
        padding: 'clamp(18px, 4.5vw, 40px)',
        maxWidth: '520px',
        width: '92%',
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(212, 175, 55, 0.25)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(22px, 6vw, 32px)',
            fontWeight: '700',
            color: '#d4af37',
            marginBottom: '8px',
            textShadow: '0 0 20px rgba(212, 175, 55, 0.6)',
            letterSpacing: '0.08em',
          }}>
            📱 Join the Ritual
          </h1>
          <p style={{ color: 'rgba(200, 190, 170, 0.78)', fontSize: '14px', letterSpacing: '0.03em' }}>
            Enter the room code bestowed by the host
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {initialRoomCode && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              background: 'rgba(212, 175, 55, 0.08)',
              borderRadius: '8px',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '12px', color: '#d4af37', fontWeight: '600', letterSpacing: '0.08em' }}>
                ✓ Room code detected from link
              </div>
            </div>
          )}
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#d4af37',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              letterSpacing: '0.05em',
            }}>
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              maxLength={6}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, rgba(12, 7, 3, 0.95), rgba(8, 4, 2, 0.9))',
                border: '2px solid rgba(139, 87, 42, 0.7)',
                borderRadius: '8px',
                padding: '14px 12px',
                fontSize: 'clamp(20px, 6vw, 26px)',
                fontFamily: 'monospace',
                letterSpacing: '0.2em',
                textAlign: 'center',
                color: '#d4af37',
                textTransform: 'uppercase',
                boxSizing: 'border-box',
                textShadow: '0 0 12px rgba(212, 175, 55, 0.4)',
              }}
              autoFocus={!initialRoomCode}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#d4af37',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
              letterSpacing: '0.05em',
            }}>
              Your Name
            </label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              style={{
                width: '100%',
                backgroundColor: 'rgba(12, 7, 3, 0.85)',
                border: '2px solid rgba(139, 87, 42, 0.7)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '16px',
                color: '#f8eedb',
                boxSizing: 'border-box',
                marginBottom: '12px',
              }}
            />

            {/* Name Generator Options */}
            {!showGenerator && inputName.trim() && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '8px',
                  alignItems: 'center',
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'rgba(200, 190, 170, 0.8)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={nsfwMode}
                      onChange={(e) => setNsfwMode(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    🔞 Spicy Mode
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleGenerateNames}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, rgba(76, 37, 16, 0.95), rgba(60, 25, 10, 0.95))',
                      color: '#d4af37',
                      border: '2px solid rgba(212, 175, 55, 0.6)',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      letterSpacing: '0.05em',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    ✨ Generate Witchy Name
                  </button>
                  <button
                    type="button"
                    onClick={handleManualName}
                    style={{
                      flex: 1,
                      backgroundColor: 'rgba(30, 20, 15, 0.8)',
                      color: 'rgba(200, 190, 170, 0.85)',
                      border: '2px solid rgba(139, 87, 42, 0.4)',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Use "{inputName}"
                  </button>
                </div>
              </div>
            )}

            {/* Generated Names Selection */}
            {showGenerator && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(18, 12, 6, 0.9), rgba(25, 15, 8, 0.9))',
                border: '2px solid rgba(212, 175, 55, 0.5)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.5)',
              }}>
                <div style={{
                  color: '#d4af37',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '12px',
                  textAlign: 'center',
                }}>
                  🔮 Choose Your Witchy Name
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {witchyNames.map((name, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectWitchyName(name)}
                      style={{
                        backgroundColor: 'rgba(35, 22, 12, 0.85)',
                        color: '#f5e1c0',
                        border: '2px solid rgba(212, 175, 55, 0.6)',
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(50, 32, 18, 0.95)';
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.35)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(35, 22, 12, 0.85)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      ✨ {name}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowGenerator(false)}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    backgroundColor: 'rgba(30, 20, 15, 0.8)',
                    color: 'rgba(200, 190, 170, 0.85)',
                    border: '2px solid rgba(139, 87, 42, 0.4)',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Selected Name Display */}
            {playerName && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(120, 80, 30, 0.25))',
                border: '2px solid rgba(212, 175, 55, 0.6)',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
                boxShadow: 'inset 0 1px 6px rgba(0, 0, 0, 0.4)',
              }}>
                <div style={{ fontSize: '12px', color: '#d4af37', marginBottom: '4px' }}>
                  Your Witchy Name:
                </div>
                <div style={{ fontSize: '18px', color: '#f8eedb', fontWeight: 'bold' }}>
                  {playerName}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPlayerName('');
                    setInputName('');
                  }}
                  style={{
                    marginTop: '8px',
                    backgroundColor: 'transparent',
                    color: 'rgba(200, 190, 170, 0.8)',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Change Name
                </button>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
          }}>
            <button
              type="button"
              onClick={onBack}
              style={{
                flex: 1,
                backgroundColor: 'rgba(30, 20, 15, 0.85)',
                color: 'rgba(200, 190, 170, 0.85)',
                border: '2px solid rgba(139, 87, 42, 0.5)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Back
            </button>

            <button
              type="submit"
              disabled={!roomCode.trim() || !playerName.trim()}
              style={{
                flex: 2,
                background: roomCode && playerName
                  ? 'linear-gradient(135deg, #d4af37, #b8941f)'
                  : 'linear-gradient(135deg, rgba(60, 50, 40, 0.6), rgba(50, 40, 30, 0.6))',
                color: roomCode && playerName ? 'rgba(20, 15, 10, 0.95)' : 'rgba(120, 110, 100, 0.8)',
                border: `2px solid ${roomCode && playerName ? 'rgba(212, 175, 55, 0.8)' : 'rgba(80, 70, 60, 0.4)'}`,
                borderRadius: '8px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: roomCode && playerName ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: roomCode && playerName
                  ? '0 0 25px rgba(212, 175, 55, 0.4), 0 4px 12px rgba(0, 0, 0, 0.5)'
                  : 'none',
              }}
            >
              Join Game
            </button>
          </div>
        </form>

        {/* Tip */}
        <p style={{
          marginTop: '24px',
          textAlign: 'center',
          color: '#64748b',
          fontSize: '12px',
          fontStyle: 'italic',
        }}>
          💡 Get the room code from your game host
        </p>
      </div>
    </div>
  );
}
