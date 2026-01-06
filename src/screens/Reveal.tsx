import React from 'react'
import RitualReveal from '@/components/RitualReveal'
import { GameState } from '@/lib/types'
import { advanceToOutcome } from '@/lib/gameLogic'

interface RevealScreenProps {
  game: GameState
  updateGame: (next: GameState) => void
}

export default function Reveal({ game, updateGame }: RevealScreenProps) {
  const { round } = game

  const handleRevealComplete = () => {
    // Compute ritual outcome and transition to OUTCOME phase
    try {
      const nextState = advanceToOutcome(game)
      updateGame(nextState)
    } catch (error) {
      console.error('Failed to advance to outcome:', error)
      // Optionally show error to user or fallback
    }
  }

  return (
    <div className="h-full w-full flex items-center justify-center">
      <RitualReveal
        ingredientPlays={round.ingredientsPlayed}
        performerId={round.performerId!}
        onComplete={handleRevealComplete}
      />
    </div>
  )
}
