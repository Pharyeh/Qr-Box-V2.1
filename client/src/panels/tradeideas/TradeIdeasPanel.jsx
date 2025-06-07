import React, { useEffect, useState } from 'react';
import { useSymbol } from '../../context/SymbolContext.jsx';
import PanelWrapper from '../../components/PanelWrapper';
import ScoreBar from '../../components/ScoreBar';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function TradeIdeasPanel() {
  const [ideas, setIdeas] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { setSelectedSymbol, selectedSymbol } = useSymbol();

  const fetchIdeas = () => {
    fetch('/api/tradeideas')
      .then(res => res.json())
      .then(data => {
        setIdeas(data);
        setLastUpdated(new Date());
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const topIdeas = [...ideas]
    .sort((a, b) => b.reflex - a.reflex)
    .slice(0, 10);

  const downloadTopIdeas = () => {
    const markdown = topIdeas
      .slice(0, 5)
      .map(idea => `
## ${idea.symbol}
- Score: ${idea.score}
- Reflex: ${idea.reflex}
- Structure: ${idea.structure}
- Volatility: ${idea.volatility}
- Last Close: $${(+idea.lastClose).toFixed(2)}
${idea.new ? '- 🆕 New Setup' : ''}
      `)
      .join('\n\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'top-trade-ideas.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <PanelWrapper 
      title="Trade Ideas" 
      onRefresh={fetchIdeas}
      lastUpdated={lastUpdated}
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-end">
          <button
            onClick={downloadTopIdeas}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            Download Top 5
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topIdeas.map(({ symbol, reflex, structure, volatility, score, lastClose, new: isNew, bias }) => (
            <div
              key={symbol}
              onClick={() => setSelectedSymbol(symbol)}
              className={`group cursor-pointer card-glass card-hover animate-fade-in p-4 rounded-xl transition-all duration-300 select-none ${
                isNew ? 'ring-2 ring-yellow-400' : ''
              } ${selectedSymbol === symbol ? 'ring-2 ring-blue-400 transition-all duration-300' : ''}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold font-mono">{symbol}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      bias === 'Bullish'
                        ? 'bg-green-600 text-white animate-pulse shadow-[0_0_8px_2px_rgba(34,197,94,0.5)]'
                        : bias === 'Bearish'
                        ? 'bg-red-600 text-white animate-pulse shadow-[0_0_8px_2px_rgba(239,68,68,0.5)]'
                        : 'bg-gray-600 text-white'
                    }`}>
                      {bias === 'Bullish' ? '📈' : bias === 'Bearish' ? '📉' : '➖'} {bias}
                    </div>
                    <span className="w-2/3"><ScoreBar score={Number(score)} bias={bias} /></span>
                    <span className="text-xs font-mono text-gray-300">{Number(score).toFixed(2)}</span>
                    {isNew && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                        New Setup
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-mono text-gray-300">${(+lastClose).toFixed(2)}</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span className="underline decoration-dotted cursor-help" title="Reflex: Measures price reaction speed to market moves.">Reflex</span>
                    <span className="w-2/3"><ScoreBar score={Number(reflex)} bias={bias} tooltip="Reflex: Measures price reaction speed to market moves." /></span>
                    <span className="text-xs font-mono text-gray-300">{Number(reflex).toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(+reflex * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span className="underline decoration-dotted cursor-help" title="Structure: Indicates trend strength and support/resistance.">Structure</span>
                    <span className="w-2/3"><ScoreBar score={Number(structure)} bias={bias} tooltip="Structure: Indicates trend strength and support/resistance." /></span>
                    <span className="text-xs font-mono text-gray-300">{Number(structure).toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(+structure * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span className="underline decoration-dotted cursor-help" title="Volatility: Shows recent price fluctuation intensity.">Volatility</span>
                    <span className="w-2/3"><ScoreBar score={Number(volatility)} bias={bias} tooltip="Volatility: Shows recent price fluctuation intensity." /></span>
                    <span className="text-xs font-mono text-gray-300">{Number(volatility).toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(+volatility * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PanelWrapper>
  );
}
