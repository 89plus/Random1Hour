import { useState, useRef } from 'react';
import type { Task } from '../App';
import './Roulette.css';

interface Props {
  tasks: Task[];
  onResult: (task: Task) => void;
}

export function Roulette({ tasks, onResult }: Props) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [result, setResult] = useState<Task | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playClickSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  const playResultSound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.2);
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.3);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  };

  const handleStart = () => {
    if (tasks.length === 0) return;
    
    initAudio();
    setIsSpinning(true);
    setResult(null);

    const spinDuration = 3000; // 3 seconds
    const intervalTime = 100;
    let elapsed = 0;
    
    const timer = setInterval(() => {
      elapsed += intervalTime;
      const randomIdx = Math.floor(Math.random() * tasks.length);
      setCurrentIndex(randomIdx);
      playClickSound();

      if (elapsed >= spinDuration) {
        clearInterval(timer);
        setIsSpinning(false);
        const finalTask = tasks[Math.floor(Math.random() * tasks.length)];
        setCurrentIndex(tasks.indexOf(finalTask));
        setResult(finalTask);
        playResultSound();
        onResult(finalTask);
      }
    }, intervalTime);
  };

  return (
    <div className="glass-panel roulette-container">
      <div className={`roulette-display ${isSpinning ? 'spinning' : ''}`}>
        {tasks.length === 0 ? (
          <span className="roulette-placeholder">抽選箱が空です</span>
        ) : result ? (
          <span className="roulette-result">{result.text}</span>
        ) : currentIndex >= 0 ? (
          <span className="roulette-item">{tasks[currentIndex].text}</span>
        ) : (
          <span className="roulette-placeholder">Ready...</span>
        )}
      </div>
      <button 
        className="roulette-btn" 
        onClick={handleStart} 
        disabled={isSpinning || tasks.length === 0}
      >
        {isSpinning ? '抽選中...' : 'ガチャを回す！'}
      </button>
    </div>
  );
}
