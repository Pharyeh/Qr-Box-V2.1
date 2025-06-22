// PhaseMonitorPanel.jsx
import React, { useEffect, useState } from 'react';
import { fetchPhaseMonitor } from '../../api/phaseMonitor';
import { useSymbolContext } from '../../context/SymbolContext';
import Badge from '../../components/ui/badge';
import { FiArrowUp, FiArrowDown, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import TradingViewWidget from '../../components/ui/TradingViewWidget';

function PhaseHistoryModal({ open, onClose, history, symbol }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-2">{symbol} Phase History</h2>
        <button className="absolute top-2 right-4 text-xl" onClick={onClose}>×</button>
        <ul className="space-y-2 mt-4">
          {history && history.length > 0 ? history.map((h, i) => (
            <li key={i} className="flex items-center space-x-2">
              <span className="font-mono text-xs text-gray-500">{new Date(h.timestamp).toLocaleString()}</span>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs">{h.phase}</span>
            </li>
          )) : <li className="text-gray-400 text-sm">No history found.</li>}
        </ul>
      </div>
    </div>
  );
}

export default function PhaseMonitorPanel({ onSelect }) {
  const [data, setData] = useState([]);
  const { setSymbol } = useSymbolContext();
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedPhase, setSelectedPhase] = useState('All');
  const [filterBias, setFilterBias] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'asc' });
  const [tvSymbol, setTVSymbol] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historySymbol, setHistorySymbol] = useState(null);

  const fetchData = async () => {
    try {
      const results = await fetchPhaseMonitor();
      setData(results);
    } catch (err) {
      console.error('[PhaseMonitorPanel] Failed to fetch:', err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // every 5 min
    return () => clearInterval(interval);
  }, []);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const parseToMinutes = (str) => {
    if (!str) return 0;
    if (str.endsWith('m')) return parseInt(str);
    if (str.endsWith('h')) return parseInt(str) * 60;
    if (str.endsWith('d')) return parseInt(str) * 1440;
    return 0;
  };

  const filtered = data
    .filter(item =>
      (selectedClass === 'All' || item.assetClass === selectedClass) &&
      (selectedPhase === 'All' || item.phase === selectedPhase) &&
      (filterBias === 'All' || item.bias === filterBias)
    )
    .sort((a, b) => {
      if (sortConfig.key === 'symbol') {
        return sortConfig.direction === 'asc'
          ? a.symbol.localeCompare(b.symbol)
          : b.symbol.localeCompare(a.symbol);
      }
      if (sortConfig.key === 'phase') {
        return sortConfig.direction === 'asc'
          ? a.phase.localeCompare(b.phase)
          : b.phase.localeCompare(a.phase);
      }
      if (sortConfig.key === 'duration') {
        const aMin = parseToMinutes(a.durationInPhase);
        const bMin = parseToMinutes(b.durationInPhase);
        return sortConfig.direction === 'asc' ? aMin - bMin : bMin - aMin;
      }
      return 0;
    });

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? <FiArrowUp className="inline ml-1" /> : <FiArrowDown className="inline ml-1" />;
  };

  const fetchPhaseHistory = async (symbol) => {
    setHistorySymbol(symbol);
    setShowHistory(true);
    try {
      const res = await fetch(`/api/phasemonitor/history?symbol=${symbol}`);
      const json = await res.json();
      setHistoryData(json);
    } catch (e) {
      setHistoryData([]);
    }
  };

  const renderPhaseTag = (phase) => {
    const color =
      phase === 'Phase 2' ? 'bg-green-600' :
      phase === 'Phase 3' ? 'bg-yellow-500' :
      phase === 'Phase 4' ? 'bg-red-500' :
      'bg-gray-500';
    return <span className={`px-2 py-0.5 text-xs text-white rounded-full ${color}`}>{phase}</span>;
  };

  const renderBias = (bias) => {
    return (
      <span className={`ml-2 text-xs font-medium ${
        bias === 'Bullish' ? 'text-green-400' :
        bias === 'Bearish' ? 'text-red-400' : 'text-gray-400'
      }`}>
        {bias}
      </span>
    );
  };

  return (
    <div className={`p-4 text-white ${fullscreen ? 'fixed inset-0 bg-zinc-950 z-50 overflow-y-auto' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold">Phase Monitor</h2>
        <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">Timeframe: 1D (Daily)</span>
      </div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setFullscreen(!fullscreen)} className="text-white text-xl hover:text-sky-400">
          {fullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-2">
        {['All', 'Forex', 'Commodities', 'Crypto', 'Indices', 'Interest Rates', 'Stocks'].map(cls => (
          <button key={cls} onClick={() => setSelectedClass(cls)} className={`px-3 py-1 rounded-full text-xs ${selectedClass === cls ? 'bg-blue-800 text-blue-100' : 'bg-zinc-700 text-zinc-300'}`}>{cls}</button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select value={selectedPhase} onChange={(e) => setSelectedPhase(e.target.value)} className="text-xs px-3 py-1 bg-zinc-800 text-gray-100 rounded-full">
          <option value="All">All Phases</option>
          <option value="Phase 1">Phase 1</option>
          <option value="Phase 2">Phase 2</option>
          <option value="Phase 3">Phase 3</option>
          <option value="Phase 4">Phase 4</option>
        </select>
        <select value={filterBias} onChange={(e) => setFilterBias(e.target.value)} className="text-xs px-3 py-1 bg-zinc-800 text-gray-100 rounded-full">
          <option value="All">All Biases</option>
          <option value="Bullish">Bullish</option>
          <option value="Bearish">Bearish</option>
          <option value="Neutral">Neutral</option>
        </select>
      </div>

      <div className="max-h-[70vh] overflow-y-auto rounded border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-gray-300 sticky top-0 z-10">
            <tr>
              <th onClick={() => handleSort('symbol')} className="px-2 py-1 cursor-pointer">Symbol <SortIcon column="symbol" /></th>
              <th>📈</th>
              <th onClick={() => handleSort('phase')} className="px-2 py-1 cursor-pointer">Phase <SortIcon column="phase" /></th>
              <th>Bias</th>
              <th>COT</th>
              <th onClick={() => handleSort('duration')} className="px-2 py-1 cursor-pointer">Duration <SortIcon column="duration" /></th>
              <th>Price Source</th>
              <th>Price Symbol</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="8" className="text-center py-4 text-gray-500">No results match current filters.</td></tr>
            ) : (
              filtered.map((item, i) => (
                <tr key={i} onClick={() => {
                  if (onSelect) onSelect(item.symbol);
                  setSymbol(item.symbol);
                }} className={`hover:bg-zinc-800 cursor-pointer border-b border-zinc-700`}>
                  <td className="font-bold text-sky-400 px-2 py-1">{item.symbol}</td>
                  <td className="px-2 py-1">
                    <button className="text-blue-400 hover:text-blue-200 text-lg" title="Chart" onClick={e => { e.stopPropagation(); setTVSymbol(item.symbol); }}>📈</button>
                    {tvSymbol === item.symbol && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setTVSymbol(null)}>
                        <div className="bg-zinc-900 rounded-lg border border-zinc-700 p-4 relative" onClick={e => e.stopPropagation()}>
                          <button className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl" onClick={() => setTVSymbol(null)}>&times;</button>
                          <TradingViewWidget symbol={item.symbol} width={600} height={400} />
                          <a href={`https://www.tradingview.com/chart/?symbol=${item.symbol}`} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-200 block text-center mt-2">📈 Open in TradingView</a>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-1">{renderPhaseTag(item.phase)}</td>
                  <td className="px-2 py-1">{renderBias(item.bias)}</td>
                  <td className="px-2 py-1"><Badge label={item.cotBias} type="cot" score={item.cotScore} /></td>
                  <td className="px-2 py-1">{item.durationInPhase}</td>
                  <td className="px-2 py-1">{item.priceSource}</td>
                  <td className="px-2 py-1">{item.priceSymbol}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button className="ml-4 px-3 py-1 bg-blue-700 text-white rounded text-sm" onClick={() => fetchPhaseHistory(item.symbol)}>🕒 Phase History</button>
      </div>

      <PhaseHistoryModal open={showHistory} onClose={() => setShowHistory(false)} history={historyData} symbol={historySymbol} />
    </div>
  );
}
