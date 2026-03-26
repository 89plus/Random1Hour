import { useState, useEffect } from 'react';
import { TaskBox } from './components/TaskBox';
import { History } from './components/History';
import { Roulette } from './components/Roulette';
import { Timer } from './components/Timer';

export interface Task {
  id: string;
  text: string;
}

export interface HistoryItem {
  id: string;
  taskId?: string;
  taskText: string;
  timestamp: number;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentView, setCurrentView] = useState<'main' | 'history'>('main');

  // Load from LocalStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('r1h_tasks');
    const savedHistory = localStorage.getItem('r1h_history');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('r1h_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('r1h_history', JSON.stringify(history));
  }, [history]);

  const handleRouletteResult = (task: Task) => {
    const newHistoryItem: HistoryItem = {
      id: crypto.randomUUID(),
      taskId: task.id,
      taskText: task.text,
      timestamp: Date.now()
    };
    setHistory(prev => [...prev, newHistoryItem]);
  };

  const clearHistory = () => {
    if (window.confirm('すべての履歴を削除してもよろしいですか？')) {
      setHistory([]);
    }
  };

  const todayStr = new Date().toLocaleDateString('ja-JP');
  const todayHistory = history.filter(item => 
    new Date(item.timestamp).toLocaleDateString('ja-JP') === todayStr
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Random 1 Hour</h1>
        <p>次の1時間を決める運命のガチャ</p>
      </header>
      <main className="app-main">
        {currentView === 'main' ? (
          <>
            <Roulette tasks={tasks} onResult={handleRouletteResult} />
            <Timer />
            <TaskBox tasks={tasks} setTasks={setTasks} />
            <History 
              history={todayHistory} 
              onClear={clearHistory} 
              onShowAll={() => setCurrentView('history')} 
            />
          </>
        ) : (
          <History 
            history={history} 
            onClear={clearHistory} 
            onBack={() => setCurrentView('main')} 
            isFullPage={true} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
