import React, { useState } from 'react'
import RitualReveal from '@/components/RitualReveal'
import { Ingredient, OutcomeSummary } from '@/lib/types'

type Props = {
  deck: Ingredient[]
  onComplete: (outcome: OutcomeSummary) => void
}

export default function Reveal({ deck, onComplete }: Props) {
  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="card large-card">
        <h2 className="text-xl font-bold mb-6">Reveal</h2>
        <RitualReveal deck={deck} onComplete={onComplete} />
      </div>
    </div>
  )
}
