import React from 'react'
import { motion } from 'framer-motion'

type Props = {
  value: number
  label?: string
}

export default function Meter({ value, label = 'Corruption' }: Props) {
  const pct = Math.round(value * 100)
  const isDangerous = value > 0.7
  
  return (
    <div aria-label={label} className="corruption-meter">
      <div className="corruption-meter__header">
        <span className="corruption-meter__label">{label}</span>
        <span className={`corruption-meter__value ${isDangerous ? 'corruption-meter__value--danger' : ''}`}>
          {pct}%
        </span>
      </div>
      <div className="corruption-meter__track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`corruption-meter__fill ${isDangerous ? 'corruption-meter__fill--danger' : ''}`}
        >
          {isDangerous && <div className="corruption-meter__pulse" />}
        </motion.div>
      </div>
    </div>
  )
}
