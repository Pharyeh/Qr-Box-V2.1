import React, { useState, useEffect } from 'react';
import { useSymbolContext } from '../../context/SymbolContext';
import Badge from '../../components/ui/badge';
import { FiArrowUp, FiArrowDown, FiInfo } from 'react-icons/fi';
import { Tooltip } from '../../components/ui/tooltip';
import TradingViewWidget from '../../components/ui/TradingViewWidget';

const ASSET_CLASS_COLORS = {
  Forex: 'bg-cyan-900 text-cyan-300',
  Crypto: 'bg-orange-900 text-orange-300',
  Indices: 'bg-lime-900 text-lime-300',
  Commodities: 'bg-yellow-900 text-yellow-300',
  'Interest Rates': 'bg-fuchsia-900 text-fuchsia-300',
  Stocks: 'bg-blue-900 text-blue-300',
  Default: 'bg-slate-800 text-sky-400',
};

const COLUMN_TOOLTIPS = {
  Symbol: 'Trading symbol and asset class',
  Phase: 'Current market phase (1-4)',
  Bias: 'Market bias (Bullish/Bearish/Neutral)',
  Structure: 'Structural strength score',
  Score: 'Overall trade idea score (0-100)',
  PlayType: 'Setup type (Breakout, Expansion, etc.)',
  RR: 'Reward/Risk Ratio',
  Grade: 'Quality grade (A+, A, B, C)',
  PriceSource: 'Price data source (OANDA, YahooFinance, etc.)',
  PriceSymbol: 'Symbol used for price fetch (e.g., GC=F, CL=F)'
};

