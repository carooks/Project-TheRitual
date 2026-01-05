import React, { useEffect, useState } from 'react'

type Props = {
  seconds: number
  onComplete?: () => void
}

export default function Timer({ seconds, onComplete }: Props) {
  const [t, setT] = useState(seconds)

  useEffect(() => {
    setT(seconds)
  }, [seconds])

  useEffect(() => {
    if (t <= 0) {
      onComplete?.()
      return
    }
    const id = setInterval(() => setT((s: number) => s - 1), 1000)
    return () => clearInterval(id)
  }, [t])

  const mm = String(Math.floor(t / 60)).padStart(2, '0')
  const ss = String(t % 60).padStart(2, '0')

  return (
    <div role="timer" aria-live="polite" aria-atomic="true" className="pill">
      {mm}:{ss}
    </div>
  )
}
