import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import Badge from '@/components/ui/badge';

export default function RangeBreakoutPanel() {
  const [breakouts, setBreakouts] = useState([]);

  useEffect(() => {
    const fetchBreakouts = async () => {
      try {
        const { data } = await axios.get('/api/rangebreakout');
        // Sort phase-confirmed breakouts to the top
        const sorted = [...data].sort((a, b) => {
          if (a.phaseConfirmed && !b.phaseConfirmed) return -1;
          if (!a.phaseConfirmed && b.phaseConfirmed) return 1;
          return b.score - a.score;
        });
        setBreakouts(sorted);
      } catch (err) {
        console.error('Failed to fetch breakout data:', err);
      }
    };
    fetchBreakouts();
  }, []);

  return (
    <div className="p-4 text-white">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold">Dual Zone Breakouts</h2>
        <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">Timeframe: 1D (Daily)</span>
      </div>
      <div className="max-h-[70vh] overflow-y-auto rounded border border-zinc-800">
        <table className="w-full text-sm min-w-[1100px]">
          <thead className="bg-zinc-900 text-gray-300 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-1">Symbol</th>
              <th>Tag</th>
              <th>Bias</th>
              <th>Phase</th>
              <th>Phase Bias</th>
              <th>Phase Duration</th>
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
            {breakouts.length === 0 ? (
              <tr><td colSpan="14" className="text-center py-4 text-gray-500">No results match current filters.</td></tr>
            ) : (
              breakouts.map((b, i) => (
                <tr
                  key={i}
                  className={
                    b.phaseConfirmed
                      ? 'bg-green-900/20 font-semibold'
                      : i % 2 === 0
                        ? 'bg-zinc-800/50'
                        : ''
                  }
                >
                  <td className="font-bold text-sky-400 px-2 py-1">{b.symbol}</td>
                  <td>
                    <Badge label={b.tag} />
                    {b.phaseConfirmed && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-green-700 text-white text-xs">Phase-Confirmed</span>
                    )}
                  </td>
                  <td><Badge label={b.directionalBias} type="bias" /></td>
                  <td>{b.phase || '-'}</td>
                  <td><Badge label={b.bias} type="bias" /></td>
                  <td>{b.durationInPhase !== null && b.durationInPhase !== undefined ? b.durationInPhase + 'h' : '-'}</td>
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
