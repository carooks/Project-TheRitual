# Sound Files for The Ritual

This directory contains all sound effects and music for The Ritual game.

## Required Sound Files

### Ritual Outcomes
- **ritual-pure.mp3** - Positive, mystical chime sound (pure ritual success)
- **ritual-tainted.mp3** - Ominous, warning sound (tainted ritual)
- **ritual-backfired.mp3** - Dramatic, explosive failure sound (backfired ritual)

### UI Sounds
- **button-click.mp3** - Subtle click sound for button interactions
- **voting-tick.mp3** - Soft tick sound for voting actions
- **phase-transition.mp3** - Gentle transition sound between game phases

### Game Events
- **player-eliminated.mp3** - Dark, somber sound when a player is eliminated

### Ambient
- **ambient.mp3** - Looping background ambient music (dark, mystical atmosphere)

## Sound Design Guidelines

### Ritual Outcomes
- **Pure**: Bright, uplifting chimes with sparkle effects
- **Tainted**: Corrupted, warped tones with metallic undertones
- **Backfired**: Explosive, dramatic crash with reverb

### Ambient Music
- Should be dark and atmospheric
- Low volume (20% default)
- Seamlessly looping
- Mystical/occult theme
- Around 2-3 minutes in length

### UI Sounds
- Short duration (< 300ms)
- Low volume (30-40% default)
- Non-intrusive
- Satisfying feedback

## Finding/Creating Sounds

### Recommended Sources
1. **Freesound.org** - Creative Commons licensed sounds
2. **OpenGameArt.org** - Game sound effects
3. **Incompetech.com** - Royalty-free music
4. **Zapsplat.com** - Free sound effects

### Generating Sounds
You can use tools like:
- **Audacity** (free audio editor)
- **LMMS** (free music production)
- **Bfxr** (retro sound effects generator)
- **ChipTone** (8-bit sound generator)

## File Format
- **Format**: MP3 (widely supported)
- **Sample Rate**: 44.1kHz
- **Bit Rate**: 128-192 kbps
- **Channels**: Stereo (ambient) or Mono (SFX)

## Implementation Status

✅ Sound system implemented
✅ Volume controls added
✅ Settings panel integration complete
⚠️ **Sound files not yet added** - Need to source/create audio files

## Adding Sound Files

1. Place all sound files in the `public/sounds/` directory
2. Ensure file names match exactly as listed above
3. Test in-game with the Settings panel volume controls
4. Adjust default volumes in `src/lib/sounds.ts` if needed

## License Compliance

When sourcing sound files, ensure:
- You have the right to use them (CC0, CC-BY, or purchased license)
- Proper attribution is given if required
- Files are compatible with the project's MIT license

---

**Note**: The sound system is fully functional, but placeholder files are needed. The game will work without sounds - they simply won't play until files are added.
