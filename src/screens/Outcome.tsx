import React from 'react'
import OutcomeCard from '@/components/OutcomeCard'
import Button from '@/components/UI/Button'
import { OutcomeSummary } from '@/lib/types'

type Props = {
  outcome: OutcomeSummary
  onToCouncil: () => void
}

export default function Outcome({ outcome, onToCouncil }: Props) {
  return (
    <div className="w-full flex flex-col items-center gap-6">
      <OutcomeCard outcome={outcome} />
      <Button aria-label="To Council" onClick={onToCouncil}>To Council</Button>
    </div>
  )
}
