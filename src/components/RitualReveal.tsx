import React, { useEffect, useState } from 'react'
import { Ingredient, OutcomeSummary } from '@/lib/types'
import IngredientCard from './IngredientCard'
import Meter from './UI/Meter'
import { corruptionIndex, resolveOutcome } from '@/lib/state'

type Props = {
  deck: Ingredient[]
  seed?: string
  onComplete: (outcome: OutcomeSummary) => void
}

export default function RitualReveal({ deck, seed = 'reveal', onComplete }: Props) {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState<Ingredient[]>([])

  useEffect(() => {
    setIndex(0)
    setRevealed([])
    if (!deck || deck.length === 0) return
    const interval = 1200
    let i = 0
    const t = setInterval(() => {
      setRevealed((r: Ingredient[]) => [...r, deck[i]])
      i++
      setIndex(i)
      if (i >= deck.length) {
        clearInterval(t)
        // small delay before resolve
        setTimeout(() => {
          const outcome = resolveOutcome(deck, seed)
          onComplete(outcome)
        }, 900)
      }
    }, interval)
    return () => clearInterval(t)
  }, [deck])

  const currentCorruption = corruptionIndex(revealed)

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="flex gap-4 flex-wrap justify-center">
        {revealed.map((c: Ingredient, i: number) => (
          <div key={i}>
            <IngredientCard ingredient={c} />
          </div>
        ))}
      </div>
      <div className="w-full max-w-2xl">
        <Meter value={currentCorruption} />
      </div>
    </div>
  )
}
