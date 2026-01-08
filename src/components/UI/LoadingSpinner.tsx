import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export function LoadingSpinner({ size = 'medium', message }: LoadingSpinnerProps) {
  const sizeMap = {
    small: '24px',
    medium: '40px',
    large: '60px',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: sizeMap[size],
          height: sizeMap[size],
          border: '3px solid rgba(167, 139, 250, 0.3)',
          borderTop: '3px solid rgb(167, 139, 250)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
        role="status"
        aria-label="Loading"
      />
      {message && (
        <p
          style={{
            color: 'rgb(167, 139, 250)',
            fontSize: '14px',
            fontWeight: '500',
            margin: 0,
          }}
        >
          {message}
        </p>
      )}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
