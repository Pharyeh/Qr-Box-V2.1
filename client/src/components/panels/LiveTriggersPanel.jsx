import { useState } from 'react';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import PanelShell from '../ui/PanelShell';

export default function LiveTriggersPanel() {
  const [triggers, setTriggers] = useState([]);

  const fetchTriggers = () => {
    fetch('/api/triggers/live')
      .then(res => res.json())
      .then(data => setTriggers(data.triggers || []))
      .catch(err => console.error('[client ERROR]: Failed to fetch live triggers', err));
  };

  useAutoRefresh(fetchTriggers, 5000);

  return (
    <PanelShell title="Live Triggers">
      {triggers.length === 0 ? (
        <p className="text-gray-400">No live triggers available.</p>
      ) : (
        <ul className="space-y-2 text-sm text-white">
          {triggers.map((t, index) => (
            <li key={index} className="border-b border-gray-700 pb-1">
              <div className="flex justify-between">
                <span className="font-medium">{t.symbol}</span>
                <span className="text-gray-400">{new Date(t.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="text-blue-300">{t.type} — {t.confidence}% confidence</div>
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  );
}
