import { useState, useEffect } from 'react';
import type { DailyTask } from '../App';
import confetti from 'canvas-confetti';
import './ThemeDrawOverlay.css';

interface Props {
  themes: DailyTask[];
  onSelect: (theme: DailyTask) => void;
}

export function ThemeDrawOverlay({ themes, onSelect }: Props) {
  const [shuffledThemes, setShuffledThemes] = useState<DailyTask[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Pick 3 random themes for the cards
    const shuffled = [...themes].sort(() => 0.5 - Math.random()).slice(0, 3);
    setShuffledThemes(shuffled);

    const timer = setTimeout(() => setIsAnimating(false), 800);
    return () => clearTimeout(timer);
  }, [themes]);

  const handleCardClick = (index: number) => {
    if (selectedIndex !== null || isRevealed) return;

    setSelectedIndex(index);
    setIsRevealed(true);

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Wait a bit before closing the overlay
    setTimeout(() => {
      onSelect(shuffledThemes[index]);
    }, 2500);
  };

  return (
    <div className="theme-draw-overlay">
      <div className="draw-content">
        <header className="draw-header">
          <h1 className="draw-title">本日のテーマを決めよう</h1>
          <p className="draw-desc">{shuffledThemes.length}枚のカードから、今日のあなたのテーマが決定されます。</p>
        </header>

        <div className={`cards-container ${isAnimating ? 'animating' : ''}`}>
          {shuffledThemes.map((theme, i) => (
            <div
              key={theme.id}
              className={`mystery-card ${selectedIndex === i ? 'selected' : ''} ${isRevealed ? 'revealed' : ''}`}
              onClick={() => handleCardClick(i)}
            >
              <div className="card-inner">
                <div className="card-front">
                  <div className="card-pattern">?</div>
                </div>
                <div className="card-back">
                  <div className="theme-result-content">
                    <span className="result-label">本日のテーマ</span>
                    <h2 className="result-theme-text">{theme.text}</h2>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
