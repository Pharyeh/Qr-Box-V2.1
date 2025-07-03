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
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const { setSelectedSymbol } = useSymbolContext();
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedPhase, setSelectedPhase] = useState('All');
  const [filterBias, setFilterBias] = useState('All');
  const [filterSetup, setFilterSetup] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'symbol', direction: 'asc' });
  const [tvSymbol, setTVSymbol] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historySymbol, setHistorySymbol] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      fetch('/api/phasemonitor?refresh=true')
        .then(res => {
          if (!res.ok) throw new Error(`API error: ${res.status}`);
          return res.json();
        })
        .then(setData)
        .catch(err => {
          setError(err.message);
          console.error('PhaseMonitor fetch error:', err);
        });
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30 seconds
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

  // Helper to map asset classes to filter groups
  const mapAssetClass = (cls) => {
    if ([
      'Metals', 'Grains', 'Softs', 'Livestock', 'Energy', 'Dairy'
    ].includes(cls)) return 'Commodities';
    return cls;
  };

  const filtered = Array.isArray(data) ? data.filter(item =>
    (selectedClass === 'All' || mapAssetClass(item.assetClass) === selectedClass) &&
    (selectedPhase === 'All' || item.phase === selectedPhase) &&
    (filterBias === 'All' || item.bias === filterBias) &&
    (filterSetup === 'All' || (filterSetup === 'Pre-Breakout' ? item.setupType === 'Pre-Breakout Watch' : true))
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
        aVal = a.primary?.phase || '';
        bVal = b.primary?.phase || '';
        break;
      case 'bias':
        aVal = a.primary?.bias || '';
        bVal = b.primary?.bias || '';
        break;
      case 'cot':
        aVal = a.primary?.cotBias || '';
        bVal = b.primary?.cotBias || '';
        break;
      case 'timeframe':
        aVal = a.primary?.timeframe || '';
        bVal = b.primary?.timeframe || '';
        break;
      case 'duration':
        // Parse duration like '62h', '1d', etc. to minutes for comparison
        aVal = parseToMinutes(a.primary?.durationInPhase);
        bVal = parseToMinutes(b.primary?.durationInPhase);
        break;
      case 'priceSource':
        aVal = a.priceSource || '';
        bVal = b.priceSource || '';
        break;
      case 'setup':
        aVal = a.setupType || '';
        bVal = b.setupType || '';
        break;
      case 'breakoutStatus':
        aVal = a.breakoutStatus || '';
        bVal = b.breakoutStatus || '';
        break;
      case 'notes':
        aVal = a.notes || '';
        bVal = b.notes || '';
        break;
      default:
        aVal = a.symbol;
        bVal = b.symbol;
    }
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
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

  const renderPhaseTag = (phase) => <Badge label={phase} type="phase" />;
  const renderBias = (bias) => <Badge label={bias} type="bias" />;

  const renderCOT = (cotBias) => {
    let color = 'bg-gray-600';
    let label = cotBias;
    switch (cotBias) {
      case 'Extremely Bullish':
      case 'Strong Bullish':
      case 'Moderate Bullish':
        color = 'bg-green-600';
        break;
      case 'Neutral':
        color = 'bg-yellow-500';
        break;
      case 'Moderate Bearish':
      case 'Strong Bearish':
      case 'Extremely Bearish':
        color = 'bg-red-600';
        break;
      case 'No COT':
      case '--':
      case undefined:
      case null:
      case '':
        color = 'bg-gray-600';
        label = 'No COT';
        break;
      default:
        color = 'bg-gray-600';
        label = 'No COT';
    }
    return (
      <span className={`px-2 py-0.5 text-xs text-white rounded-full ${color}`}>{label}</span>
    );
  };

  // Use correct data based on new structure
  const getPhaseData = (item) => item;
  const getCOT = (item) => item.cotBias;
  const getDuration = (item) => item.timeInZone !== undefined ? `${item.timeInZone} bars` : '--';
  const getPriceSource = (item) => item.priceSource;
  const getTimeframe = (item) => item.timeframe || '--';

  if (error) return <div style={{ color: 'red' }}>Failed to fetch phase monitor data: {error}</div>;
  if (!data) return <div>Loading...</div>;
  if (!Array.isArray(data) || data.length === 0) return <div>No data available.</div>;

  return (
    <div className={`p-4 text-white ${fullscreen ? 'fixed inset-0 bg-zinc-950 z-50 overflow-y-auto' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold">Phase Monitor</h2>
      </div>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setFullscreen(!fullscreen)} className="text-white text-xl hover:text-sky-400">
          {fullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
        </button>
        <button onClick={() => {
          fetch('/api/phasemonitor?refresh=true')
            .then(res => {
              if (!res.ok) throw new Error(`API error: ${res.status}`);
              return res.json();
            })
            .then(setData)
            .catch(err => {
              setError(err.message);
              console.error('PhaseMonitor fetch error:', err);
            });
        }} className="ml-2 px-3 py-1 bg-blue-700 hover:bg-blue-800 text-xs rounded-full">Refresh</button>
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
          <option value="Phase 1.8">Phase 1.8</option>
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
        <select value={filterSetup} onChange={e => setFilterSetup(e.target.value)} className="text-xs px-3 py-1 bg-zinc-800 text-gray-100 rounded-full">
          <option value="All">All Setups</option>
          <option value="Pre-Breakout">Pre-Breakout</option>
        </select>
      </div>

      <div className="max-h-[70vh] overflow-y-auto rounded border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-gray-300 sticky top-0 z-10">
            <tr>
              <th onClick={() => handleSort('symbol')} className="px-2 py-1 cursor-pointer">Symbol <SortIcon column="symbol" /></th>
              <th>📈</th>
              <th onClick={() => handleSort('phase')} className="cursor-pointer">Phase</th>
              <th onClick={() => handleSort('bias')} className="cursor-pointer">Bias</th>
              <th>Setup</th>
              <th onClick={() => handleSort('cot')} className="cursor-pointer">COT</th>
              <th onClick={() => handleSort('timeframe')} className="cursor-pointer">TF</th>
              <th onClick={() => handleSort('duration')} className="px-2 py-1 cursor-pointer">Time in Zone</th>
              <th onClick={() => handleSort('priceSource')} className="cursor-pointer">Source</th>
              <th>Breakout Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center text-gray-500 py-6 text-xs whitespace-nowrap">
                  No data available.
                </td>
              </tr>
            )}
            {sorted.map((item, i) => {
              const phaseData = getPhaseData(item);
              return (
                <tr key={item.symbol} className="border-b border-zinc-800 hover:bg-zinc-900 cursor-pointer text-xs transition-colors duration-200"
                  onClick={() => onSelect && onSelect(item.symbol)}
                >
                  <td className="px-2 py-1 font-bold text-xs cursor-pointer">{item.symbol}</td>
                  <td className="px-2 py-1"><TradingViewWidget symbol={item.symbol} /></td>
                  <td>{phaseData ? renderPhaseTag(phaseData.phase) : '--'}</td>
                  <td>{phaseData ? renderBias(phaseData.bias) : '--'}</td>
                  <td>{item.setupType === 'Pre-Breakout Watch' ? <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-black font-bold text-xs">PRE</span> : (item.setupType === '--' ? 'N/A' : item.setupType || 'N/A')}</td>
                  <td>{getCOT(item) ? renderCOT(getCOT(item)) : '--'}</td>
                  <td className="text-xs text-gray-300">{getTimeframe(item)}</td>
                  <td>{getDuration(item)}</td>
                  <td>{getPriceSource(item)}</td>
                  <td>{item.breakoutStatus || '--'}</td>
                  <td>{item.notes || '--'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-end">
        <button className="ml-4 px-3 py-1 bg-blue-700 text-white rounded text-sm" onClick={() => fetchPhaseHistory(historySymbol)}>🕒 Phase History</button>
      </div>

      <PhaseHistoryModal open={showHistory} onClose={() => setShowHistory(false)} history={historyData} symbol={historySymbol} />
    </div>
  );
}
