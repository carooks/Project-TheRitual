import React, { useEffect, useState } from "react";

type TutorialSlide = {
  id: number;
  title: string;
  body: string;
};

const TUTORIAL_SLIDES: TutorialSlide[] = [
  {
    id: 1,
    title: "Welcome to The Ritual",
    body:
      "You are witches of the Circle. Some of you are loyal to the coven. Some harbor the Hollow in secret. Your task is to survive the rituals and expose the corrupted.",
  },
  {
    id: 2,
    title: "Your Phone is Your Grimoire",
    body:
      "Your phone is private. It shows your role, your choices, and your secrets. You can say whatever you want aloud — truth or lie. The TV is for shared information.",
  },
  {
    id: 3,
    title: "Each Round",
    body:
      "Each round you will: (1) Discuss. (2) Choose a Performer. (3) Cast ingredients into the cauldron. (4) Watch what happens. (5) Decide who must burn at the Council.",
  },
  {
    id: 4,
    title: "Ingredients Matter",
    body:
      "Some ingredients calm or protect the ritual. Others twist it, hurt the Circle, or help the Hollow spread. Your choices shape the corruption in the cauldron.",
  },
  {
    id: 5,
    title: "Death and Silence",
    body:
      "If you die, you are out of the discussion — but the state you leave the Circle in still matters. Too many wrong deaths, and the Hollow wins.",
  },
  {
    id: 6,
    title: "Trust the People, Not the Magic",
    body:
      "Ritual omens can mislead. Infection, moonfire, and cleansing all warp what you see. The Ritual is about reading people — not blindly trusting the magic.",
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
      className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center"
    >
      <div
        className="max-w-2xl w-[90%] bg-zinc-900/95 border border-zinc-700 rounded-2xl shadow-2xl px-6 py-6 md:px-8 md:py-8 flex flex-col gap-4"
      >
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>Quick Tutorial</span>
          </div>
          <span>
            Step {currentIndex + 1} / {totalSlides}
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-semibold text-zinc-100">
          {currentSlide.title}
        </h2>

        <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
          {currentSlide.body}
        </p>

        <div className="mt-2 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${((currentIndex + 1) / totalSlides) * 100}%` }}
          />
        </div>

        <div className="mt-4 flex justify-between items-center gap-3">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs md:text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Skip tutorial
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm md:text-base text-white font-semibold transition-colors"
          >
            {currentIndex < totalSlides - 1 ? "Next" : "Begin the Ritual"}
          </button>
        </div>
      </div>
    </div>
  );
};
