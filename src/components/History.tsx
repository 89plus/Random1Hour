import { useState } from 'react';
import type { HistoryItem } from '../App';
import './History.css';

interface Props {
  history: HistoryItem[];
  onClear: () => void;
  onShowAll?: () => void;
  onBack?: () => void;
  isFullPage?: boolean;
}

export function History({ history, onClear, onShowAll, onBack, isFullPage }: Props) {
  const [openDates, setOpenDates] = useState<Record<string, boolean>>(() => {
    const today = new Date().toLocaleDateString('ja-JP');
    return { [today]: true };
  });

  const toggleDate = (date: string) => {
    setOpenDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const formatTime = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.getHours().toString().padStart(2, '0') + ':' + 
           d.getMinutes().toString().padStart(2, '0');
  };

  // Grouping logic
  const grouped = history.reduce((acc, item) => {
    const date = new Date(item.timestamp).toLocaleDateString('ja-JP');
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  // Sort dates descending
  const sortedDates = Object.keys(grouped).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className={`glass-panel history-container ${isFullPage ? 'history-full-page' : ''}`}>
      <div className="history-header">
        <div className="history-header-left">
          {onBack && (
            <button className="back-btn" onClick={onBack}>
              ← メインへ戻る
            </button>
          )}
          <h2>{isFullPage ? 'すべての履歴 (All History)' : '今日の履歴 (Today)'}</h2>
        </div>
        <div className="history-header-right">
          {onShowAll && (
            <button className="show-all-btn" onClick={onShowAll}>過去の履歴を見る</button>
          )}
          {history.length > 0 && isFullPage && (
            <button className="clear-btn" onClick={onClear}>一括削除</button>
          )}
        </div>
      </div>

      <div className="history-scroll-area">
        {sortedDates.map(date => {
          const items = grouped[date].sort((a, b) => b.timestamp - a.timestamp);
          const isOpen = !!openDates[date];
          
          return (
            <div key={date} className={`history-group ${isOpen ? 'is-open' : ''}`}>
              <button className="group-header" onClick={() => toggleDate(date)}>
                <span className="group-date">{date}</span>
                <span className="group-count">{items.length}件</span>
                <span className="group-arrow">{isOpen ? '▼' : '▶'}</span>
              </button>
              
              {isOpen && (
                <ul className="history-list">
                  {items.map(item => (
                    <li key={item.id} className="history-item">
                      <span className="history-time">{formatTime(item.timestamp)}</span>
                      <span className="history-text">{item.taskText}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        {history.length === 0 && (
          <div className="empty-msg">履歴はありません</div>
        )}
      </div>
    </div>
  );
}
