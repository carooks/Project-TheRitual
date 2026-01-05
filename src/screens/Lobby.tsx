import React from 'react'
import Banner from '@/components/UI/Banner'
import Button from '@/components/UI/Button'
import { UI } from '@/lib/strings'
import { ROLE_IDS } from '@/lib/roles'
import { Player } from '@/lib/types'
import { createRng } from '@/lib/rng'

type Props = {
  onBegin: (players: Player[]) => void
}

export default function Lobby({ onBegin }: Props) {
  function makePlayers(n = 9) {
    const rng = createRng('players')
    const players: Player[] = []
    for (let i = 0; i < n; i++) {
      const rid = ROLE_IDS[Math.floor(rng() * ROLE_IDS.length)]
      players.push({ id: `p${i + 1}`, name: `Player ${i + 1}`, roleId: rid })
    }
    return players
  }

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="lobby-title-screen">
        <img 
          src="/assets/backgrounds/title-screen.png" 
          alt="The Ritual"
          className="title-screen-image"
        />
      </div>
      <div className="card large-card text-center">
        <p className="text-gray-300 mb-4">A social-deduction coven game — local demo only.</p>
        <Button aria-label="Begin Game" onClick={() => onBegin(makePlayers(9))} label={UI.beginGame} />
      </div>
    </div>
  )
}
