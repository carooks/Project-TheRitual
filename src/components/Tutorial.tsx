import { useState, useEffect } from 'react';
import Button from './UI/Button';

interface TutorialStep {
  title: string;
  content: string;
  image?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Welcome to The Ritual',
    content: 'You are part of a secret council performing a powerful ritual. But beware—some among you serve the Hollow, seeking to corrupt the ritual from within.',
  },
  {
    title: 'Sacred vs Hollow',
    content: 'Sacred players want the ritual to succeed (PURE). Hollow players want it to fail (TAINTED or BACKFIRED). Your faction is secret—trust no one!',
  },
  {
    title: 'Choosing Ingredients',
    content: 'Each round, select an ingredient from your hand. All choices are revealed simultaneously. The ritual needs the right balance to succeed.',
  },
  {
    title: 'Ritual Outcomes',
    content: '🟢 PURE: Perfect ritual (Sacred wins)\n🟡 TAINTED: Flawed ritual (1+ infection chance)\n🔴 BACKFIRED: Failed ritual (Hollow advantage)\n\nThe game ends when 3 outcomes of any type occur.',
  },
  {
    title: 'Optional Mechanics',
    content: 'Infection: TAINTED/BACKFIRED can convert Sacred → Hollow\nCorruption: After TAINTED, 1-2 ingredients become corrupted\n\nThe host enables these before starting.',
  },
  {
    title: 'Discussion Phase',
    content: 'After each ritual, discuss suspicions with other players. Use the chat to coordinate, accuse, or defend yourself. Pay attention to patterns!',
  },
  {
    title: 'Winning',
    content: 'Sacred: Achieve 3 PURE outcomes\nHollow: Achieve 3 BACKFIRED outcomes or convert enough Sacred players via infection\n\nGood luck, and may the best faction win!',
  },
];

export function Tutorial({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('tutorialCompleted', 'true');
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
      }}
      role="dialog"
      aria-labelledby="tutorial-title"
      aria-modal="true"
    >
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(76, 29, 149, 0.95) 0%, rgba(30, 30, 60, 0.95) 100%)',
          border: '2px solid rgba(212, 175, 55, 0.6)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.9)',
        }}
      >
        {/* Progress indicator */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ 
            display: 'flex', 
            gap: '8px',
            marginBottom: '8px',
          }}>
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: '4px',
                  background: index <= currentStep 
                    ? 'linear-gradient(90deg, #d4af37, #b8941f)'
                    : 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '2px',
                  transition: 'background 0.3s',
                }}
                aria-hidden="true"
              />
            ))}
          </div>
          <p style={{ 
            color: 'rgba(200, 190, 170, 0.7)',
            fontSize: '12px',
            textAlign: 'center',
            margin: 0,
          }}>
            Step {currentStep + 1} of {tutorialSteps.length}
          </p>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '32px' }}>
          <h2
            id="tutorial-title"
            style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#d4af37',
              marginBottom: '16px',
              textAlign: 'center',
              fontFamily: 'Georgia, serif',
            }}
          >
            {step.title}
          </h2>
          <p
            style={{
              color: '#e9d5ff',
              fontSize: '16px',
              lineHeight: '1.6',
              whiteSpace: 'pre-line',
              textAlign: 'center',
            }}
          >
            {step.content}
          </p>
        </div>

        {/* Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '12px',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={handleSkip}
            style={{
              background: 'transparent',
              color: 'rgba(200, 190, 170, 0.7)',
              border: 'none',
              padding: '10px 20px',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Skip Tutorial
          </button>

          <div style={{ display: 'flex', gap: '12px' }}>
            {currentStep > 0 && (
              <Button
                onClick={handlePrevious}
                variant="secondary"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNext}
              variant="primary"
            >
              {currentStep === tutorialSteps.length - 1 ? "Let's Play!" : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('tutorialCompleted');
    if (!completed) {
      setShowTutorial(true);
    }
  }, []);

  const resetTutorial = () => {
    localStorage.removeItem('tutorialCompleted');
    setShowTutorial(true);
  };

  return {
    showTutorial,
    setShowTutorial,
    resetTutorial,
  };
}
