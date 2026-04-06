import { useState, useRef } from 'react';
import type { Task, Theme } from '../App';
import confetti from 'canvas-confetti';
import './Roulette.css';

interface Props {
  tasks: Task[];
  onResult: (task: Task) => void;
  onTripleChoice: () => void;
  theme: Theme;
}

export function Roulette({ tasks, onResult, onTripleChoice, theme }: Props) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<Task | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const spinningRef = useRef(false);
  const currentRotationRef = useRef(0);

  // テーマごとの色設定
  const getThemeColors = () => {
    switch (theme) {
      case 'cyberpunk': return ['#f43f5e', '#fbbf24', '#8b5cf6', '#06b6d4', '#10b981'];
      case 'mint': return ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669'];
      case 'sunset': return ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ea580c'];
      case 'ocean': return ['#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#0284c7'];
      default: return ['#2563eb', '#60a5fa', '#93c5fd', '#bfdbfe', '#1d4ed8'];
    }
  };

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playTickSound = (volume = 0.1) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  const playVictorySound = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.4);
    });
  };

  const handleStart = () => {
    if (tasks.length === 0 || isSpinning) return;

    initAudio();
    setIsSpinning(true);
    setResult(null);
    spinningRef.current = true;

    const extraSpins = 5 + Math.random() * 5;
    const targetRotation = currentRotationRef.current + extraSpins * 360 + Math.random() * 360;
    const duration = 4000;
    const startTimestamp = performance.now();
    const startRotation = currentRotationRef.current;

    let lastTickAngle = 0;
    const segmentAngle = 360 / tasks.length;

    const animate = (now: number) => {
      const elapsed = now - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function: Cubic Out
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const currentRotation = startRotation + (targetRotation - startRotation) * easeOut(progress);

      setRotation(currentRotation);
      currentRotationRef.current = currentRotation;

      // Tension Shake Logic (Starts when progress > 0.8)
      if (progress > 0.8 && progress < 1) {
        const shakeIntensity = (progress - 0.8) * 10;
        const offset = (Math.random() - 0.5) * shakeIntensity;
        setRotation(currentRotation + offset);
      }

      // Tick sound logic
      const normalizedRotation = (currentRotation % 360);
      if (Math.abs(normalizedRotation - lastTickAngle) >= segmentAngle) {
        playTickSound(0.05);
        lastTickAngle = normalizedRotation;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        spinningRef.current = false;
        setIsSpinning(false);

        // Calculate result
        const finalRotation = (currentRotation % 360);
        const index = Math.floor(((360 - finalRotation) % 360) / segmentAngle);
        const winIndex = (index + tasks.length) % tasks.length;
        const wonTask = tasks[winIndex];

        setResult(wonTask);
        playVictorySound();
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: getThemeColors()
        });
        onResult(wonTask);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleQuickPick = () => {
    if (tasks.length === 0 || isSpinning) return;
    initAudio();
    const wonTask = tasks[Math.floor(Math.random() * tasks.length)];
    setResult(wonTask);
    playVictorySound();
    confetti({
      particleCount: 50,
      spread: 40,
      origin: { y: 0.6 },
      colors: getThemeColors()
    });
    onResult(wonTask);
  };

  const renderSegments = () => {
    if (tasks.length === 0) return null;
    const colors = getThemeColors();
    const segmentAngle = 360 / tasks.length;

    return tasks.map((task, i) => {
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;

      // Convert degrees to radians
      const startRad = (startAngle - 90) * Math.PI / 180;
      const endRad = (endAngle - 90) * Math.PI / 180;

      const x1 = 225 + 215 * Math.cos(startRad);
      const y1 = 225 + 215 * Math.sin(startRad);
      const x2 = 225 + 215 * Math.cos(endRad);
      const y2 = 225 + 215 * Math.sin(endRad);

      const largeArcFlag = segmentAngle > 180 ? 1 : 0;
      const pathData = tasks.length === 1
        ? `M 225 10 A 215 215 0 1 1 224.99 10 Z`
        : `M 225 225 L ${x1} ${y1} A 215 215 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      return (
        <g key={task.id}>
          <path
            d={pathData}
            fill={colors[i % colors.length]}
            stroke="white"
            strokeWidth="2"
          />
          {tasks.length <= 15 && (
            <text
              x={225 + 130 * Math.cos((startRad + endRad) / 2)}
              y={225 + 130 * Math.sin((startRad + endRad) / 2)}
              fill="white"
              fontSize="18"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${(startAngle + endAngle) / 2}, ${225 + 130 * Math.cos((startRad + endRad) / 2)}, ${225 + 130 * Math.sin((startRad + endRad) / 2)})`}
            >
              {task.text.length > 10 ? task.text.substring(0, 9) + '...' : task.text}
            </text>
          )}
        </g>
      );
    });
  };

  return (
    <div className="glass-panel roulette-container">
      <div className="wheel-wrapper">
        <div className="wheel-pointer"></div>
        <svg
          viewBox="0 0 450 450"
          className="roulette-wheel"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <circle cx="225" cy="225" r="220" fill="var(--wheel-bg)" stroke="var(--border-color)" strokeWidth="2" />
          {renderSegments()}
          <circle cx="225" cy="225" r="25" fill="white" stroke="var(--border-color)" strokeWidth="2" />
        </svg>
      </div>

      <div className={`roulette-info ${result ? 'has-result' : ''}`}>
        {tasks.length === 0 ? (
          <span className="roulette-placeholder">行動を追加してください</span>
        ) : result ? (
          <div className="result-display">
            <span className="result-label">当選！</span>
            <span className="result-text">{result.text}</span>
          </div>
        ) : (
          <span className="roulette-placeholder">ルーレットを回そう</span>
        )}
      </div>

      <div className="roulette-actions">
        <button
          className="roulette-btn main-btn"
          onClick={handleStart}
          disabled={isSpinning || tasks.length === 0}
        >
          {isSpinning ? '抽選中...' : 'ガチャを回す！'}
        </button>
        <div className="secondary-actions">
          <button
            className="roulette-btn sub-btn"
            onClick={onTripleChoice}
            disabled={isSpinning || tasks.length < 3}
            title="ランダムに3つの選択肢を表示"
          >
            ランダムな3択
          </button>
          <button
            className="roulette-btn sub-btn"
            onClick={handleQuickPick}
            disabled={isSpinning || tasks.length === 0}
            title="ルーレットの演出をスキップ"
          >
            クイック決定
          </button>
        </div>
      </div>
    </div>
  );
}
