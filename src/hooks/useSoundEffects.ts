import { useEffect, useCallback } from 'react';
import { soundManager, SoundEffect } from '../lib/sounds';
import { Phase } from '../lib/types';

/**
 * Hook for playing sound effects in The Ritual game
 */
export function useSoundEffects() {
  // Initialize and preload sounds on mount
  useEffect(() => {
    // Preload all sounds in the background
    soundManager.preloadAll().catch(err => {
      console.warn('Failed to preload sounds:', err);
    });

    // Start ambient background music if sounds are enabled
    if (soundManager.isSoundEnabled()) {
      soundManager.play('ambient-background');
    }

    // Cleanup: fade out background music on unmount
    return () => {
      soundManager.fadeOutBackgroundMusic(1000);
    };
  }, []);

  const playSound = useCallback((sound: SoundEffect, volume?: number) => {
    soundManager.play(sound, volume);
  }, []);

  const stopAllSounds = useCallback(() => {
    soundManager.stop();
  }, []);

  const toggleSound = useCallback(() => {
    const newState = !soundManager.isSoundEnabled();
    soundManager.setSoundEnabled(newState);
    
    if (newState) {
      // Restart background music when re-enabled
      soundManager.play('ambient-background');
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    soundManager.setMasterVolume(volume);
  }, []);

  return {
    playSound,
    stopAllSounds,
    toggleSound,
    setVolume,
    isSoundEnabled: soundManager.isSoundEnabled(),
    masterVolume: soundManager.getMasterVolume(),
  };
}

/**
 * Hook for playing phase transition sounds
 */
export function usePhaseTransitionSound(currentPhase: Phase) {
  const { playSound } = useSoundEffects();

  useEffect(() => {
    // Play transition sound when phase changes
    playSound('phase-transition');
  }, [currentPhase, playSound]);
}

/**
 * Hook for playing button click sounds
 */
export function useButtonSound() {
  const { playSound } = useSoundEffects();

  return useCallback(() => {
    playSound('button-click');
  }, [playSound]);
}
