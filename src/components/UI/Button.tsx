import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { label?: string }

export default function Button({ label, children, className = '', ...rest }: Props) {
  return (
    <button
      {...rest}
      className={`px-4 py-2 rounded-lg bg-ritual-500 hover:bg-ritual-600 focus:outline-none focus:ring-2 focus:ring-ritual-400 ${className}`}
      aria-label={rest['aria-label'] ?? label}
    >
      {children ?? label}
    </button>
  )
}
