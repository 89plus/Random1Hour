import React, { useState } from 'react';
import type { Task } from '../App';
import './TaskBox.css';

interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export function TaskBox({ tasks, setTasks }: Props) {
  const [inputText, setInputText] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: inputText.trim()
    }
    setTasks([...tasks, newTask]);
    setInputText('');
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="glass-panel taskbox-container">
      <h2>抽選Box（行動登録）</h2>
      <p className="taskbox-desc">ガチャガチャに入れる「次の1時間でやること」を追加してください。</p>
      
      <form className="taskbox-form" onSubmit={handleAdd}>
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="例: 読書、プログラミング、掃除..."
        />
        <button type="submit">追加</button>
      </form>

      <ul className="task-list">
        {tasks.map(task => (
          <li key={task.id} className="task-item">
            <span className="task-text">{task.text}</span>
            <button className="delete-btn" onClick={() => handleDelete(task.id)}>×</button>
          </li>
        ))}
        {tasks.length === 0 && (
          <li className="empty-msg">タスクが登録されていません</li>
        )}
      </ul>
    </div>
  );
}
