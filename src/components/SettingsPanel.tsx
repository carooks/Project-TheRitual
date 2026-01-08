import { useState } from 'react';
import { ColorBlindModeSelector, useColorBlindMode } from '../hooks/useColorBlindMode';
import { Button } from './UI/Button';

interface SettingsPanelProps {
  onClose: () => void;
  onShowTutorial?: () => void;
}

export function SettingsPanel({ onClose, onShowTutorial }: SettingsPanelProps) {
  const { mode: colorBlindMode, setMode: setColorBlindMode } = useColorBlindMode();
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('reducedMotion') === 'true';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('soundEnabled') !== 'false';
  });

  const handleReducedMotionChange = (enabled: boolean) => {
    setReducedMotion(enabled);
    localStorage.setItem('reducedMotion', String(enabled));
    
    if (enabled) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }
  };

  const handleSoundChange = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('soundEnabled', String(enabled));
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
      onClick={onClose}
      role="dialog"
      aria-labelledby="settings-title"
      aria-modal="true"
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.95) 0%, rgba(30, 30, 60, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.6)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.9)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2
            id="settings-title"
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#d4af37',
              marginBottom: '8px',
              fontFamily: 'Georgia, serif',
            }}
          >
            ⚙️ Settings
          </h2>
          <p style={{ 
            color: 'rgba(200, 190, 170, 0.7)',
            fontSize: '14px',
            margin: 0,
          }}>
            Customize your experience
          </p>
        </div>

        {/* Settings */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '24px',
        }}>
          {/* Color Blind Mode */}
          <ColorBlindModeSelector mode={colorBlindMode} setMode={setColorBlindMode} />

          {/* Reduced Motion */}
          <div style={{ 
            background: 'rgba(76, 29, 149, 0.3)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}>
              <div>
                <div style={{ 
                  color: '#d4af37',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '4px',
                }}>
                  Reduced Motion
                </div>
                <div style={{ 
                  color: 'rgba(200, 190, 170, 0.7)',
                  fontSize: '12px',
                }}>
                  Minimize animations and transitions
                </div>
              </div>
              <input
                type="checkbox"
                checked={reducedMotion}
                onChange={(e) => handleReducedMotionChange(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                }}
                aria-label="Enable reduced motion"
              />
            </label>
          </div>

          {/* Sound */}
          <div style={{ 
            background: 'rgba(76, 29, 149, 0.3)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}>
              <div>
                <div style={{ 
                  color: '#d4af37',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '4px',
                }}>
                  Sound Effects
                </div>
                <div style={{ 
                  color: 'rgba(200, 190, 170, 0.7)',
                  fontSize: '12px',
                }}>
                  Enable background music and sound effects
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => handleSoundChange(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                }}
                aria-label="Enable sound effects"
              />
            </label>
          </div>

          {/* Tutorial */}
          {onShowTutorial && (
            <div style={{ 
              background: 'rgba(76, 29, 149, 0.3)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '8px',
              padding: '16px',
            }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  color: '#d4af37',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '4px',
                }}>
                  Tutorial
                </div>
                <div style={{ 
                  color: 'rgba(200, 190, 170, 0.7)',
                  fontSize: '12px',
                }}>
                  Learn how to play The Ritual
                </div>
              </div>
              <button
                onClick={onShowTutorial}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(76, 29, 149, 0.6))',
                  color: '#e9d5ff',
                  border: '2px solid rgba(212, 175, 55, 0.5)',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Show Tutorial
              </button>
            </div>
          )}

          {/* Keyboard Shortcuts */}
          <div style={{ 
            background: 'rgba(76, 29, 149, 0.3)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{ 
              color: '#d4af37',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '12px',
            }}>
              Keyboard Shortcuts
            </div>
            <div style={{ 
              color: 'rgba(200, 190, 170, 0.9)',
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Toggle Ready</span>
                <kbd style={{ 
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                }}>R</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Open Settings</span>
                <kbd style={{ 
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                }}>Ctrl + ,</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Navigate Cards</span>
                <kbd style={{ 
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                }}>Arrow Keys</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="primary"
          style={{ width: '100%' }}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
