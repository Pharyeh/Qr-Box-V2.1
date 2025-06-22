// RangeBreakoutPanel.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import Badge from '@/components/ui/badge';

const ASSET_CLASSES = ['All', 'Forex', 'Commodities', 'Crypto', 'Indices', 'Interest Rates', 'Stocks'];
const GRADES = ['All', 'A+', 'A', 'B', 'C', 'D'];
const SOURCES = ['All', 'OANDA', 'YahooFinance'];

const getColor = (bias) => {
  if (bias === 'Bullish') return 'border-l-4 border-green-500';
  if (bias === 'Bearish') return 'border-l-4 border-red-500';
  return 'border-l-4 border-gray-400';
};

const getBiasBadge = (bias) => {
  if (bias === 'Bullish') return <Badge className="bg-green-600">🟢 Bullish</Badge>;
  if (bias === 'Bearish') return <Badge className="bg-red-600">🔴 Bearish</Badge>;
  return <Badge className="bg-gray-600">⚪ Neutral</Badge>;
};

export default function RangeBreakoutPanel() {
  const [breakouts, setBreakouts] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');

  useEffect(() => {
    const fetchBreakouts = async () => {
      try {
        const res = await axios.get('/api/rangebreakout');
        setBreakouts(res.data);
      } catch (err) {
        console.error('Error fetching dual zone breakouts:', err);
      }
    };
    fetchBreakouts();
  }, []);

  const filtered = breakouts.filter(b =>
    (selectedClass === 'All' || b.assetClass === selectedClass) &&
    (selectedGrade === 'All' || b.grade === selectedGrade) &&
    (selectedSource === 'All' || b.priceSource === selectedSource)
  );

  return (
    <div className="p-4 text-white">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold">Dual Zone Breakouts</h2>
        <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">Timeframe: 1D (Daily)</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="text-xs px-3 py-1 bg-zinc-800 text-gray-100 rounded-full">
          {ASSET_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
        </select>
        <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} className="text-xs px-3 py-1 bg-zinc-800 text-gray-100 rounded-full">
          {GRADES.map(g => <option key={g} value={g}>{g === 'All' ? 'All Grades' : g}</option>)}
        </select>
        <select value={selectedSource} onChange={e => setSelectedSource(e.target.value)} className="text-xs px-3 py-1 bg-zinc-800 text-gray-100 rounded-full">
          {SOURCES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sources' : s}</option>)}
        </select>
      </div>
      <div className="max-h-[70vh] overflow-y-auto rounded border border-zinc-800">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-zinc-900 text-gray-300 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-1">Symbol</th>
              <th>Tag</th>
              <th>Bias</th>
              <th>Close</th>
              <th>Reflex</th>
              <th>Structure</th>
              <th>Volatility</th>
              <th>COT</th>
              <th>Grade</th>
              <th>Source</th>
              <th>Asset Class</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan="10" className="text-center py-4 text-gray-500">No results match current filters.</td></tr>
            ) : (
              filtered.map((b, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-zinc-800/50' : ''}>
                  <td className="font-bold text-sky-400 px-2 py-1">{b.symbol}</td>
                  <td><Badge label={b.tag} /></td>
                  <td><Badge label={b.directionalBias} type="bias" /></td>
                  <td>{b.lastClose?.toFixed(4)}</td>
                  <td>{b.reflex}</td>
                  <td>{b.structure}</td>
                  <td>{b.volatility}</td>
                  <td><Badge label={b.cotBias} type="cot" score={b.cotScore} /></td>
                  <td><Badge label={b.grade} /></td>
                  <td><span className="px-2 py-0.5 rounded-full text-xs bg-zinc-700 text-zinc-200">{b.priceSource}</span></td>
                  <td><span className="px-2 py-0.5 rounded-full text-xs bg-zinc-700 text-zinc-200">{b.assetClass}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted-foreground italic pt-2">
        Dual zone logic compares short-term breakout vs long-term base compression. Use filters to explore by asset class, grade, or data source.
      </div>
    </div>
  );
}
