import { useEffect, useState } from 'react';

export default function GptPanel() {
  const [thesis, setThesis] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gpt/thesis')
      .then(res => res.json())
      .then(data => {
        if (data && data.thesis) setThesis(data.thesis);
      })
      .catch(err => console.error('[client ERROR]: Failed to fetch GPT thesis', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-2 text-white">GPT Market Thesis</h2>
      {loading ? (
        <p className="text-gray-400">Loading GPT insights...</p>
      ) : thesis ? (
        <div className="text-sm text-gray-200 whitespace-pre-line">{thesis}</div>
      ) : (
        <p className="text-gray-400">No GPT analysis available.</p>
      )}
    </div>
  );
}
