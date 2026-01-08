import React, { useEffect, useState } from 'react';
import { RitualOutcome } from '../lib/types';
import { soundManager } from '../lib/sounds';

interface RitualAnimationProps {
  outcome: RitualOutcome;
  onComplete: () => void;
  eliminatedPlayerName?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  moveX: number;
  moveY: number;
}

export function RitualAnimation({ outcome, onComplete, eliminatedPlayerName }: RitualAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showOutcome, setShowOutcome] = useState(false);

  useEffect(() => {
    // Play outcome-specific sound
    if (outcome === 'PURE') {
      soundManager.play('ritual-pure');
    } else if (outcome === 'TAINTED') {
      soundManager.play('ritual-tainted');
    } else if (outcome === 'BACKFIRED') {
      soundManager.play('ritual-backfired');
    }

    // Generate particles with random movement vectors
    const particleCount = 30;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.5,
      moveX: (Math.random() - 0.5) * 600, // Random X movement
      moveY: (Math.random() - 0.5) * 600, // Random Y movement
    }));
    setParticles(newParticles);

    // Show outcome text after particle animation starts
    const outcomeTimer = setTimeout(() => setShowOutcome(true), 800);

    // Trigger screen shake for BACKFIRED
    if (outcome === 'BACKFIRED') {
      document.body.classList.add('screen-shake');
      setTimeout(() => document.body.classList.remove('screen-shake'), 600);
    }

    // Complete animation after 3 seconds
    const completeTimer = setTimeout(onComplete, 3000);

    return () => {
      clearTimeout(outcomeTimer);
      clearTimeout(completeTimer);
      document.body.classList.remove('screen-shake');
    };
  }, [outcome, onComplete]);

  const outcomeConfig = {
    PURE: {
      color: '#10b981', // green-500
      gradient: 'from-green-400 to-emerald-600',
      text: '✨ RITUAL PURE ✨',
      particleColor: 'bg-green-400',
      glow: 'shadow-[0_0_40px_rgba(16,185,129,0.6)]',
    },
    TAINTED: {
      color: '#f59e0b', // amber-500
      gradient: 'from-yellow-400 to-orange-500',
      text: '⚠️ RITUAL TAINTED ⚠️',
      particleColor: 'bg-yellow-400',
      glow: 'shadow-[0_0_40px_rgba(245,158,11,0.6)]',
    },
    BACKFIRED: {
      color: '#ef4444', // red-500
      gradient: 'from-red-500 to-rose-700',
      text: '💀 RITUAL BACKFIRED 💀',
      particleColor: 'bg-red-500',
      glow: 'shadow-[0_0_60px_rgba(239,68,68,0.8)]',
    },
  };

  const config = outcomeConfig[outcome];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Particle System */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute w-3 h-3 rounded-full ${config.particleColor}`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animation: 'particle 2s ease-out forwards',
              '--move-x': `${particle.moveX}px`,
              '--move-y': `${particle.moveY}px`,
              filter: 'blur(1px)',
            } as React.CSSProperties & { '--move-x': string; '--move-y': string }}
          />
        ))}
      </div>

      {/* Outcome Text */}
      {showOutcome && (
        <div className="relative z-10 text-center animate-fade-in-scale">
          <div
            className={`text-6xl font-bold mb-8 bg-gradient-to-br ${config.gradient} bg-clip-text text-transparent ${config.glow}`}
            style={{ textShadow: `0 0 20px ${config.color}` }}
          >
            {config.text}
          </div>

          {eliminatedPlayerName && outcome === 'BACKFIRED' && (
            <div className="text-3xl text-red-300 animate-pulse">
              {eliminatedPlayerName} was eliminated!
            </div>
          )}

          {outcome === 'TAINTED' && (
            <div className="text-2xl text-yellow-200 mt-4">
              The infection spreads...
            </div>
          )}

          {outcome === 'PURE' && (
            <div className="text-2xl text-green-200 mt-4">
              The Coven remains pure!
            </div>
          )}
        </div>
      )}

      {/* Radial Glow Effect */}
      <div
        className="absolute inset-0 opacity-30 animate-pulse-glow"
        style={{
          background: `radial-gradient(circle at center, ${config.color} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

// CSS Animations (to be added to styles.css)
/*
@keyframes particle {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translate(
      calc(var(--random-x, 0) * 300px),
      calc(var(--random-y, 0) * 300px)
    ) scale(1.5);
    opacity: 0;
  }
}

@keyframes fade-in-scale {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
}

@keyframes screen-shake {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-10px, -5px); }
  20% { transform: translate(10px, 5px); }
  30% { transform: translate(-10px, 5px); }
  40% { transform: translate(10px, -5px); }
  50% { transform: translate(-10px, -5px); }
  60% { transform: translate(10px, 5px); }
  70% { transform: translate(-10px, 5px); }
  80% { transform: translate(10px, -5px); }
  90% { transform: translate(-10px, -5px); }
}

.animate-particle {
  animation: particle 2s ease-out forwards;
}

.animate-fade-in-scale {
  animation: fade-in-scale 0.6s ease-out forwards;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.screen-shake {
  animation: screen-shake 0.6s ease-in-out;
}
*/
