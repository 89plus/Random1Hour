import { useState, useEffect } from 'react';
import type { Task } from '../App';
import './ChoiceBox.css';

interface Props {
  choices: Task[];
  allTasks: Task[];
  onSelect: (task: Task) => void;
  onCancel: () => void;
}

export function ChoiceBox({ choices, allTasks, onSelect, onCancel }: Props) {
  const [stoppedIndices, setStoppedIndices] = useState<number[]>([]);

  useEffect(() => {
    // 順次停止させるタイマー（1番目、2番目、3番目と少しずつ遅らせる）
    const timers = [
      setTimeout(() => setStoppedIndices(prev => [...prev, 0]), 1000),
      setTimeout(() => setStoppedIndices(prev => [...prev, 1]), 1800),
      setTimeout(() => setStoppedIndices(prev => [...prev, 2]), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="glass-panel choicebox-container scale-up">
      <div className="choicebox-header">
        <span className="choicebox-badge">The Destiny Triple</span>
        <h3>運命の3択</h3>
        <p>提示された3つの候補から1つ選ぶ</p>
      </div>

      <div className="choices-grid">
        {choices.map((task, index) => (
          <SlotCard
            key={task.id}
            index={index}
            finalTask={task}
            allTasks={allTasks}
            isStopped={stoppedIndices.includes(index)}
            onSelect={() => onSelect(task)}
          />
        ))}
      </div>

      <div className="choicebox-footer">
        <button className="choicebox-cancel" onClick={onCancel} disabled={stoppedIndices.length < 3}>
          抽選に戻る
        </button>
      </div>
    </div>
  );
}

function SlotCard({ index, finalTask, allTasks, isStopped, onSelect }: {
  index: number, finalTask: Task, allTasks: Task[], isStopped: boolean, onSelect: () => void
}) {
  const [displayTask, setDisplayTask] = useState<Task>(allTasks[0] || finalTask);

  useEffect(() => {
    if (isStopped) {
      setDisplayTask(finalTask);
      return;
    }

    // スロットのように高速でタスク名を切り替える
    const interval = setInterval(() => {
      const filtered = allTasks.length > 1 ? allTasks.filter(t => t.id !== finalTask.id) : allTasks;
      const randomTask = filtered[Math.floor(Math.random() * filtered.length)];
      setDisplayTask(randomTask);
    }, 80);

    return () => clearInterval(interval);
  }, [isStopped, allTasks, finalTask]);

  return (
    <button
      className={`choice-card reel-card ${isStopped ? 'is-stopped' : 'is-spinning'}`}
      onClick={onSelect}
      disabled={!isStopped}
    >
      <div className="choice-number">{index + 1}</div>
      <div className="reel-mask">
        <div className="reel-content">
          <span className="choice-text">{displayTask.text}</span>
        </div>
      </div>
      {isStopped && <div className="choice-hover-hint">これにする</div>}
    </button>
  );
}
