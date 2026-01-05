import { useState } from 'react';

interface ModeSelectionProps {
  onSelectMode: (mode: 'solo' | 'host' | 'join') => void;
}

export function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  const modes = [
    {
      id: 'solo',
      title: '🖥️ Solo Mode',
      description: 'Track your game on this device only',
      color: 'var(--phase-strategy)',
    },
    {
      id: 'host',
      title: '🎮 Host Game',
      description: 'Create a multiplayer room with QR code',
      color: 'var(--phase-status)',
    },
    {
      id: 'join',
      title: '📱 Join Game',
      description: 'Join an existing room with a code',
      color: 'var(--phase-action)',
    },
  ];

  return (
    <div className="mode-selection" role="main" aria-label="Mode selection">
      <div className="mode-selection__content">
        <div className="mode-selection__header" aria-hidden="true">
          <div className="mode-selection__title">Choose Mode</div>
        </div>

        <div className="mode-selection__grid" role="list" aria-label="Available modes">
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
                className={`mode-card${isPrimary ? ' mode-card--primary' : ''}${isHovered ? ' mode-card--hover' : ''}`}
                style={{
                  borderColor: mode.color,
                }}
                aria-label={mode.title.replace(/^[^A-Za-z0-9]+\s*/, '')}
              >
                <div className="mode-card__title" style={{ color: mode.color }}>
                  {mode.title}
                </div>
                <div className="mode-card__desc">{mode.description}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
