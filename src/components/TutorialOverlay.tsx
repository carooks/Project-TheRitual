import React, { useEffect, useState } from "react";

type TutorialSlide = {
  id: number;
  title: string;
  body: string;
};

const TUTORIAL_SLIDES: TutorialSlide[] = [
  {
    id: 1,
    title: "🌙 Welcome to The Ritual",
    body:
      "You are witches gathered in a secret Circle, bound by ancient pacts. The Coven seeks to channel pure magic and survive together. But the Hollow—a parasitic void—has infected some among you. It spreads through corruption, feeding on death and chaos. Your survival depends on rooting out the infected before they destroy you all.",
  },
  {
    id: 2,
    title: "📱 Your Phone is Your Secret Grimoire",
    body:
      "Your phone is completely private—only you can see your role, your ingredient choices, and any visions you receive. The TV screen shows information visible to everyone. This creates the game's tension: you can claim anything aloud (truth or lies), but your phone reveals the truth to you alone. Use this asymmetry wisely.",
  },
  {
    id: 3,
    title: "🔄 The Ritual Rounds",
    body:
      "Each round follows a strict pattern: (1) DISCUSS who should perform the ritual. (2) VOTE to nominate the Performer. (3) Everyone SELECTS AN INGREDIENT to add to the cauldron. (4) The ritual RESOLVES—pure, tainted, or catastrophic. (5) The Performer may gain a POWER. (6) The Council votes to BURN one witch. Strategy evolves as corruption accumulates.",
  },
  {
    id: 4,
    title: "🧪 Ingredients Shape Fate",
    body:
      "Every ingredient has a corruption value and effects. Protective herbs (Mandrake Root, Tears of the Moon) calm the ritual. Divination items (Eye of Newt, Silver Thread) reveal alignments. Dark reagents (Shadow Ash, Blood of the Innocent) fuel corruption and death. The Hollow players will try to poison the cauldron while appearing helpful. Study the ingredients and watch for patterns.",
  },
  {
    id: 5,
    title: "💀 Death is Not the End of Your Influence",
    body:
      "If you die, you can no longer speak or vote—but the chaos or order you've created persists. Dead Coven members weaken the group. Dead Hollow agents remove corruption sources. The game ends when one side dominates: all Hollow agents eliminated (Coven wins) or Hollow reaches critical mass through deaths and corruption (Hollow wins).",
  },
  {
    id: 6,
    title: "🎭 Trust People, Not Magic",
    body:
      "Ritual outcomes can mislead. Corruption, ingredient effects, and role powers create information—but it can be distorted, incomplete, or manipulated. A 'pure' ritual might hide a Hex Witch's poison. A vision might be blocked by Iron Thorn. Success depends on reading behavior: who pushes for dangerous ingredients? Who deflects suspicion? Who claims credit for successes? Deduction wins games.",
  },
  {
    id: 7,
    title: "⚡ Role Powers Are Key",
    body:
      "Your role defines your strategy. Protection Witches shield the Performer from death. Oracles gain visions of player alignments after successful rituals. Chroniclers track patterns. The Exorcist can attempt a risky cleansing. Hex Witches corrupt from the shadows. Harbingers amplify chaos. Mimics disguise their poison as beneficial magic. Master your role—and deduce others'.",
  },
  {
    id: 8,
    title: "🔥 The Council of Flames",
    body:
      "After each ritual, the Council votes to burn one witch. This is your primary weapon against the Hollow—but also your greatest risk. Burn a Coven member by mistake, and you strengthen the Hollow. Majority vote decides who burns (you can SKIP to avoid killing without evidence). The Hollow will manipulate these votes to eliminate threats and sow distrust. Vote wisely.",
  },
];

