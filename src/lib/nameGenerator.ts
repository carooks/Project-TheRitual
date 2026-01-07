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

// Crazy/Creative additions - Always enabled!
const CRAZY_PREFIXES = [
  'Naughty', 'Sinful', 'Lustful', 'Wanton', 'Seductive', 'Sultry', 'Forbidden',
  'Devilish', 'Scandalous', 'Tempting', 'Provocative', 'Kinky', 'Filthy', 
  'Dirty', 'Horny', 'Slutty', 'Nasty', 'Freaky', 'Pervy', 'Raunchy',
  'Big Dick', 'Thicc', 'Daddy', 'Mommy', 'Busty', 'Hung', 'Juicy',
  'Thicc Ass', 'Big Titty', 'Hot', 'Sexy', 'Stacked', 'Packing',
  'Unhinged', 'Feral', 'Goblin', 'Chaos', 'Crackhead', 'Cryptid',
  'Psycho', 'Deranged', 'Fridge-Raiding', 'Vodka-Chugging', 'Meth-Head',
  'Cocaine', 'Wine Mom', 'Drunk', 'Stoned', 'Blazed', 'High As Fuck',
  'Absolutely Wasted', 'Blackout', 'Sloshed', 'Trashed', 'Turnt',
  'Zooted', 'Geeked', 'Lit', 'Fucked Up', 'Gone', 'Twisted',
  'Cheeks Clapping', 'Ass Eating', 'Sussy', 'Sus', 'Breedable', 'Submissive',
  'Dominant', 'Switch', 'Bottom', 'Top', 'Bratty', 'Feral Raccoon',
  'Dumpster Diving', 'Cursed', 'Cringe', 'Based', 'Ratio', 'L+Ratio',
  'Maidenless', 'No Bitches', 'Touch Grass', 'Terminally Online'
]

const CRAZY_SUFFIXES = [
  'desire', 'pleasure', 'temptress', 'lover', 'seducer', 'charmer', 'vixen',
  'slut', 'hoe', 'whore', 'minx', 'tart', 'floozy', 'wench', 'trollop',
  'skank', 'thot', 'hussie', 'horndog', 'pervert', 'daddy', 'mommy',
  'chaddy', 'zaddy', 'baddie', 'snack', 'dilf', 'milf', 'king', 'queen',
  'goblin', 'gremlin', 'menace', 'disaster', 'chaos-bringer', 'destroyer',
  'fucker', 'muncher', 'consumer', 'devourer', 'inhaler', 'snorter',
  'sipper', 'chugger', 'muncher', 'chomper', 'sucker', 'licker',
  'clapper', 'slapper', 'destroyer', 'obliterator', 'annihilator',
  'fiend', 'addict', 'enthusiast', 'enjoyer', 'consumer', 'connoisseur',
  'stan', 'simp', 'worshipper', 'devotee', 'fanatic'
]

const CRAZY_TITLES = [
  'the Seductive', 'the Naughty', 'the Scandalous', 'the Irresistible',
  'the Provocative', 'the Alluring', 'the Sultry', 'the Slutty', 'the Horny',
  'the Kinky', 'the Filthy', 'the Dirty', 'the Freaky', 'the Nasty',
  'the Raunchy', 'the Perverted', 'the Promiscuous', 'the Shameless',
  'the Depraved', 'the Licentious', 'the Lewd', 'the Vulgar', 'the Thicc',
  'Big Dick Energy', 'Absolute Snack', 'Certified Baddie', 'Total Daddy',
  'Straight Fire', 'Pure Chaos', 'Unhinged', 'Built Different',
  'No Thoughts Head Empty', 'Goblin Mode Activated', 'Feral Energy',
  'Crackhead Vibes', 'Menace to Society', 'Chaotic Neutral',
  'Chronically Online', 'Touch Grass Challenge Failed', 'Down Bad',
  'Maidenless Behavior', 'Zero Rizz', 'Negative Aura', 'NPC Energy',
  'Main Character Syndrome', 'Plot Armor', 'Protagonist Energy',
  'Villain Arc', 'Redemption Arc Pending', 'Cancelled',
  'Ratio + L', 'Skill Issue', 'Cope + Seethe', 'Mald + Cope',
  'Peak Performance', 'Gigachad Mode', 'Sigma Grindset',
  'Blunt Rotation Approved', '420 Blazing', 'Higher Than God',
  'Zooted Beyond Recognition', 'Blackout Legend', 'Liquid Courage Champion',
  'Vodka Aunt Energy', 'Wine Mom Vibes', 'Tequila Makes Me Crazy',
  'Horny Jail Escapee', 'Bonk Resistant', 'Down Astronomically',
  'Submissive and Breedable', 'Dommy Mommy', 'Service Top Energy',
  'Power Bottom Extraordinaire', 'Switch Supremacy', 'Bratty Sub Vibes',
  'Daddy Issues Personified', 'Mommy Issues Manifested', 'Therapy Needed',
  'Red Flag Collection', 'Walking Disaster', 'Hot Mess Express',
  'Trainwreck Incoming', 'Disaster Bisexual', 'Useless Lesbian Energy',
  'Himbo Supreme', 'Bimbo Icon', 'Disaster Gay Vibes'
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
export function generateWitchyName(input: string, nsfw: boolean = true, variationOffset: number = 0): string {
  if (!input || input.trim().length === 0) {
    return ''
  }

  const cleanInput = input.trim()
  const hash = hashString(cleanInput)
  
  // Always use crazy mode! Combine normal and crazy arrays
  const prefixArray = [...PREFIXES, ...CRAZY_PREFIXES]
  const suffixArray = [...SUFFIXES, ...CRAZY_SUFFIXES]
  const titleArray = [...TITLES, ...CRAZY_TITLES]

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
export function generateWitchyNameVariations(input: string, nsfw: boolean = true, count: number = 4): string[] {
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
