import React, { useEffect, useState, useRef } from 'react';

const PHASE_COLORS = {
  'Phase 1': 'bg-slate-500',
  'Phase 1.8': 'bg-slate-400',
  'Phase 2': 'bg-green-600',
  'Phase 3': 'bg-blue-600',
  'Phase 4': 'bg-pink-600',
  'Bullish': 'text-green-300',
  'Bearish': 'text-pink-300',
  'Neutral': 'text-slate-200',
};

const ASSET_CLASS_COLORS = {
  Forex: 'border-cyan-400',
  Crypto: 'border-orange-400',
  Futures: 'border-lime-400',
  Commodities: 'border-yellow-400',
  Stocks: 'border-blue-400',
  Default: 'border-slate-400',
};

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function PhasePulseBar() {
  const [transitions, setTransitions] = useState([]);
  const [hovered, setHovered] = useState(null);
  const intervalRef = useRef();

  useEffect(() => {
    async function fetchTransitions() {
      try {
        const res = await fetch('/api/phasemonitor/phase-transitions');
        const data = await res.json();
        setTransitions(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
      } catch (e) {
        // ignore
      }
    }
    fetchTransitions();
    intervalRef.current = setInterval(fetchTransitions, 5000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="w-full" style={{ background: '#1a1c20' }}>
      <div className="border-b border-slate-900 flex items-center overflow-x-auto h-12 relative shadow-lg z-50">
        <div className="flex animate-marquee space-x-6 px-4">
          {transitions.map((t, i) => (
            <div
              key={t.symbol + t.timestamp}
              className={`flex items-center px-3 py-1 rounded-full shadow-md mx-1 cursor-pointer transition-all duration-300 ${PHASE_COLORS[t.newPhase] || 'bg-slate-800'}`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ opacity: hovered === i ? 0.7 : 1 }}
            >
              <span className="font-bold text-xs mr-2 text-slate-100">{t.symbol}</span>
              <span className={`font-semibold text-xs mr-2 ${PHASE_COLORS[t.newPhase] || ''}`}>{t.newPhase}</span>
              <span className={`font-semibold text-xs mr-2 ${PHASE_COLORS[t.bias] || ''}`}>{typeof t.bias === 'object' ? 'No Data' : t.bias}</span>
              <span className="text-xs text-slate-400">{formatTime(t.timestamp)}</span>
              {hovered === i && (
                <div className="absolute left-0 top-10 bg-slate-900 text-slate-100 rounded shadow-lg px-4 py-2 z-50 min-w-[220px] border border-slate-700">
                  <div><b>Symbol:</b> {t.symbol}</div>
                  <div><b>Phase:</b> {t.newPhase}</div>
                  <div><b>Bias:</b> {typeof t.bias === 'object' ? 'No Data' : t.bias}</div>
                  <div><b>COT:</b> {typeof t.cot === 'object' ? 'No Data' : t.cot || 'N/A'}</div>
                  <div><b>Asset Class:</b> {t.assetClass}</div>
                  <div><b>Time:</b> {formatTime(t.timestamp)}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 