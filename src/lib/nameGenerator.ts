/**
 * Witchy Name Generator for The Ritual
 * Generates mystical witch names based on player input
 */

const PREFIXES = [
  'Shadow', 'Raven', 'Moon', 'Night', 'Crimson', 'Dark', 'Mystic', 'Silent',
  'Wicked', 'Twilight', 'Grim', 'Elder', 'Ancient', 'Cursed', 'Blood',
  'Hex', 'Spirit', 'Phantom', 'Witch', 'Spell', 'Coven', 'Ember'
]

const SUFFIXES = [
  'whisper', 'claw', 'shade', 'veil', 'thorn', 'bane', 'weaver', 'walker',
  'heart', 'eye', 'fang', 'wing', 'breath', 'song', 'spell', 'witch',
  'keeper', 'binder', 'caller', 'seeker', 'speaker', 'dancer'
]

const TITLES = [
  'the Enchanted', 'the Cursed', 'the Mysterious', 'the Shadowed', 'the Wicked',
  'the Eternal', 'the Arcane', 'the Bewitched', 'the Veiled', 'the Moonlit',
  'the Forgotten', 'the Haunted', 'the Sinister', 'the Enigmatic', 'the Mystical'
]

// NSFW additions (optional, toggled by user)
const NSFW_PREFIXES = [
  'Naughty', 'Sinful', 'Lustful', 'Wanton', 'Seductive', 'Sultry', 'Forbidden',
  'Devilish', 'Scandalous', 'Tempting', 'Provocative', 'Kinky', 'Filthy', 
  'Dirty', 'Horny', 'Slutty', 'Nasty', 'Freaky', 'Pervy', 'Raunchy',
  'Big Dick', 'Thicc', 'Daddy', 'Mommy', 'Busty', 'Hung', 'Juicy',
  'Thicc Ass', 'Big Titty', 'Hot', 'Sexy', 'Stacked', 'Packing'
]

const NSFW_SUFFIXES = [
  'desire', 'pleasure', 'temptress', 'lover', 'seducer', 'charmer', 'vixen',
  'slut', 'hoe', 'whore', 'minx', 'tart', 'floozy', 'wench', 'trollop',
  'skank', 'thot', 'hussie', 'horndog', 'pervert', 'daddy', 'mommy',
  'chaddy', 'zaddy', 'baddie', 'snack', 'dilf', 'milf', 'king', 'queen'
]

const NSFW_TITLES = [
  'the Seductive', 'the Naughty', 'the Scandalous', 'the Irresistible',
  'the Provocative', 'the Alluring', 'the Sultry', 'the Slutty', 'the Horny',
  'the Kinky', 'the Filthy', 'the Dirty', 'the Freaky', 'the Nasty',
  'the Raunchy', 'the Perverted', 'the Promiscuous', 'the Shameless',
  'the Depraved', 'the Licentious', 'the Lewd', 'the Vulgar', 'the Thicc',
  'Big Dick Energy', 'Absolute Snack', 'Certified Baddie', 'Total Daddy',
  'Straight Fire', 'Pure Chaos', 'Unhinged', 'Built Different'
]

/**
 * Simple hash function to convert string to number
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Generate a witchy name based on input
 */
export function generateWitchyName(input: string, nsfw: boolean = false, variationOffset: number = 0): string {
  if (!input || input.trim().length === 0) {
    return ''
  }

  const cleanInput = input.trim()
  const hash = hashString(cleanInput)
  
  // Select arrays based on NSFW setting
  const prefixArray = nsfw ? [...PREFIXES, ...NSFW_PREFIXES] : PREFIXES
  const suffixArray = nsfw ? [...SUFFIXES, ...NSFW_SUFFIXES] : SUFFIXES
  const titleArray = nsfw ? [...TITLES, ...NSFW_TITLES] : TITLES

  const offsetSeed = variationOffset * 131
  
  // Use different parts of hash for selection
  const prefixIndex = Math.abs((hash + offsetSeed) % prefixArray.length)
  const suffixIndex = Math.abs(((hash >> 8) + offsetSeed) % suffixArray.length)
  const titleIndex = Math.abs(((hash >> 16) + offsetSeed) % titleArray.length)
  
  // Get first letter of input for variation
  const firstChar = cleanInput[0].toLowerCase()
  const charCode = firstChar.charCodeAt(0)
  
  // Decide format based on character code
  const format = (charCode + variationOffset) % 6
  
  switch (format) {
    case 0:
      // Format: "Prefix Name"
      return `${prefixArray[prefixIndex]} ${cleanInput}`
    case 1:
      // Format: "Name the Title"
      return `${cleanInput} ${titleArray[titleIndex]}`
    case 2:
      // Format: "Prefix Name Suffix"
      return `${prefixArray[prefixIndex]} ${cleanInput} ${suffixArray[suffixIndex]}`
    case 3:
      // Format: "Name of the Suffix"
      return `${cleanInput} of the ${suffixArray[suffixIndex]}`
    case 4:
      // Format: "Title Name"
      return `${titleArray[titleIndex]} ${cleanInput}`
    case 5:
    default:
      // Format: "Prefix Namesuffix Title"
      return `${prefixArray[prefixIndex]} ${cleanInput}${suffixArray[suffixIndex]} ${titleArray[titleIndex]}`
  }
}

/**
 * Generate multiple variations for user to choose from
 */
export function generateWitchyNameVariations(input: string, nsfw: boolean = false, count: number = 3): string[] {
  const variations: string[] = []
  const desiredCount = Math.max(1, count)
  let offset = 0

  while (variations.length < desiredCount && offset < desiredCount + 10) {
    const name = generateWitchyName(input, nsfw, offset)
    if (name && !variations.includes(name)) {
      variations.push(name)
    }
    offset += 1
  }

  return variations
}
