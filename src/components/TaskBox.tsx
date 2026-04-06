import React, { useState } from 'react';
import type { Task, HistoryItem } from '../App';
import { TaskSuggestions } from './TaskSuggestions';
import './TaskBox.css';

interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  history: HistoryItem[];
  onSelect: (task: Task) => void;
}

export function TaskBox({ tasks, setTasks, history, onSelect }: Props) {
  const [inputText, setInputText] = useState('');

  const handleAddString = (text: string) => {
    if (!text.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim()
    }
    setTasks([...tasks, newTask]);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddString(inputText);
    setInputText('');
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="glass-panel taskbox-container">
      <div className="taskbox-header">
        <h2>ルーレットに行動を登録</h2>
      </div>

      <form className="taskbox-form" onSubmit={handleAdd}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="例: 読書、プログラミング、掃除..."
        />
        <button type="submit" className="add-btn">追加</button>
      </form>

      <TaskSuggestions history={history} onAdd={handleAddString} />

      <div className="task-list-section">
        <h3>現在の抽選候補 ({tasks.length})</h3>
        <ul className="task-list">
          {tasks.map(task => (
            <li key={task.id} className="task-item">
              <span className="task-text">{task.text}</span>
              <div className="task-item-actions">
                <button
                  className="select-item-btn"
                  onClick={() => onSelect(task)}
                  title="ルーレットなしで決定"
                >
                  決定
                </button>
                <button className="delete-btn" onClick={() => handleDelete(task.id)}>×</button>
              </div>
            </li>
          ))}
          {tasks.length === 0 && (
            <li className="empty-msg">行動が登録されていません</li>
          )}
        </ul>
      </div>
    </div>
  );
}
