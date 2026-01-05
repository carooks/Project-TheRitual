import React from 'react'
import Button from '@/components/UI/Button'
import { Player } from '@/lib/types'

type Props = {
  players: Player[]
  onNextRound: () => void
}

export default function Council({ players, onNextRound }: Props) {
  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="card large-card">
        <h2 className="text-xl font-bold mb-4">Council</h2>
        <p className="text-gray-300 mb-4">Purging Moon hook (Rounds ≥4, 25% flare) stubbed here.</p>
        <div className="flex gap-3">
          <Button aria-label="Burn">Burn (stub)</Button>
          <Button aria-label="Spare">Spare (stub)</Button>
        </div>
        <div className="mt-6">
          <Button aria-label="Next Round" onClick={onNextRound}>Next Round</Button>
        </div>
      </div>
    </div>
  )
}
