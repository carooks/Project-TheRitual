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
    setShowGenerator(false);
  };

  const handleManualName = () => {
    setPlayerName(inputName);
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
        background: 'linear-gradient(135deg, rgba(5, 8, 20, 0.9), rgba(20, 10, 30, 0.9))',
        backdropFilter: 'blur(4px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'relative',
        background: 'linear-gradient(145deg, rgba(10, 16, 32, 0.9), rgba(6, 10, 20, 0.95))',
        border: '2px solid #14b8a6',
        borderRadius: '16px',
        padding: 'clamp(18px, 4.5vw, 40px)',
        maxWidth: '500px',
        width: '90%',
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        boxShadow: '0 0 40px rgba(20, 184, 166, 0.35)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(22px, 6vw, 32px)',
            fontWeight: 'bold',
            color: '#14b8a6',
            marginBottom: '8px',
            textShadow: '0 0 20px rgba(20, 184, 166, 0.5)',
          }}>
            📱 Join Game
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            Enter the room code from your host
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {initialRoomCode && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              background: 'rgba(20, 184, 166, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(20, 184, 166, 0.3)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '12px', color: '#14b8a6', fontWeight: '600' }}>
                ✓ Room code detected from link
              </div>
            </div>
          )}
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#14b8a6',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
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
                backgroundColor: '#111827',
                border: '2px solid #14b8a6',
                borderRadius: '8px',
                padding: '14px 12px',
                fontSize: 'clamp(18px, 6vw, 24px)',
                fontFamily: 'monospace',
                letterSpacing: '0.18em',
                textAlign: 'center',
                color: '#14b8a6',
                textTransform: 'uppercase',
                boxSizing: 'border-box',
              }}
              autoFocus={!initialRoomCode}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#14b8a6',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px',
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
                backgroundColor: '#111827',
                border: '2px solid #14b8a6',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '16px',
                color: '#f1f5f9',
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
                    color: '#94a3b8',
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
                      backgroundColor: '#4c1d95',
                      color: '#d4af37',
                      border: '2px solid #d4af37',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    ✨ Generate Witchy Name
                  </button>
                  <button
                    type="button"
                    onClick={handleManualName}
                    style={{
                      flex: 1,
                      backgroundColor: '#1e293b',
                      color: '#94a3b8',
                      border: '2px solid #334155',
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
                backgroundColor: '#1a1a2e',
                border: '2px solid #d4af37',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
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
                        backgroundColor: '#2d1b4e',
                        color: '#f1f5f9',
                        border: '2px solid #d4af37',
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '15px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#4c1d95';
                        e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2d1b4e';
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
                    backgroundColor: '#1e293b',
                    color: '#94a3b8',
                    border: '2px solid #334155',
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
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                border: '2px solid #d4af37',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '12px', color: '#d4af37', marginBottom: '4px' }}>
                  Your Witchy Name:
                </div>
                <div style={{ fontSize: '18px', color: '#f1f5f9', fontWeight: 'bold' }}>
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
                    color: '#94a3b8',
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
                backgroundColor: '#1e293b',
                color: '#94a3b8',
                border: '2px solid #334155',
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
                backgroundColor: roomCode && playerName ? '#14b8a6' : '#334155',
                color: roomCode && playerName ? '#050814' : '#64748b',
                border: `2px solid ${roomCode && playerName ? '#14b8a6' : '#334155'}`,
                borderRadius: '8px',
                padding: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: roomCode && playerName ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: roomCode && playerName ? '0 0 20px rgba(20, 184, 166, 0.3)' : 'none',
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
