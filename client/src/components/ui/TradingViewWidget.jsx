import React, { useState, useRef, useEffect } from 'react';
import { SYMBOL_MAP } from '../../../../server/utils/symbolMapping.js';

// Helper to map app symbol to TradingView symbol
function getTradingViewSymbol(symbol) {
  const meta = SYMBOL_MAP[symbol];
  if (meta && meta.tradingview) return meta.tradingview;
  if (meta && meta.assetClass === 'Stocks') return `NYSE:${symbol}`;
  return `OANDA:${symbol}`;
}

export default function TradingViewWidget({ symbol }) {
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const tvSymbol = getTradingViewSymbol(symbol);

  useEffect(() => {
    if (!open || !symbol || !container.current) return;
    container.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: tvSymbol,
      width: '100%',
      height: 500,
      interval: '60',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: 'tradingview_candles',
    });
    container.current.appendChild(script);
  }, [open, symbol, tvSymbol]);

  return (
    <>
      <span
        title="Open in TradingView"
        onClick={() => setOpen(true)}
        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="#e5e7eb"/>
          <path d="M6 16L10.5 11.5L14 15L18 9" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      {open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{ background: '#18181b', borderRadius: 8, padding: 16, position: 'relative', minWidth: 350, maxWidth: '90vw', maxHeight: '90vh', boxShadow: '0 2px 16px #000', overflow: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}
              title="Close"
            >
              ×
            </button>
            <div ref={container} style={{ width: 600, height: 500, minWidth: 320 }} />
          </div>
        </div>
      )}
    </>
  );
} 