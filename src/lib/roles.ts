import { RoleId } from './types'
import { INGREDIENTS } from './ingredients'

export const ROLES: Record<RoleId, { id: RoleId; name: string; pool: string[] }> = {
  protection: {
    id: 'protection',
    name: 'Protection Witch',
    pool: ['mandrake_root', 'tears_of_the_moon', 'candle_wax']
  },
  oracle: { id: 'oracle', name: 'Oracle Witch', pool: ['eye_of_newt', 'bone_dust', 'silver_thread'] },
  chronicler: { id: 'chronicler', name: 'Chronicler Witch', pool: ['raven_feather', 'bone_dust'] },
  hex: { id: 'hex', name: 'Hex Witch', pool: ['blood_of_the_innocent', 'raven_feather', 'bone_dust'] },
  harbinger: { id: 'harbinger', name: 'Harbinger Witch', pool: ['candle_wax', 'shadow_ash', 'iron_thorn'] },
  mimic: { id: 'mimic', name: 'Mimic Witch', pool: ['silver_thread', 'tears_of_the_moon'] }
}

export const ROLE_IDS = Object.keys(ROLES) as RoleId[]
