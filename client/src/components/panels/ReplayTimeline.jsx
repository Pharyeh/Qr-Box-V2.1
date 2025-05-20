import { useState } from 'react';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import PanelShell from '../ui/PanelShell';

export default function ReplayTimeline() {
  const [events, setEvents] = useState([]);

  const fetchTimeline = () => {
    fetch('/api/replayTimeline')
      .then(res => res.json())
      .then(data => setEvents(data.timeline || []))
      .catch(err => console.error('[client ERROR]: Failed to fetch replay timeline', err));
  };

  useAutoRefresh(fetchTimeline, 5000);

  return (
    <PanelShell title="Replay Timeline">
      {events.length === 0 ? (
        <p className="text-gray-400">No replay events found.</p>
      ) : (
        <ul className="space-y-2 text-sm text-white">
          {events.map((evt, idx) => (
            <li key={idx} className="border-b border-gray-700 pb-1">
              <div className="flex justify-between">
                <span className="font-medium">{evt.symbol}</span>
                <span className="text-gray-400">{new Date(evt.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="text-blue-300">{evt.phase} — {evt.description}</div>
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  );
}
