import { useState, useEffect, useRef } from 'react';
import './Timer.css';

const WORK_TIME = 60 * 60; // 60 minutes
const BREAK_TIME = 5 * 60; // 5 minutes

export function Timer() {
  const [timeLeft, setTimeLeft] = useState(WORK_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isWorkMode, setIsWorkMode] = useState(true);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const endTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // 許可リクエスト
    if (window.Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playAlarmSound = () => {
    initAudio();
    const ctx = audioCtxRef.current!;
    if (ctx.state === 'suspended') ctx.resume();

    const playBeep = (time: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.1);
    };

    const now = ctx.currentTime;
    playBeep(now);
    playBeep(now + 0.2);
    playBeep(now + 0.4);
    playBeep(now + 0.6);
  };

  const showNotification = (title: string, body: string) => {
    if (window.Notification && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (!endTimeRef.current) return;
        
        const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remaining);

        if (remaining <= 0) {
          setIsActive(false);
          endTimeRef.current = null;
          playAlarmSound();
          
          setIsWorkMode(prevMode => {
            const nextMode = !prevMode;
            setTimeLeft(nextMode ? WORK_TIME : BREAK_TIME);
            if (prevMode) {
              showNotification("1時間経過！", "お疲れ様です。5分間の休憩に入りましょう。");
            } else {
              showNotification("休憩終了！", "さあ、次の1時間のタスクを抽選しましょう。");
            }
            return nextMode;
          });
        }
      }, 500); // 1秒未満の間隔でチェックしてズレを防止
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const toggleTimer = () => {
    initAudio(); 
    if (!isActive) {
      // 再開または開始時：現在の時刻＋残り時間で終了予定時刻を設定
      endTimeRef.current = Date.now() + timeLeft * 1000;
      setIsActive(true);
    } else {
      // 一時停止時：終了予定時刻をクリア
      setIsActive(false);
      endTimeRef.current = null;
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    endTimeRef.current = null;
    setTimeLeft(isWorkMode ? WORK_TIME : BREAK_TIME);
  };

  const switchMode = () => {
    setIsActive(false);
    endTimeRef.current = null;
    const newMode = !isWorkMode;
    setIsWorkMode(newMode);
    setTimeLeft(newMode ? WORK_TIME : BREAK_TIME);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progressPercent = 100 - (timeLeft / (isWorkMode ? WORK_TIME : BREAK_TIME)) * 100;

  return (
    <div className={`glass-panel timer-container ${!isWorkMode ? 'break-mode' : ''}`}>
      <div className="timer-header">
        <h2>{isWorkMode ? '集中タイム (1 Hour)' : '休けいタイム (5 Min)'}</h2>
        <button className="mode-switch-btn" onClick={switchMode}>
          切替
        </button>
      </div>

      <div className="timer-circle-wrap">
        <svg className="timer-circle" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" className="timer-circle-bg" />
          <circle 
            cx="60" cy="60" r="54" 
            className="timer-circle-progress" 
            strokeDasharray="339.292" 
            strokeDashoffset={339.292 - (339.292 * progressPercent) / 100} 
          />
        </svg>
        <div className="timer-text">{formatTime(timeLeft)}</div>
      </div>

      <div className="timer-controls">
        <button className="timer-btn primary" onClick={toggleTimer}>
          {isActive ? '一時停止' : 'スタート'}
        </button>
        <button className="timer-btn secondary" onClick={resetTimer}>
          リセット
        </button>
      </div>
    </div>
  );
}
