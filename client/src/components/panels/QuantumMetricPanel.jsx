import { useEffect, useState } from 'react';

export default function QuantumMetricPanel() {
  const [quantum, setQuantum] = useState([]);

  useEffect(() => {
    fetch('/api/quantumMetrics')
      .then(res => res.json())
      .then(data => {
        if (data.metrics) setQuantum(data.metrics);
      })
      .catch(err => console.error('[client ERROR]: Failed to fetch quantum metrics', err));
  }, []);

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2 text-white">Quantum Metrics</h2>
      {quantum.length === 0 ? (
        <p className="text-gray-400">No quantum metrics available.</p>
      ) : (
        <ul className="space-y-2 text-sm text-white">
          {quantum.map((item, idx) => (
            <li key={idx} className="border-b border-gray-700 pb-1">
              <div className="flex justify-between">
                <span className="font-medium">{item.symbol}</span>
                <span className="text-gray-400">{item.timestamp && new Date(item.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="text-blue-300">{item.signal} — {item.probability}% likelihood</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
