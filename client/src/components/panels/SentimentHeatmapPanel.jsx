import { useEffect, useState } from 'react';

export default function SentimentHeatmapPanel() {
  const [heatmap, setHeatmap] = useState([]);

  useEffect(() => {
    fetch('/api/sentimentHeatmap')
      .then(res => res.json())
      .then(data => {
        if (data.heatmap) setHeatmap(data.heatmap);
      })
      .catch(err => console.error('[client ERROR]: Failed to fetch sentiment heatmap', err));
  }, []);

  const getColor = (score) => {
    if (score > 66) return 'bg-green-500';
    if (score > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2 text-white">Sentiment Heatmap</h2>
      {heatmap.length === 0 ? (
        <p className="text-gray-400">No sentiment heatmap data available.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {heatmap.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded text-center text-white shadow-md ${getColor(item.score)}`}
            >
              <div className="font-semibold">{item.symbol}</div>
              <div className="text-sm">{item.bias} ({item.score}%)</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
