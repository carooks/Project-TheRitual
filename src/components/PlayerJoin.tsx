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
  const [witchyNames, setWitchyNames] = useState<string[]>([]);

  // Update room code if initialRoomCode changes
  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode);
    }
  }, [initialRoomCode]);

  // Auto-generate names when user types (always crazy mode!)
  useEffect(() => {
    if (inputName.trim()) {
      const names = generateWitchyNameVariations(inputName, true, 4);
      setWitchyNames(names);
    }
  }, [inputName]);

  const handleGenerateNames = () => {
    if (inputName.trim()) {
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
      background: 'radial-gradient(circle at 50% 50%, rgba(76, 29, 149, 0.5) 0%, rgba(17, 24, 39, 0.95) 70%)',
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
        background: 'rgba(17, 24, 39, 0.3)',
        backdropFilter: 'blur(8px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'relative',
        background: 'linear-gradient(145deg, rgba(76, 29, 149, 0.6) 0%, rgba(30, 30, 60, 0.9) 100%)',
        border: '2px solid rgba(212, 175, 55, 0.6)',
        borderRadius: '16px',
        padding: 'clamp(18px, 4.5vw, 40px)',
        maxWidth: '520px',
        width: '92%',
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        boxShadow: '0 12px 48px rgba(0, 0, 0, 0.9), 0 0 60px rgba(139, 92, 246, 0.3)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: 'clamp(24px, 6vw, 34px)',
            fontWeight: '700',
            color: '#d4af37',
            marginBottom: '8px',
            textShadow: '0 0 25px rgba(212, 175, 55, 0.7)',
            letterSpacing: '0.1em',
            fontFamily: 'Georgia, serif',
          }}>
            🌙 Join the Ritual
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

            {/* Name Generator - Auto shows when typing */}
            {!showGenerator && inputName.trim() && (
              <div style={{ marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={handleGenerateNames}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(76, 29, 149, 0.8) 100%)',
                    color: '#d4af37',
                    border: '2px solid rgba(212, 175, 55, 0.6)',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    letterSpacing: '0.05em',
                    boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  ✨ Choose Your Witchy Name
                  </button>
              </div>
            )}

            {/* Generated Names Selection */}
            {showGenerator && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.5) 0%, rgba(30, 30, 60, 0.7) 100%)',
                border: '2px solid rgba(212, 175, 55, 0.6)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
              }}>
                <div style={{
                  color: '#d4af37',
                  fontSize: '15px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  textAlign: 'center',
                  fontFamily: 'Georgia, serif',
                  textShadow: '0 0 15px rgba(212, 175, 55, 0.6)',
                }}>
                  ✦ Choose Your Witchy Name ✦
                </div>
                <div style={{
                  color: '#cbd5f5',
                  fontSize: '12px',
                  marginBottom: '12px',
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}>
                  (Based on "{inputName}")
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {witchyNames.map((name, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectWitchyName(name)}
                      style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(76, 29, 149, 0.5) 100%)',
                        color: '#f3e8ff',
                        border: '2px solid rgba(212, 175, 55, 0.5)',
                        borderRadius: '8px',
                        padding: '14px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        textAlign: 'center',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(76, 29, 149, 0.8) 100%)';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.5)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(76, 29, 149, 0.5) 100%)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
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
                    background: 'linear-gradient(135deg, rgba(30, 30, 60, 0.5) 0%, rgba(20, 20, 40, 0.6) 100%)',
                    color: '#cbd5f5',
                    border: '2px solid rgba(148, 163, 184, 0.4)',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  ← Back
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
