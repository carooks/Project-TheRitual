import React, { useEffect, useState } from 'react'
import { IngredientPlay, IngredientId } from '@/lib/types'
import { INGREDIENTS } from '@/lib/ingredients'
import IngredientCard from './IngredientCard'
import Meter from './UI/Meter'

interface RitualRevealProps {
  ingredientPlays: IngredientPlay[]
  performerId: string
  onComplete: () => void
}

export default function RitualReveal({ ingredientPlays, performerId, onComplete }: RitualRevealProps) {
  const [revealedCount, setRevealedCount] = useState(0)
  const [currentCorruption, setCurrentCorruption] = useState(0)

  useEffect(() => {
    if (!ingredientPlays || ingredientPlays.length === 0) {
      // No ingredients to reveal, complete immediately
      onComplete()
      return
    }

    setRevealedCount(0)
    setCurrentCorruption(0)

    const interval = 1200 // ms between each reveal
    let i = 0

    const timer = setInterval(() => {
      setRevealedCount(i + 1)
      
      // Update corruption meter as ingredients are revealed
      const revealedSoFar = ingredientPlays.slice(0, i + 1)
      const corruption = computeRunningCorruption(revealedSoFar.map(p => p.ingredientId))
      setCurrentCorruption(corruption)

      i++
      
      if (i >= ingredientPlays.length) {
        clearInterval(timer)
        // Small delay before calling onComplete
        setTimeout(() => {
          onComplete()
        }, 900)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [ingredientPlays, onComplete])

  const revealedIngredients = ingredientPlays.slice(0, revealedCount)

  return (
    <div className="w-full flex flex-col items-center gap-6 p-8">
      <h2 className="text-3xl font-bold text-amber-400 mb-4">✨ The Revelation</h2>
      
      <div className="flex gap-4 flex-wrap justify-center max-w-4xl">
        {revealedIngredients.map((play, i) => {
          const ingredient = INGREDIENTS.find(ing => ing.id === play.ingredientId)
          if (!ingredient) return null
          
          return (
            <div key={i} className="animate-fade-in">
              <IngredientCard ingredient={ingredient} />
            </div>
          )
        })}
      </div>
      
      <div className="w-full max-w-2xl mt-4">
        <Meter value={currentCorruption} />
      </div>
    </div>
  )
}

/**
 * Compute running corruption index (0..1) for the revealed ingredients so far.
 * This provides visual feedback during the reveal animation.
 */
function computeRunningCorruption(ingredientIds: IngredientId[]): number {
  let positiveSum = 0
  let negativeSum = 0

  for (const id of ingredientIds) {
    const ingredient = INGREDIENTS.find(i => i.id === id)
    if (!ingredient) continue

    const val = ingredient.corruptionValue
    if (val > 0) {
      positiveSum += val
    } else if (val < 0) {
      negativeSum += Math.abs(val)
    }
  }

  const netCorruption = positiveSum - negativeSum
  const maxPerCard = 0.3 // BLOOD_OF_THE_INNOCENT
  const normalized = netCorruption / maxPerCard

  return Math.max(0, Math.min(1, normalized))
}