export interface TutorialOverlayProps {
  /** Called when the last slide finishes OR user hits Skip */
  onComplete: () => void;
  /** Optional: how many milliseconds before auto-advancing slides */
  autoAdvanceMs?: number;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({
  onComplete,
  autoAdvanceMs = 10000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isManualAdvance, setIsManualAdvance] = useState(false);

  const currentSlide = TUTORIAL_SLIDES[currentIndex];

  useEffect(() => {
    if (isManualAdvance) return;

    const timer = setTimeout(() => {
      if (currentIndex < TUTORIAL_SLIDES.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onComplete();
      }
    }, autoAdvanceMs);

    return () => clearTimeout(timer);
  }, [currentIndex, autoAdvanceMs, isManualAdvance, onComplete]);

  const handleNext = () => {
    setIsManualAdvance(true);
    if (currentIndex < TUTORIAL_SLIDES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const totalSlides = TUTORIAL_SLIDES.length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        background: 'radial-gradient(ellipse at center, rgba(76, 29, 149, 0.4) 0%, rgba(0, 0, 0, 0.95) 70%)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          maxWidth: '700px',
          width: '100%',
          background: 'linear-gradient(135deg, rgba(20, 10, 40, 0.98) 0%, rgba(40, 15, 60, 0.98) 100%)',
          border: '2px solid',
          borderImage: 'linear-gradient(135deg, #d4af37 0%, #8b5cf6 50%, #d4af37 100%) 1',
          borderRadius: '16px',
          boxShadow: '0 0 60px rgba(212, 175, 55, 0.3), inset 0 0 40px rgba(139, 92, 246, 0.2)',
          padding: '32px',
          position: 'relative',
        }}
      >
        {/* Mystical corner ornaments */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          fontSize: '20px',
          opacity: 0.6,
        }}>✦</div>
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          fontSize: '20px',
          opacity: 0.6,
        }}>✦</div>
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          fontSize: '20px',
          opacity: 0.6,
        }}>✦</div>
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          fontSize: '20px',
          opacity: 0.6,
        }}>✦</div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#a78bfa',
          marginBottom: '20px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(167, 139, 250, 0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-block',
              height: '8px',
              width: '8px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #d4af37 0%, #8b5cf6 100%)',
              boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)',
            }} />
            <span style={{ fontFamily: 'serif', letterSpacing: '1px' }}>Ancient Teachings</span>
          </div>
          <span style={{ fontFamily: 'serif' }}>
            Scroll {currentIndex + 1} of {totalSlides}
          </span>
        </div>

        <h2 style={{
          fontSize: '28px',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #d4af37 0%, #a78bfa 50%, #d4af37 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '20px',
          fontFamily: 'serif',
          textAlign: 'center',
          textShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
        }}>
          {currentSlide.title}
        </h2>

        <p style={{
          fontSize: '15px',
          color: '#e9d5ff',
          lineHeight: '1.8',
          marginBottom: '24px',
          textAlign: 'justify',
          fontFamily: 'Georgia, serif',
        }}>
          {currentSlide.body}
        </p>

        <div style={{
          marginTop: '20px',
          height: '6px',
          background: 'rgba(20, 10, 30, 0.8)',
          borderRadius: '3px',
          overflow: 'hidden',
          border: '1px solid rgba(167, 139, 250, 0.3)',
        }}>
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #d4af37 0%, #8b5cf6 50%, #d4af37 100%)',
              transition: 'width 0.3s ease',
              width: `${((currentIndex + 1) / totalSlides) * 100}%`,
              boxShadow: '0 0 10px rgba(212, 175, 55, 0.6)',
            }}
          />
        </div>

        <div style={{
          marginTop: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}>
          <button
            type="button"
            onClick={handleSkip}
            style={{
              fontSize: '14px',
              color: '#a78bfa',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'serif',
              textDecoration: 'underline',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#a78bfa'}
          >
            Skip ritual preparations
          </button>

          <button
            type="button"
            onClick={handleNext}
            style={{
              padding: '12px 28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              border: '2px solid #d4af37',
              fontSize: '16px',
              color: '#fff',
              fontWeight: 'bold',
              fontFamily: 'serif',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.5), inset 0 0 10px rgba(212, 175, 55, 0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.8), inset 0 0 15px rgba(212, 175, 55, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.5), inset 0 0 10px rgba(212, 175, 55, 0.3)'
            }}
          >
            {currentIndex < totalSlides - 1 ? "Continue →" : "⚡ Begin the Ritual"}
          </button>
        </div>
      </div>
    </div>
  );
};
