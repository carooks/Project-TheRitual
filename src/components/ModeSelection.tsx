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
      color: '#d4af37',
    },
    {
      id: 'host',
      title: 'Host Game',
      description: 'Create a multiplayer room with QR code',
      color: '#d4af37',
    },
    {
      id: 'join',
      title: 'Join Game',
      description: 'Join an existing room with a code',
      color: '#d4af37',
    },
  ];

  return (
    <div className="mode-selection" role="main" aria-label="Mode selection">
      <div className="mode-selection__content">
        <div className="mode-selection__logo">
          <img 
            src="/assets/backgrounds/title-screen.png" 
            alt="The Ritual"
            className="title-screen-image"
          />
        </div>
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
                aria-label={mode.title}
              >
                <div className="mode-card__title">
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
