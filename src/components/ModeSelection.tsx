import { useState } from 'react';

interface ModeSelectionProps {
  onSelectMode: (mode: 'solo' | 'host' | 'join') => void;
}

export function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  const modes = [
    {
      id: 'solo',
      title: 'Solo Mode',
      description: 'Track your game on this device only',
      icon: '🔮',
    },
    {
      id: 'host',
      title: 'Host Game',
      description: 'Create a multiplayer room with QR code',
      icon: '✨',
    },
    {
      id: 'join',
      title: 'Join Game',
      description: 'Join an existing room with a code',
      icon: '🌙',
    },
  ];

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 50%, rgba(76, 29, 149, 0.4) 0%, rgba(17, 24, 39, 0.95) 70%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      role="main" 
      aria-label="Mode selection"
    >
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img 
            src="/assets/backgrounds/title-screen.png" 
            alt="The Ritual"
            style={{
              maxWidth: '100%',
              height: 'auto',
              marginBottom: '20px',
              filter: 'drop-shadow(0 0 30px rgba(212, 175, 55, 0.3))',
            }}
          />
        </div>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#d4af37',
            fontFamily: 'Georgia, serif',
            textShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
          }}>
            ✦ Choose Your Path ✦
          </div>
        </div>

        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
          }}
          role="list" 
          aria-label="Available modes"
        >
          {modes.map((mode) => {
            const isHovered = hoveredMode === mode.id;
            const isPrimary = mode.id === 'host';

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onSelectMode(mode.id as any)}
                onMouseEnter={() => setHoveredMode(mode.id)}
                onMouseLeave={() => setHoveredMode(null)}
                style={{
                  background: isHovered
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.6) 0%, rgba(76, 29, 149, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(76, 29, 149, 0.4) 0%, rgba(30, 30, 60, 0.7) 100%)',
                  border: isPrimary
                    ? `2px solid ${isHovered ? '#d4af37' : 'rgba(212, 175, 55, 0.6)'}`
                    : `2px solid ${isHovered ? '#a78bfa' : 'rgba(167, 139, 250, 0.4)'}`,
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: isHovered
                    ? `0 0 30px ${isPrimary ? 'rgba(212, 175, 55, 0.5)' : 'rgba(139, 92, 246, 0.4)'}`
                    : 'none',
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                }}
                aria-label={mode.title}
              >
                <div style={{
                  fontSize: '48px',
                  marginBottom: '12px',
                }}>
                  {mode.icon}
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: isPrimary ? '#d4af37' : '#e9d5ff',
                  marginBottom: '8px',
                  fontFamily: 'Georgia, serif',
                }}>
                  {mode.title}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#cbd5f5',
                  lineHeight: '1.4',
                }}>
                  {mode.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
