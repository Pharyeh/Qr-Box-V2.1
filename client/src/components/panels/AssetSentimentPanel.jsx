import { useEffect, useState } from 'react';

export default function AssetSentimentPanel() {
  const [sentiments, setSentiments] = useState({});

  useEffect(() => {
    fetch('/api/assetSentiment')
      .then(res => res.json())
      .then(data => {
        if (data.sentiments) setSentiments(data.sentiments);
      })
      .catch(err => console.error('[client ERROR]: Failed to fetch sentiments', err));
  }, []);

  const getColor = (bias) => {
    if (bias === 'bullish') return 'text-green-400';
    if (bias === 'bearish') return 'text-red-400';
    return 'text-yellow-300';
  };

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2">Asset Sentiment</h2>
      {Object.entries(sentiments).length === 0 ? (
        <p className="text-gray-400">No sentiment data available.</p>
      ) : (
        <ul className="space-y-2">
          {Object.entries(sentiments).map(([symbol, { bias, score }]) => (
            <li key={symbol} className="flex justify-between border-b border-gray-700 pb-1">
              <span className="font-medium text-white">{symbol}</span>
              <span className={`${getColor(bias)} font-semibold`}>
                {bias} ({score}%)
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
