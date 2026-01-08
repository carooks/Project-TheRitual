import React from 'react'
import { soundManager } from '@/lib/sounds'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { label?: string, disableSound?: boolean }

export default function Button({ label, children, className = '', onClick, disableSound = false, ...rest }: Props) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disableSound) {
      soundManager.play('button-click');
    }
    onClick?.(e);
  };

  return (
    <button
      {...rest}
      onClick={handleClick}
      className={`px-4 py-2 rounded-lg bg-ritual-500 hover:bg-ritual-600 focus:outline-none focus:ring-2 focus:ring-ritual-400 ${className}`}
      aria-label={rest['aria-label'] ?? label}
    >
      {children ?? label}
    </button>
  )
}
