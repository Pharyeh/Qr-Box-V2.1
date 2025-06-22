import React, { useState } from 'react';
import { useSymbolContext } from '../../context/SymbolContext';
import Badge from '../../components/ui/badge';
import { FiArrowUp, FiArrowDown, FiInfo } from 'react-icons/fi';
import { Tooltip } from '../../components/ui/tooltip';

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

export default function TradeIdeasPanel({ onSelect }) {
  const { tradeIdeas: rawIdeas, loadingTradeIdeas, errorTradeIdeas } = useSymbolContext();
  const tradeIdeas = Array.isArray(rawIdeas) ? rawIdeas : [];
  const [selectedClass, setSelectedClass] = useState('All');
  const [showOnlyFresh, setShowOnlyFresh] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
  const [signalFilter, setSignalFilter] = useState('All');

  // --- Filtering ---
  const filtered = tradeIdeas
    .filter(item =>
      (selectedClass === 'All' || item.assetClass === selectedClass) &&
      (!showOnlyFresh || (item.isNew && item.phase === 'Phase 2')) &&
      (signalFilter === 'All' ||
        (signalFilter === 'new' && item.isNew && item.phase === 'Phase 2') ||
        (signalFilter === 'structure' && item.phase === 'Phase 2' && item.breakout === true) ||
        (signalFilter === 'reversal' && item.phase === 'Phase 4') ||
        (signalFilter === 'compression' && item.phase === 'Phase 1' && item.volatility < 0.012))
    )
    .sort((a, b) => {
      if (sortConfig.key === 'score') {
        return sortConfig.direction === 'asc' ? a.score - b.score : b.score - a.score;
      }
      if (sortConfig.key === 'symbol') {
        return sortConfig.direction === 'asc' 
          ? a.symbol.localeCompare(b.symbol)
          : b.symbol.localeCompare(a.symbol);
      }
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
    <div className="p-4 text-white">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold">Trade Ideas</h2>
        <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">Timeframe: H4 (4-hour), Fresh Phase 2 only</span>
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
                {Object.entries(COLUMN_TOOLTIPS).map(([key, tooltip]) => (
                  <th 
                    key={key}
                    className="text-left px-0.5 py-0.5 cursor-pointer hover:bg-zinc-800 transition-colors duration-200"
                    onClick={() => handleSort(key.toLowerCase())}
                  >
                    <div className="flex items-center gap-1">
                      <Tooltip content={tooltip} />
                      {key}
                      <SortIcon column={key.toLowerCase()} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead> 
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="11" className="text-center text-gray-500 py-6 text-xs whitespace-nowrap">
                    No trade ideas match current filters.
                  </td>
                </tr>
              )}
              {filtered.map((item, i) => (
                <tr
                  key={i}
                  onClick={() => onSelect(item.symbol)}
                  className="border-b border-zinc-700 hover:bg-zinc-800 cursor-pointer text-xs transition-colors duration-200"
                >
                  <td className="px-0.5 py-0.5 font-bold text-xs">{item.symbol}</td>
                  <td className="px-0.5 py-0.5 text-xs">{item.phase}</td>
                  <td className="px-0.5 py-0.5 text-xs">
                    <Badge label={item.bias} type="bias" />
                  </td>
                  <td className="px-0.5 py-0.5 text-xs">{item.structure}</td>
                  <td className="px-0.5 py-0.5 font-mono text-xs">{item.score}</td>
                  <td className="px-0.5 py-0.5 text-xs">
                    <Badge label={item.cotBias} score={item.cotScore} type="cot" />
                  </td>
                  <td className="px-0.5 py-0.5 text-xs text-gray-400">{item.durationInPhase}</td>
                  <td className="px-0.5 py-0.5 text-xs">{item.playType}</td>
                  <td className="px-0.5 py-0.5 text-xs">{item.rr.toFixed(2)}</td>
                  <td className="px-0.5 py-0.5 text-xs">{item.grade}</td>
                  <td className="px-0.5 py-0.5 text-xs text-gray-400">{item.priceSource}</td>
                  <td className="px-0.5 py-0.5 text-xs text-gray-400">{item.priceSymbol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
