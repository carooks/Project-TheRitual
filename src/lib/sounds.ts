/**
 * Sound Design System for The Ritual
 * 
 * Manages audio playback with volume control and respects user settings.
 * Uses Web Audio API for better control and performance.
 */

export type SoundEffect = 
  | 'ritual-pure'
  | 'ritual-tainted'
  | 'ritual-backfired'
  | 'phase-transition'
  | 'player-eliminated'
  | 'voting-tick'
  | 'button-click'
  | 'ambient-background';

interface SoundConfig {
  file: string;
  volume: number;
  loop?: boolean;
}

const SOUND_FILES: Record<SoundEffect, SoundConfig> = {
  'ritual-pure': { file: '/sounds/ritual-pure.mp3', volume: 0.7 },
  'ritual-tainted': { file: '/sounds/ritual-tainted.mp3', volume: 0.7 },
  'ritual-backfired': { file: '/sounds/ritual-backfired.mp3', volume: 0.8 },
  'phase-transition': { file: '/sounds/phase-transition.mp3', volume: 0.5 },
  'player-eliminated': { file: '/sounds/player-eliminated.mp3', volume: 0.6 },
  'voting-tick': { file: '/sounds/voting-tick.mp3', volume: 0.4 },
  'button-click': { file: '/sounds/button-click.mp3', volume: 0.3 },
  'ambient-background': { file: '/sounds/ambient.mp3', volume: 0.2, loop: true },
};

class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<SoundEffect, AudioBuffer> = new Map();
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private masterVolume = 1.0;
  private soundEnabled = true;
  private backgroundMusic: AudioBufferSourceNode | null = null;
  private backgroundGainNode: GainNode | null = null;

  constructor() {
    // Initialize on first user interaction (required by browsers)
    if (typeof window !== 'undefined') {
      this.loadSettings();
    }
  }

  private loadSettings() {
    const soundEnabled = localStorage.getItem('soundEnabled');
    const masterVolume = localStorage.getItem('masterVolume');
    
    this.soundEnabled = soundEnabled !== 'false';
    this.masterVolume = masterVolume ? parseFloat(masterVolume) : 1.0;
  }

  private async initAudioContext() {
    if (this.audioContext) return;
    
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Resume context on user interaction (browser requirement)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async preloadSound(sound: SoundEffect) {
    await this.initAudioContext();
    if (!this.audioContext || this.sounds.has(sound)) return;

    const config = SOUND_FILES[sound];
    try {
      const response = await fetch(config.file);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds.set(sound, audioBuffer);
    } catch (error) {
      console.warn(`Failed to load sound: ${sound}`, error);
    }
  }

  async preloadAll() {
    const soundEffects = Object.keys(SOUND_FILES) as SoundEffect[];
    await Promise.all(soundEffects.map(sound => this.preloadSound(sound)));
  }

  play(sound: SoundEffect, volumeOverride?: number) {
    if (!this.soundEnabled || !this.audioContext) return;

    const buffer = this.sounds.get(sound);
    if (!buffer) {
      console.warn(`Sound not loaded: ${sound}`);
      return;
    }

    const config = SOUND_FILES[sound];
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    source.loop = config.loop || false;

    const effectiveVolume = (volumeOverride ?? config.volume) * this.masterVolume;
    gainNode.gain.value = effectiveVolume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    this.activeSources.add(source);
    source.onended = () => {
      this.activeSources.delete(source);
    };

    source.start(0);

    // Special handling for background music
    if (sound === 'ambient-background') {
      this.backgroundMusic = source;
      this.backgroundGainNode = gainNode;
    }

    return source;
  }

  stop(source?: AudioBufferSourceNode) {
    if (source) {
      source.stop();
      this.activeSources.delete(source);
    } else {
      // Stop all active sources
      this.activeSources.forEach(s => s.stop());
      this.activeSources.clear();
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic = null;
      this.backgroundGainNode = null;
    }
  }

  fadeOutBackgroundMusic(duration = 2000) {
    if (!this.backgroundGainNode || !this.audioContext) return;

    const currentTime = this.audioContext.currentTime;
    this.backgroundGainNode.gain.linearRampToValueAtTime(
      0,
      currentTime + duration / 1000
    );

    setTimeout(() => this.stopBackgroundMusic(), duration);
  }

  fadeInBackgroundMusic(duration = 2000) {
    if (!this.audioContext || !this.backgroundGainNode) return;

    const currentTime = this.audioContext.currentTime;
    const config = SOUND_FILES['ambient-background'];
    const targetVolume = config.volume * this.masterVolume;

    this.backgroundGainNode.gain.setValueAtTime(0, currentTime);
    this.backgroundGainNode.gain.linearRampToValueAtTime(
      targetVolume,
      currentTime + duration / 1000
    );
  }

  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('masterVolume', this.masterVolume.toString());

    // Update background music volume if playing
    if (this.backgroundGainNode) {
      const config = SOUND_FILES['ambient-background'];
      this.backgroundGainNode.gain.value = config.volume * this.masterVolume;
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem('soundEnabled', enabled.toString());

    if (!enabled) {
      this.stop();
      this.stopBackgroundMusic();
    }
  }

  isSoundEnabled() {
    return this.soundEnabled;
  }

  getMasterVolume() {
    return this.masterVolume;
  }
}

// Singleton instance
export const soundManager = new SoundManager();

// Convenience hooks
export function useSoundEffects() {
  const playSound = (sound: SoundEffect, volume?: number) => {
    soundManager.play(sound, volume);
  };

  const stopSound = () => {
    soundManager.stop();
  };

  return { playSound, stopSound };
}
