import type { HistoryItem } from '../App';
import './History.css';

interface Props {
  history: HistoryItem[];
}

export function History({ history }: Props) {
  const formatDateTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    
    // Check if it's today
    const isToday = d.getDate() === now.getDate() && 
                    d.getMonth() === now.getMonth() && 
                    d.getFullYear() === now.getFullYear();

    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    const timeStr = `${h}:${m}`;

    if (isToday) {
      return timeStr;
    } else {
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${month}/${day} ${timeStr}`;
    }
  };

  return (
    <div className="glass-panel history-container">
      <h2>抽選履歴 (History)</h2>
      <ul className="history-list">
        {history.slice().sort((a,b)=>b.timestamp - a.timestamp).map(item => (
          <li key={item.id} className="history-item">
            <span className="history-time">{formatDateTime(item.timestamp)}</span>
            <span className="history-text">{item.taskText}</span>
          </li>
        ))}
        {history.length === 0 && (
          <li className="empty-msg">履歴はありません</li>
        )}
      </ul>
    </div>
  );
}
