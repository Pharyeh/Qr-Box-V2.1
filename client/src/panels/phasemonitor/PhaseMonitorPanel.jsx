import React, { useState } from 'react';
import { useSymbolContext } from '../../context/SymbolContext';
import Badge from '../../components/ui/badge';
import { FiArrowUp, FiArrowDown, FiInfo } from 'react-icons/fi';
import { Tooltip } from '../../components/ui/tooltip';

const COLUMN_TOOLTIPS = {
  Symbol: 'Trading symbol and asset class',
  TV: 'TradingView chart link',
  Phase: 'Current market phase (1-4)',
  Bias: 'Market bias (Bullish/Bearish/Neutral)',
  COT: 'Commitment of Traders bias',
  Duration: 'Time in current phase',
  Source: 'Data source',
  GPT: 'Generate GPT analysis'
};

const PhaseMonitorPanel = () => {
  const { symbolsData, setSelectedSymbol, selectedSymbol } = useSymbolContext();
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedPhase, setSelectedPhase] = useState('All');
  const [tvSymbol, setTVSymbol] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'asc' });
  const [filterBias, setFilterBias] = useState('All');

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filtered = symbolsData
    .filter(item => 
      (selectedPhase === 'All' || item.phase === selectedPhase) &&
      (selectedClass === 'All' || item.assetClass === selectedClass) &&
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
        const aHours = parseInt(a.durationInPhase?.replace('h', '') || '0', 10);
        const bHours = parseInt(b.durationInPhase?.replace('h', '') || '0', 10);
        return sortConfig.direction === 'asc' ? aHours - bHours : bHours - aHours;
      }
      return 0;
    });

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? <FiArrowUp className="inline ml-1" /> : <FiArrowDown className="inline ml-1" />;
  };

  return (
    <div className="p-4 text-white">
      <h2 className="text-xl font-bold mb-4">Phase Monitor</h2>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 mb-2">
        {['All', 'Forex', 'Commodities', 'Crypto', 'Indices', 'Interest Rates', 'Stocks'].map(cls => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={`px-3 py-1 rounded-full text-xs ${
              selectedClass === cls ? 'bg-blue-800 text-blue-100' : 'bg-zinc-700 text-zinc-300'
            }`}
          >
            {cls}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={selectedPhase}
          onChange={(e) => setSelectedPhase(e.target.value)}
          className="text-xs px-3 py-1 bg-zinc-800 text-gray-100 rounded-full hover:bg-zinc-700 transition-colors duration-200"
        >
          <option value="All">All Phases</option>
          <option value="Phase 1">Phase 1</option>
          <option value="Phase 1.8">Phase 1.8</option>
          <option value="Phase 2">Phase 2</option>
          <option value="Phase 3">Phase 3</option>
          <option value="Phase 4">Phase 4</option>
        </select>
        <select
          value={filterBias}
          onChange={(e) => setFilterBias(e.target.value)}
          className="text-xs px-3 py-1 bg-zinc-800 text-gray-100 rounded-full hover:bg-zinc-700 transition-colors duration-200"
        >
          <option value="All">All Biases</option>
          <option value="Bullish">Bullish</option>
          <option value="Bearish">Bearish</option>
          <option value="Neutral">Neutral</option>
        </select>
      </div>

      {/* Table */}
      <div className="max-h-[70vh] overflow-y-auto rounded border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-gray-300 sticky top-0 z-10">
            <tr>
              {Object.entries(COLUMN_TOOLTIPS).map(([key, tooltip]) => (
                <th 
                  key={key}
                  className="text-left px-2 py-1 cursor-pointer hover:bg-zinc-800 transition-colors duration-200"
                  onClick={() => handleSort(key.toLowerCase())}
                >
                  <div className="flex items-center gap-1">
                    <Tooltip content={tooltip}>
                      {/*<FiInfo className="text-zinc-500 hover:text-zinc-300 transition-colors duration-200" />*/}
                    </Tooltip>
                    {key}
                    <SortIcon column={key.toLowerCase()} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500">
                  No results match current filters.
                </td>
              </tr>
            ) : (
              filtered.map((item, i) => (
                <tr
                  key={i}
                  onClick={() => setSelectedSymbol(item.symbol)}
                  className={`hover:bg-zinc-800 border-b border-zinc-700 cursor-pointer ${
                    selectedSymbol === item.symbol ? 'bg-sky-900/60' : ''
                  }`}
                >
                  <td className="font-bold text-sky-400 px-2 py-1">{item.symbol}</td>
                  <td className="px-2 py-1">
                    <button
                      className="text-blue-400 hover:text-blue-200 text-lg focus:outline-none"
                      title="Show TradingView Chart"
                      onClick={e => {
                        e.stopPropagation();
                        setTVSymbol(item.symbol);
                      }}
                    >
                      <span role="img" aria-label="TradingView">📈</span>
                    </button>
                    {tvSymbol === item.symbol && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setTVSymbol(null)}>
                        <div className="bg-zinc-900 rounded-lg shadow-2xl border border-zinc-700 p-4 relative" onClick={e => e.stopPropagation()}>
                          <button className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl" onClick={() => setTVSymbol(null)}>&times;</button>
                          <a
                            href={`https://www.tradingview.com/chart/?symbol=${item.symbol}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-200 text-lg"
                          >
                            <span role="img" aria-label="TradingView">📈</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-1">
                    {item.phase}
                    {item.isNew && item.phase === 'Phase 2' && (
                      <span className="ml-2 bg-green-800 text-green-100 text-xs px-2 py-0.5 rounded-full">
                        🟢 Darvas Breakout
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-1">
                    <Badge label={item.bias} type="bias" />
                  </td>
                  <td className="px-2 py-1">
                    <Badge label={item.cotBias} score={item.cotScore} type="cot" />
                  </td>
                  <td className="px-2 py-1 text-xs text-gray-300">{item.durationInPhase}</td>
                  <td className="px-2 py-1 text-xs text-gray-400">{item.source}</td>
                  <td className="px-2 py-1 text-center">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedSymbol(item.symbol);
                      }}
                      title="Generate GPT Thesis"
                      className="text-sky-400 hover:text-sky-200 text-lg"
                    >
                      🧠
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PhaseMonitorPanel;
