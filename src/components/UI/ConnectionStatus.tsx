import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  showLabel?: boolean;
}

export function ConnectionStatus({ isConnected, showLabel = true }: ConnectionStatusProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        background: isConnected 
          ? 'rgba(34, 197, 94, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)',
        borderRadius: '20px',
        border: `1px solid ${isConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isConnected ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
          boxShadow: isConnected 
            ? '0 0 10px rgba(34, 197, 94, 0.5)' 
            : '0 0 10px rgba(239, 68, 68, 0.5)',
          animation: isConnected ? 'none' : 'pulse 2s ease-in-out infinite',
        }}
        aria-label={isConnected ? 'Connected' : 'Disconnected'}
      />
      {showLabel && (
        <span
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: isConnected ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      )}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}
      </style>
    </div>
  );
}
