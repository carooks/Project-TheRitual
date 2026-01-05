import React from 'react'

export default function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div className="banner-container">
      <div className="banner-glow" />
      <h1 className="banner-title">{children}</h1>
    </div>
  )
}
