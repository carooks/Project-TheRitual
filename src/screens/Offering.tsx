import React from 'react'
import Button from '@/components/UI/Button'
import { Player } from '@/lib/types'
import { ROLES } from '@/lib/roles'

type Props = {
  players: Player[]
  onProceed: () => void
}

export default function Offering({ players, onProceed }: Props) {
  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="card large-card">
        <h2 className="text-xl font-bold mb-4">Offering</h2>
        <p className="text-gray-300 mb-4">Each player chooses an ingredient from their role's pool.</p>
        <div className="flex gap-2 flex-wrap">
          {players.map((p) => {
            const role = ROLES[p.roleId]
            return (
              <div key={p.id} className="pill">
                {p.name} ({role.name})
              </div>
            )
          })}
        </div>
        <div className="mt-6">
          <Button aria-label="Proceed to Reveal" onClick={onProceed}>Proceed to Reveal</Button>
        </div>
      </div>
    </div>
  )
}
