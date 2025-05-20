import { useEffect, useState } from 'react';

export default function EdgeDecayTracker() {
  const [decayingSignals, setDecayingSignals] = useState([]);

  useEffect(() => {
    fetch('/api/edgeDecayTracker')
      .then(res => res.json())
      .then(data => {
        if (data.decay) setDecayingSignals(data.decay);
      })
      .catch(err => console.error('[client ERROR]: Failed to fetch decay signals', err));
  }, []);

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2 text-white">Edge Decay Tracker</h2>
      {decayingSignals.length === 0 ? (
        <p className="text-gray-400">No active decaying signals.</p>
      ) : (
        <ul className="space-y-2">
          {decayingSignals.map((sig, index) => (
            <li key={index} className="border-b border-gray-700 pb-1 text-sm">
              <div className="flex justify-between text-white">
                <span className="font-medium">{sig.symbol}</span>
                <span className="text-gray-400">{new Date(sig.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="text-blue-300">{sig.reason} — Decay: {sig.decayPercent}%</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
