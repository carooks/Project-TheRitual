// components/ExorcistPrompt.tsx
import React, { useState } from 'react'
import { Player } from '@/lib/types'

interface ExorcistPromptProps {
  canUse: boolean
  exorcistPlayer: Player
  otherPlayers: Player[]
  onSubmit: (targetId: string | null) => void
}

/**
 * Mobile UI prompt for the Exorcist's Rite of Cleansing.
 * 
 * Only visible to the Exorcist player after Round 2, after Council phase.
 * Allows targeting one player to attempt cleansing.
 */
export default function ExorcistPrompt({
  canUse,
  exorcistPlayer,
  otherPlayers,
  onSubmit,
}: ExorcistPromptProps) {
  const [selectedTarget, setSelectedTarget] = useState<string>('')

  if (!canUse) return null

  const alivePlayers = otherPlayers.filter(p => p.alive && p.id !== exorcistPlayer.id)

  const handlePerformRite = () => {
    if (!selectedTarget) {
      alert('Please select a target')
      return
    }
    onSubmit(selectedTarget)
  }

  const handleDecline = () => {
    onSubmit(null)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 border-2 border-amber-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-amber-400 mb-2">
            🕯️ Rite of Cleansing
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            You may attempt to purge the corruption from one witch.
          </p>
          <p className="text-xs text-red-400 mt-2 italic">
            Warning: If they are not corrupted, you will die.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-2 uppercase tracking-wide">
              Choose Target
            </label>
            <select
              className="w-full rounded-xl bg-zinc-900/80 border border-zinc-700 p-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-colors"
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
            >
              <option value="" disabled>
                Select a witch...
              </option>
              {alivePlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handlePerformRite}
              disabled={!selectedTarget}
            >
              ✨ Perform Rite
            </button>
            <button
              className="flex-1 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold text-sm transition-all"
              onClick={handleDecline}
            >
              Not Yet
            </button>
          </div>
        </div>

        <p className="text-xs text-zinc-500 text-center mt-4">
          This ability can only be used once per game
        </p>
      </div>
    </div>
  )
}
