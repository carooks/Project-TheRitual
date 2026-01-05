import React from 'react'
import Timer from '@/components/Timer'
import Button from '@/components/UI/Button'
import { Player } from '@/lib/types'

type Props = {
  players: Player[]
  onElected: () => void
}

export default function Choosing({ players, onElected }: Props) {
  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="card large-card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Choosing</h2>
          <Timer seconds={180} />
        </div>
        <p className="text-gray-300 mt-4">Simulated secret vote. (Silence Vote hook present but stubbed)</p>
        <div className="mt-6">
          <Button aria-label="Elect Performer" onClick={onElected}>Elect Performer</Button>
        </div>
      </div>
    </div>
  )
}
