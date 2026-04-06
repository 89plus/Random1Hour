import { useState, useEffect } from 'react';
import { TaskBox } from './components/TaskBox';
import { History } from './components/History';
import { Roulette } from './components/Roulette';
import { Timer } from './components/Timer';
import { ChoiceBox } from './components/ChoiceBox';
import { DailyThemeEditor } from './components/DailyThemeEditor';
import { ThemeDrawOverlay } from './components/ThemeDrawOverlay';

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

export interface DailyTask {
  id: string;
  text: string;
}

export type Theme = 'default' | 'cyberpunk' | 'mint' | 'sunset' | 'ocean';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentView, setCurrentView] = useState<'main' | 'history'>('main');
  const [theme, setTheme] = useState<Theme>('default');

  // Daily Theme States
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [selectedDailyTheme, setSelectedDailyTheme] = useState<DailyTask | null>(null);
  const [showThemeDraw, setShowThemeDraw] = useState(false);
  const [showDailyEditor, setShowDailyEditor] = useState(false);

  // New States for expanded features
  const [activeMission, setActiveMission] = useState<Task | null>(null);
  const [pendingChoices, setPendingChoices] = useState<Task[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('r1h_tasks');
    const savedHistory = localStorage.getItem('r1h_history');
    const savedTheme = localStorage.getItem('r1h_theme') as Theme;
    const savedActive = localStorage.getItem('r1h_active');
    const savedDailyTasks = localStorage.getItem('r1h_daily_tasks');
    const savedSelectedDaily = localStorage.getItem('r1h_selected_daily');
    const lastVisited = localStorage.getItem('r1h_last_visited');

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedTheme) setTheme(savedTheme);
    if (savedActive) setActiveMission(JSON.parse(savedActive));
    if (savedDailyTasks) setDailyTasks(JSON.parse(savedDailyTasks));

    const todayStr = new Date().toLocaleDateString('ja-JP');

    // Check if it's a new day
    if (lastVisited !== todayStr) {
      // New day! Clear previous selection
      setSelectedDailyTheme(null);
      localStorage.removeItem('r1h_selected_daily');
      localStorage.setItem('r1h_last_visited', todayStr);
    } else if (savedSelectedDaily) {
      setSelectedDailyTheme(JSON.parse(savedSelectedDaily));
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('r1h_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('r1h_daily_tasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  useEffect(() => {
    if (selectedDailyTheme) {
      localStorage.setItem('r1h_selected_daily', JSON.stringify(selectedDailyTheme));
    } else {
      localStorage.removeItem('r1h_selected_daily');
    }
  }, [selectedDailyTheme]);

  useEffect(() => {
    localStorage.setItem('r1h_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('r1h_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (activeMission) {
      localStorage.setItem('r1h_active', JSON.stringify(activeMission));
    } else {
      localStorage.removeItem('r1h_active');
    }
  }, [activeMission]);

  // Common handler for task selection (from Roulette, ChoiceBox, or TaskBox)
  const handleSelectTask = (task: Task) => {
    const newHistoryItem: HistoryItem = {
      id: crypto.randomUUID(),
      taskId: task.id,
      taskText: task.text,
      timestamp: Date.now()
    };
    setHistory(prev => [...prev, newHistoryItem]);
    setActiveMission(task);
    setPendingChoices([]); // Clear choices after selection
  };

  const startTripleChoice = () => {
    if (tasks.length < 3) {
      alert('3択モードには少なくとも3つのタスクを登録してください');
      return;
    }
    // Randomly pick 3 unique tasks
    const shuffled = [...tasks].sort(() => 0.5 - Math.random());
    setPendingChoices(shuffled.slice(0, 3));
    setActiveMission(null);
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
        <div className="header-main">
          <h1>Random 1 Hour</h1>
          <p>次の行動をランダムで決めよう</p>
        </div>
        <div className="theme-selector glass-panel">
          <label>Theme:</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            <option value="default">Default Blue</option>
            <option value="cyberpunk">Cyberpunk</option>
            <option value="mint">Fresh Mint</option>
            <option value="sunset">Sunset Glow</option>
            <option value="ocean">Deep Ocean</option>
          </select>
        </div>
        <div className="header-actions">
          <button className="sub-btn daily-btn" onClick={() => setShowDailyEditor(true)}>
            📅 デイリーテーマ設定
          </button>
        </div>
      </header>

      {selectedDailyTheme && (
        <section className="daily-theme-banner">
          <div className="daily-banner-content">
            <span className="daily-banner-label">Today's Daily Theme</span>
            <h2 className="daily-banner-text">{selectedDailyTheme.text}</h2>
          </div>
          <div className="daily-banner-decoration"></div>
        </section>
      )}

      {!selectedDailyTheme && dailyTasks.length > 0 && (
        <section className="daily-ritual-prompt glass-panel" onClick={() => setShowThemeDraw(true)}>
          <div className="ritual-prompt-content">
            <span className="ritual-sparkle">✨</span>
            <div className="ritual-text-wrap">
              <h3>本日のテーマを決めよう</h3>
              <p>今日のテーマの抽選を開始する</p>
            </div>
          </div>
          <button className="ritual-start-btn">抽選スタート</button>
        </section>
      )}

      {!selectedDailyTheme && dailyTasks.length === 0 && (
        <section className="daily-ritual-prompt glass-panel empty" onClick={() => setShowDailyEditor(true)}>
          <div className="ritual-prompt-content">
            <span className="ritual-sparkle">📅</span>
            <div className="ritual-text-wrap">
              <h3>今日のテーマを登録しよう</h3>
              <p>1日の指針となるテーマをリストに追加してください</p>
            </div>
          </div>
          <button className="ritual-start-btn">設定を開く</button>
        </section>
      )}

      {activeMission && (
        <section className="active-mission-banner glass-panel">
          <div className="mission-content">
            <span className="mission-label">Current Mission</span>
            <h2 className="mission-text">{activeMission.text}</h2>
          </div>
          <button className="complete-btn" onClick={() => setActiveMission(null)}>完了 / 閉じる</button>
        </section>
      )}

      <main className="app-main">
        {currentView === 'main' ? (
          <div className="main-layout">
            <div className="main-col">
              {pendingChoices.length > 0 ? (
                <ChoiceBox
                  choices={pendingChoices}
                  allTasks={tasks}
                  onSelect={handleSelectTask}
                  onCancel={() => setPendingChoices([])}
                />
              ) : (
                <Roulette
                  tasks={tasks}
                  onResult={handleSelectTask}
                  onTripleChoice={startTripleChoice}
                  theme={theme}
                />
              )}
              <TaskBox tasks={tasks} setTasks={setTasks} history={history} onSelect={handleSelectTask} />
            </div>
            <div className="main-col">
              <Timer />
              <History
                history={todayHistory}
                onClear={clearHistory}
                onShowAll={() => setCurrentView('history')}
              />
            </div>
          </div>
        ) : (
          <History
            history={history}
            onClear={clearHistory}
            onBack={() => setCurrentView('main')}
            isFullPage={true}
          />
        )}
      </main>

      {showThemeDraw && (
        <ThemeDrawOverlay
          themes={dailyTasks}
          onSelect={(theme) => {
            setSelectedDailyTheme(theme);
            setShowThemeDraw(false);
          }}
        />
      )}

      {showDailyEditor && (
        <DailyThemeEditor
          dailyTasks={dailyTasks}
          onUpdate={setDailyTasks}
          onClose={() => setShowDailyEditor(false)}
        />
      )}
    </div>
  );
}

export default App;
