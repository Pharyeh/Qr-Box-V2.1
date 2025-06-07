import React, { useEffect, useState } from 'react';
import { useSymbol } from '../../context/SymbolContext.jsx';
import PanelWrapper from '../../components/PanelWrapper';
import ScoreBar from '../../components/ScoreBar';
import PhaseTag from '../../components/PhaseTag';
import API_BASE from '../../config/api';

export default function PhaseMonitorPanel() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('All');
  const [biasFilter, setBiasFilter] = useState('All');
  const [sortBy, setSortBy] = useState('score');
  const [lastUpdated, setLastUpdated] = useState(null);
  const { setSelectedSymbol, selectedSymbol } = useSymbol();

  const fetchData = () => {
    fetch(`${API_BASE}/api/phasemonitor`)
      .then(res => res.json())
      .then(data => {
        const enriched = data.map(d => ({
          ...d,
          score: parseFloat(d.reflex || 0) + parseFloat(d.structure || 0),
        }));
        setData(enriched);
        setLastUpdated(new Date());
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = filter === 'All'
    ? data
    : data.filter(d => {
        const phaseNum = typeof d.phase === 'string'
          ? parseInt(d.phase.replace(/[^0-9]/g, ''))
          : d.phase;
        return phaseNum === parseInt(filter.split(' ')[1]);
      })
      .filter(d => biasFilter === 'All' ? true : d.bias === biasFilter);

  const sorted = [...filtered].sort((a, b) => b[sortBy] - a[sortBy]);

  const isPreBreakout = ({ phase, reflex, structure }) => {
    return phase === 'Phase 1' && parseFloat(reflex) > 0.5 && parseFloat(structure) > 0.35;
  };

  return (
    <PanelWrapper title="Phase Monitor" onRefresh={fetchData} lastUpdated={lastUpdated}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="dropdown">
            {['All', 'Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select value={biasFilter} onChange={e => setBiasFilter(e.target.value)} className="dropdown">
            {['All', 'Bullish', 'Bearish', 'Neutral'].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="dropdown">
            <option value="score">Sort by Score</option>
            <option value="reflex">Sort by Reflex</option>
            <option value="structure">Sort by Structure</option>
            <option value="volatility">Sort by Volatility</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[700px] overflow-y-auto pr-2">
          {sorted.map(({ symbol, phase, reflex, volatility, structure, lastClose, bias, score }) => {
            const phaseNum = typeof phase === 'string' ? parseInt(phase.replace(/[^0-9]/g, '')) : phase;
            const isPre = isPreBreakout({ phase, reflex, structure });

            return (
              <div
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className={`group cursor-pointer card-glass card-hover animate-fade-in p-4 rounded-xl transition-all duration-300 select-none
                  ${isPre ? 'ring-2 ring-yellow-400' : ''}
                  ${selectedSymbol === symbol ? 'ring-2 ring-blue-400' : ''}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold font-mono">{symbol}</h3>
                  <div className="flex items-center gap-2">
                    <PhaseTag phase={phaseNum} />
                    {isPre && (
                      <span className="text-[10px] px-2 py-0.5 bg-yellow-500 text-black font-bold rounded-full animate-pulse">
                        Pre-Breakout ⚡
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      bias === 'Bullish'
                        ? 'bg-green-600 text-white animate-pulse shadow-[0_0_8px_2px_rgba(34,197,94,0.5)]'
                        : bias === 'Bearish'
                        ? 'bg-red-600 text-white animate-pulse shadow-[0_0_8px_2px_rgba(239,68,68,0.5)]'
                        : 'bg-gray-600 text-white'
                    }`}>
                      {bias === 'Bullish' ? '📈' : bias === 'Bearish' ? '📉' : '➖'} {bias}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="metric-row" title="Reflex: Measures price reaction speed.">
                    <span>Reflex</span>
                    <ScoreBar score={+reflex} bias={bias} />
                    <span className="font-mono">{(+reflex).toFixed(2)}</span>
                  </div>
                  <div className="metric-row" title="Structure: Trend consistency and breakout alignment.">
                    <span>Structure</span>
                    <ScoreBar score={+structure} bias={bias} />
                    <span className="font-mono">{(+structure).toFixed(2)}</span>
                  </div>
                  <div className="metric-row" title="Volatility: Price fluctuation intensity.">
                    <span>Volatility</span>
                    <ScoreBar score={+volatility} bias={bias} />
                    <span className="font-mono">{(+volatility).toFixed(2)}</span>
                  </div>
                  <div className="metric-row" title="Score: Reflex + Structure (Trade Quality)">
                    <span>Score</span>
                    <ScoreBar score={+score} bias={bias} />
                    <span className="font-mono">{(+score).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Last Close</span>
                    <span className="text-sm font-mono">${(+lastClose).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PanelWrapper>
  );
}
