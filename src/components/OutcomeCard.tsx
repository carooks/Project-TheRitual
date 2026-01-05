import React from 'react'
import { OutcomeSummary, OutcomeState } from '@/lib/types'

function stateColor(state: OutcomeState) {
  switch (state) {
    case OutcomeState.PURE:
      return 'bg-green-600'
    case OutcomeState.TAINTED:
      return 'bg-yellow-600'
    case OutcomeState.BACKFIRED:
      return 'bg-red-600'
  }
}

export default function OutcomeCard({ outcome }: { outcome: OutcomeSummary }) {
  const color = stateColor(outcome.state)
  return (
    <div className={`card large-card ${color} p-6`}> 
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{outcome.state}</h2>
        <div className="text-sm opacity-90">Corruption: {(outcome.corruption * 100).toFixed(0)}%</div>
      </div>
      <div className="mt-4 text-gray-100">{outcome.dominant ? `${outcome.dominant.name} looms.` : 'No dominant sign.'}</div>
      <div className="mt-4 flex gap-2">
        {outcome.amplified && <span className="pill">Amplified</span>}
        {outcome.spite && <span className="pill">Spite Death</span>}
      </div>
      <div className="mt-6 flex gap-3">
        <div className="text-sm">Deaths: {outcome.deaths}</div>
      </div>
    </div>
  )
}
