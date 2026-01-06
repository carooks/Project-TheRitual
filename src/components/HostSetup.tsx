import { useState } from 'react'

interface HostSetupProps {
  onSubmit: (hostName: string) => void
  onCancel: () => void
}

export function HostSetup({ onSubmit, onCancel }: HostSetupProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit(name.trim())
  }

  return (
    <div className="mode-selection" role="dialog" aria-label="Host setup">
      <div className="mode-selection__content" style={{ maxWidth: 420 }}>
        <div className="mode-selection__header">
          <div className="mode-selection__title">Name Your Witch</div>
          <p className="text-gray-300 text-center mt-2">
            This name identifies you to everyone in the coven.
          </p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter host name"
            maxLength={20}
            className="w-full rounded-lg border-2 border-amber-400 bg-slate-900 px-4 py-3 text-lg text-white focus:outline-none focus:ring-4 focus:ring-amber-200"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border-2 border-slate-600 px-4 py-3 text-base font-semibold text-slate-300"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-[1.5] rounded-lg border-2 border-emerald-400 bg-emerald-400 px-4 py-3 text-base font-semibold text-slate-950 disabled:cursor-not-allowed disabled:border-slate-600 disabled:bg-slate-700 disabled:text-slate-400"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
