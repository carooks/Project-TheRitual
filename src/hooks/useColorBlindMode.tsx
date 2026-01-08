import { useState, useEffect } from 'react';

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

interface ColorScheme {
  pure: string;
  tainted: string;
  backfired: string;
  sacred: string;
  hollow: string;
  accent: string;
}

const normalColors: ColorScheme = {
  pure: '#22c55e',      // Green
  tainted: '#eab308',   // Yellow
  backfired: '#ef4444', // Red
  sacred: '#3b82f6',    // Blue
  hollow: '#8b5cf6',    // Purple
  accent: '#d4af37',    // Gold
};

const protanopiaColors: ColorScheme = {
  pure: '#0ea5e9',      // Bright blue (was green)
  tainted: '#f59e0b',   // Orange (was yellow)
  backfired: '#7c2d12', // Dark brown (was red)
  sacred: '#0369a1',    // Deep blue
  hollow: '#6b21a8',    // Deep purple
  accent: '#92400e',    // Brown (was gold)
};

const deuteranopiaColors: ColorScheme = {
  pure: '#06b6d4',      // Cyan (was green)
  tainted: '#f97316',   // Orange (was yellow)
  backfired: '#991b1b', // Dark red
  sacred: '#1d4ed8',    // Blue
  hollow: '#7c3aed',    // Purple
  accent: '#a16207',    // Dark yellow (was gold)
};

const tritanopiaColors: ColorScheme = {
  pure: '#ec4899',      // Pink (was green)
  tainted: '#f43f5e',   // Rose (was yellow)
  backfired: '#be123c', // Deep rose (was red)
  sacred: '#0c4a6e',    // Deep blue
  hollow: '#5b21b6',    // Deep purple
  accent: '#be185d',    // Deep pink (was gold)
};

const colorSchemes: Record<ColorBlindMode, ColorScheme> = {
  none: normalColors,
  protanopia: protanopiaColors,
  deuteranopia: deuteranopiaColors,
  tritanopia: tritanopiaColors,
};

export function useColorBlindMode() {
  const [mode, setMode] = useState<ColorBlindMode>(() => {
    const saved = localStorage.getItem('colorBlindMode');
    return (saved as ColorBlindMode) || 'none';
  });

  useEffect(() => {
    localStorage.setItem('colorBlindMode', mode);
    
    // Apply CSS custom properties
    const colors = colorSchemes[mode];
    const root = document.documentElement;
    
    root.style.setProperty('--color-pure', colors.pure);
    root.style.setProperty('--color-tainted', colors.tainted);
    root.style.setProperty('--color-backfired', colors.backfired);
    root.style.setProperty('--color-sacred', colors.sacred);
    root.style.setProperty('--color-hollow', colors.hollow);
    root.style.setProperty('--color-accent', colors.accent);
  }, [mode]);

  return { mode, setMode, colors: colorSchemes[mode] };
}

export function ColorBlindModeSelector({ mode, setMode }: { 
  mode: ColorBlindMode; 
  setMode: (mode: ColorBlindMode) => void;
}) {
  const modes: { value: ColorBlindMode; label: string }[] = [
    { value: 'none', label: 'Normal Vision' },
    { value: 'protanopia', label: 'Protanopia (Red-Blind)' },
    { value: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
    { value: 'tritanopia', label: 'Tritanopia (Blue-Blind)' },
  ];

  return (
    <div style={{ 
      background: 'rgba(76, 29, 149, 0.3)',
      border: '1px solid rgba(212, 175, 55, 0.3)',
      borderRadius: '8px',
      padding: '16px',
    }}>
      <label style={{ 
        display: 'block',
        color: '#d4af37',
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '12px',
      }}>
        Color Blind Mode
      </label>
      <select
        value={mode}
        onChange={(e) => setMode(e.target.value as ColorBlindMode)}
        style={{
          width: '100%',
          background: 'rgba(17, 24, 39, 0.8)',
          color: '#e9d5ff',
          border: '2px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '6px',
          padding: '10px',
          fontSize: '14px',
          cursor: 'pointer',
        }}
        aria-label="Select color blind mode"
      >
        {modes.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <p style={{ 
        color: 'rgba(200, 190, 170, 0.7)',
        fontSize: '12px',
        marginTop: '8px',
        marginBottom: 0,
      }}>
        Adjusts colors for different types of color vision deficiency
      </p>
    </div>
  );
}
