import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export default function ConfidenceTrendChart() {
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetch('/api/confidence/trend')
      .then(res => res.json())
      .then(data => {
        if (data.trend) setTrendData(data.trend);
      })
      .catch(err => console.error('[client ERROR]: Failed to fetch confidence trend', err));
  }, []);

  const chartData = {
    labels: trendData.map(item => new Date(item.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Confidence Score',
        data: trendData.map(item => item.score),
        fill: false,
        tension: 0.3,
        borderColor: '#3b82f6',
        pointBackgroundColor: '#3b82f6'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: '#9ca3af' }
      },
      x: {
        ticks: { color: '#9ca3af' }
      }
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2 text-white">Confidence Trend</h2>
      {trendData.length === 0 ? (
        <p className="text-gray-400">No trend data available.</p>
      ) : (
        <Line data={chartData} options={chartOptions} />
      )}
    </div>
  );
}