function exportToCSV(ideas) {
  const headers = ['Symbol', 'Phase', 'Bias', 'Structure', 'Reflex', 'Score', 'COT Bias', 'Duration'];
  const rows = ideas.map(item => [
    item.symbol,
    item.phase,
    item.bias,
    item.structure,
    item.reflex,
    item.score,
    item.cotBias,
    item.durationInPhase,
  ]);
  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `trade-ideas-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}

// Helper for ordinal day
const ordinal = n => {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return n + 'th';
};

// Render turn signal badge and COT divergence
const renderTurnSignal = (item) => {
  if (!item.turnSignal) return null;
  return (
    <span className="flex items-center gap-1">
      <span title={item.turnSignalRationale} className={
        item.turnSignal === 'buy'
          ? 'bg-green-700 text-white px-2 py-0.5 rounded-full font-bold'
          : 'bg-red-700 text-white px-2 py-0.5 rounded-full font-bold'
      }>{item.turnSignal === 'buy' ? 'Turn Buy' : 'Turn Sell'}</span>
      {item.turnCompressionDuration > 0 && (
        <span className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded-full text-xs" title="Compression duration">{ordinal(item.turnCompressionDuration)} day</span>
      )}
      {item.turnLastSignalAgo && item.turnLastSignalAgo !== 'now' && (
        <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full text-xs" title="Last turn signal">{item.turnLastSignalAgo}</span>
      )}
      {item.turnCOTDivergence === true && (
        <span className="text-yellow-400 text-lg" title="COT Divergence">⚠️</span>
      )}
      {item.turnCOTDivergence === false && (
        <span className="text-green-400 text-lg" title="COT Confirms">✅</span>
      )}
    </span>
  );
};

function getGrade(phaseBias, rangeDrift) {
  if ((phaseBias === 'Bullish' && rangeDrift === 'up') || (phaseBias === 'Bearish' && rangeDrift === 'down')) {
    return 'A+';
  } else if (
    (phaseBias === 'Bullish' || phaseBias === 'Bearish') || (rangeDrift === 'up' || rangeDrift === 'down')
  ) {
    return 'B';
  } else {
    return 'C';
  }
}

export default function TradeIdeasPanel({ onSelect }) {
  const { tradeIdeas: rawIdeas, loadingTradeIdeas, errorTradeIdeas } = useSymbolContext();
  const tradeIdeas = Array.isArray(rawIdeas) ? rawIdeas : [];
  const [selectedClass, setSelectedClass] = useState('All');
  const [showOnlyFresh, setShowOnlyFresh] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
  const [signalFilter, setSignalFilter] = useState('All');
  const [setupFilter, setSetupFilter] = useState('All');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      fetch('/api/tradeideas?timeframe=1d')
        .then(res => {
          if (!res.ok) throw new Error(`API error: ${res.status}`);
          return res.json();
        })
        .then(setData)
        .catch(err => {
          setError(err.message);
          console.error('TradeIdeas fetch error:', err);
        });
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (error) return <div style={{ color: 'red' }}>Failed to fetch trade ideas data: {error}</div>;
  if (!data) return <div>Loading...</div>;
  if (!Array.isArray(data) || data.length === 0) return <div>No data available.</div>;

  // --- Filtering ---
  const filtered = Array.isArray(data) ? data.filter(item =>
    (selectedClass === 'All' || item.assetClass === selectedClass) &&
    (!showOnlyFresh || (item.isNew && item.phase === 'Phase 2')) &&
    (signalFilter === 'All' ||
      (signalFilter === 'new' && item.isNew && item.phase === 'Phase 2') ||
      (signalFilter === 'structure' && item.phase === 'Phase 2' && item.breakout === true) ||
      (signalFilter === 'reversal' && item.phase === 'Phase 4') ||
      (signalFilter === 'compression' && item.phase === 'Phase 1' && item.volatility < 0.012)) &&
    (setupFilter === 'All' || (setupFilter === 'Pre-Breakout' ? item.setupType?.startsWith('Pre-Breakout') : true))
  ) : [];

  // Sort the filtered data according to sortConfig
  const sorted = [...filtered].sort((a, b) => {
    const key = sortConfig.key;
    let aVal, bVal;
    switch (key) {
      case 'symbol':
        aVal = a.symbol;
        bVal = b.symbol;
        break;
      case 'phase':
        aVal = a.phase || '';
        bVal = b.phase || '';
        break;
      case 'bias':
        aVal = a.bias || '';
        bVal = b.bias || '';
        break;
      case 'setupType':
        aVal = a.setupType || '';
        bVal = b.setupType || '';
        break;
      case 'direction':
        aVal = a.breakoutDirection?.direction || '';
        bVal = b.breakoutDirection?.direction || '';
        break;
      case 'structure':
        aVal = a.structure ?? 0;
        bVal = b.structure ?? 0;
        break;
      case 'score':
        aVal = a.score ?? 0;
        bVal = b.score ?? 0;
        break;
      case 'grade':
        // Use grade string for sorting (A+ > A > B > C)
        const gradeOrder = { 'A+': 4, 'A': 3, 'B': 2, 'C': 1, 'D': 0 };
        aVal = gradeOrder[a.grade] ?? 0;
        bVal = gradeOrder[b.grade] ?? 0;
        break;
      default:
        aVal = a.symbol;
        bVal = b.symbol;
    }
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? <FiArrowUp className="inline ml-1" /> : <FiArrowDown className="inline ml-1" />;
  };

  return (
    <div className="space-y-6">
      <div className="p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-lg font-bold">Trade Ideas</h2>
          <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">Timeframe: Daily (1D), Fresh Phase 2 only</span>
        </div>
        <div className="flex justify-between mb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setShowOnlyFresh(!showOnlyFresh)}
              className={`text-xs px-3 py-1 rounded-full transition-all duration-200 ${
                showOnlyFresh ? 'bg-green-800 text-green-100' : 'bg-zinc-600 text-gray-200'
              }`}
            >
              {showOnlyFresh ? '🟢 Fresh Only' : 'All Signals'}
            </button>
            <button 
              onClick={() => exportToCSV(filtered)} 
              className="text-xs px-3 py-1 bg-zinc-800 text-gray-100 rounded-full hover:bg-zinc-700 transition-colors duration-200"
            >
              ⬇️ Export CSV
            </button>
          </div>
          <div className="flex gap-2 mb-2">
            <select value={setupFilter} onChange={e => setSetupFilter(e.target.value)} className="text-xs px-3 py-1 bg-zinc-800 text-gray-100 rounded-full">
              <option value="All">All Setups</option>
              <option value="Pre-Breakout">Pre-Breakout</option>
            </select>
          </div>
        </div>

        <div className="max-h-[72vh] overflow-y-auto border border-zinc-800 rounded">
          {loadingTradeIdeas ? (
            <div className="text-center text-gray-400 py-8">Loading trade ideas...</div>
          ) : errorTradeIdeas ? (
            <div className="text-center text-red-400 py-8">{errorTradeIdeas}</div>
          ) : (
            <table className="w-full text-xs table-auto">
              <thead className="bg-zinc-900 text-gray-300 sticky top-0">
                <tr>
                  <th className="text-left px-0.5 py-0.5 cursor-pointer hover:bg-zinc-800 transition-colors duration-200" onClick={() => handleSort('symbol')}>Symbol <SortIcon column="symbol" /></th>
                  <th className="text-left px-0.5 py-0.5">Turn Signal</th>
                  <th className="text-left px-0.5 py-0.5 cursor-pointer hover:bg-zinc-800 transition-colors duration-200" onClick={() => handleSort('phase')}>Phase <SortIcon column="phase" /></th>
                  <th className="text-left px-0.5 py-0.5 cursor-pointer hover:bg-zinc-800 transition-colors duration-200" onClick={() => handleSort('bias')}>Bias <SortIcon column="bias" /></th>
                  <th className="text-left px-0.5 py-0.5 cursor-pointer hover:bg-zinc-800 transition-colors duration-200" onClick={() => handleSort('setupType')}>Setup <SortIcon column="setupType" /></th>
                  <th className="text-left px-0.5 py-0.5 cursor-pointer hover:bg-zinc-800 transition-colors duration-200" onClick={() => handleSort('direction')}>Direction <SortIcon column="direction" /></th>
                  <th className="text-left px-0.5 py-0.5 cursor-pointer hover:bg-zinc-800 transition-colors duration-200" onClick={() => handleSort('structure')}>Structure Score <SortIcon column="structure" /></th>
                  <th className="text-left px-0.5 py-0.5 cursor-pointer hover:bg-zinc-800 transition-colors duration-200" onClick={() => handleSort('score')}>Score <SortIcon column="score" /></th>
                  <th className="px-2 py-1 text-left cursor-pointer hover:bg-zinc-800 transition-colors duration-200" onClick={() => handleSort('grade')}>Grade <SortIcon column="grade" /></th>
                </tr>
              </thead> 
              <tbody>
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-6 text-xs whitespace-nowrap">
                      No trade ideas match current filters.
                    </td>
                  </tr>
                )}
                {sorted.map((item, i) => (
                  <tr
                    key={i}
                    onClick={() => onSelect(item.symbol)}
                    className="border-b border-zinc-700 hover:bg-zinc-800 cursor-pointer text-xs transition-colors duration-200"
                  >
                    <td className="px-0.5 py-0.5 font-bold text-xs">{item.symbol}</td>
                    <td className="px-0.5 py-0.5">{renderTurnSignal(item)}</td>
                    <td className="px-0.5 py-0.5 text-xs"><Badge label={item.phase} type="phase" /></td>
                    <td className="px-0.5 py-0.5 text-xs"><Badge label={item.bias} type="bias" /></td>
                    <td>{item.setupType}</td>
                    <td>{item.breakoutDirection ? `${item.breakoutDirection.direction} (${item.breakoutDirection.confidence})` : '--'}</td>
                    <td className="px-0.5 py-0.5 text-xs">{item.structure}</td>
                    <td className="px-0.5 py-0.5 text-xs">{item.score}</td>
                    <td className="px-2 py-1">
                      {(() => {
                        const grade = getGrade(item.bias, item.turnSignal === 'buy' ? 'up' : item.turnSignal === 'sell' ? 'down' : 'middle');
                        return (
                          <span className={`px-2 py-0.5 rounded text-xs ${grade === 'A+' ? 'bg-green-800 text-green-200' : grade === 'B' ? 'bg-yellow-800 text-yellow-200' : 'bg-slate-700 text-slate-200'}`}>{grade}</span>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
