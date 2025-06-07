import React, { useEffect, useState } from 'react';
import { useSymbol } from '../../context/SymbolContext.jsx';

export default function GPTThesisPanel() {
  const { selectedSymbol } = useSymbol();
  const [thesis, setThesis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedSymbol) return;
    setLoading(true);
    fetch(`/api/gptthesis?symbol=${selectedSymbol}`)
      .then(res => res.json())
      .then(data => {
        setThesis(data?.[0]?.thesis || 'No thesis returned.');
        setLoading(false);
      })
      .catch(err => {
        setThesis('Error fetching thesis.');
        setLoading(false);
      });
  }, [selectedSymbol]);

  return (
    <div className="p-4 rounded-2xl shadow bg-zinc-900 text-white">
      <h2 className="text-xl font-bold mb-4">GPT Thesis</h2>
      {selectedSymbol ? (
        <>
          <div className="text-sm text-gray-400 mb-2">Symbol: {selectedSymbol}</div>
          {loading ? (
            <div className="text-xs text-yellow-300">Generating thesis...</div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm">{thesis}</pre>
          )}
        </>
      ) : (
        <div className="text-sm text-gray-400">Click a symbol from any panel to load its thesis.</div>
      )}
    </div>
  );
} 