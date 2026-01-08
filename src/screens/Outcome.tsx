import React, { useState } from 'react'
import OutcomeCard from '@/components/OutcomeCard'
import Button from '@/components/UI/Button'
import { RitualAnimation } from '@/components/RitualAnimation'
import { GameState } from '@/lib/types'

interface OutcomeScreenProps {
  game: GameState
  goToCouncil: () => void
}

export default function Outcome({ game, goToCouncil }: OutcomeScreenProps) {
  const [showAnimation, setShowAnimation] = useState(true)
  const { round, players } = game
  const outcome = round.outcome

  if (!outcome) {
    return (
      <div className="p-8 text-zinc-300">
        No outcome available...
      </div>
    )
  }

  // Find players who died this round
  const deadThisRound = players.filter(p => {
    if (p.alive) return false
    // Check if this player was the performer or spite victim
    return (
      p.id === round.performerId ||
      p.id === outcome.spiteVictimId
    )
  })

  const eliminatedPlayerName = deadThisRound[0]?.name

  return (
    <>
      {showAnimation && (
        <RitualAnimation
          outcome={outcome.type}
          onComplete={() => setShowAnimation(false)}
          eliminatedPlayerName={eliminatedPlayerName}
        />
      )}

      {!showAnimation && (
        <div className="p-8 flex flex-col gap-6 max-w-3xl mx-auto">
      <OutcomeCard outcome={outcome} />
      
      {deadThisRound.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-4">
          <h3 className="text-red-400 font-semibold mb-2">
            💀 {deadThisRound.length === 1 ? 'A witch has fallen' : 'Witches have fallen'}
          </h3>
          <ul className="text-zinc-300 text-sm space-y-1">
            {deadThisRound.map(p => (
              <li key={p.id}>• {p.name}</li>
            ))}
          </ul>
        </div>
      )}
      
      <Button 
        aria-label="Proceed to Council" 
        onClick={goToCouncil}
        className="mt-4"
      >
        Proceed to the Council
      </Button>
        </div>
      )}
    </>
  )
}
