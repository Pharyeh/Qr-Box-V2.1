import { useState } from 'react';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import PanelShell from '../ui/PanelShell';

export default function TradeLogsPanel() {
  const [logs, setLogs] = useState([]);

  const fetchLogs = () => {
    fetch('/api/tradeLogs')
      .then(res => res.json())
      .then(data => setLogs(data.trades || []))
      .catch(err => console.error('[client ERROR]: Failed to fetch trade logs', err));
  };

  useAutoRefresh(fetchLogs, 5000);

  return (
    <PanelShell title="Trade Logs">
      {logs.length === 0 ? (
        <p className="text-gray-400">No trades logged yet.</p>
      ) : (
        <ul className="space-y-2 text-sm text-white">
          {logs.map((log, idx) => (
            <li key={idx} className="border-b border-gray-700 pb-1">
              <div className="flex justify-between font-medium">
                <span>{log.symbol}</span>
                <span className="text-gray-400">{log.timestamp && new Date(log.timestamp).toLocaleString()}</span>
              </div>
              <div className="text-blue-300">{log.type} — {log.notes || 'No notes'}</div>
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  );
}
