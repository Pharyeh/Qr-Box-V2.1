import { useEffect, useState } from 'react';

export default function PhaseWatchlistPanel() {
  const [phase2, setPhase2] = useState([]);
  const [phase4, setPhase4] = useState([]);

  useEffect(() => {
    fetch('/api/phaseWatchlist')
      .then(res => res.json())
      .then(data => {
        if (data.phase2) setPhase2(data.phase2);
        if (data.phase4) setPhase4(data.phase4);
      })
      .catch(err => console.error('[client ERROR]: Failed to fetch phase watchlist', err));
  }, []);

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-3 text-white">Phase Watchlist</h2>

      <div>
        <h3 className="text-sm font-medium text-green-400 mb-1">Phase 2 Candidates</h3>
        {phase2.length === 0 ? (
          <p className="text-gray-400 text-sm">No Phase 2 setups.</p>
        ) : (
          <ul className="space-y-1 mb-4">
            {phase2.map((item, idx) => (
              <li key={idx} className="text-sm text-white border-b border-gray-700 pb-1">
                <div className="flex justify-between">
                  <span>{item.symbol}</span>
                  <span>{item.confidence}%</span>
                </div>
                <div className="text-xs text-gray-400">{item.description}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-red-400 mb-1">Phase 4 Candidates</h3>
        {phase4.length === 0 ? (
          <p className="text-gray-400 text-sm">No Phase 4 setups.</p>
        ) : (
          <ul className="space-y-1">
            {phase4.map((item, idx) => (
              <li key={idx} className="text-sm text-white border-b border-gray-700 pb-1">
                <div className="flex justify-between">
                  <span>{item.symbol}</span>
                  <span>{item.confidence}%</span>
                </div>
                <div className="text-xs text-gray-400">{item.description}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
