import React, { useEffect, useRef } from 'react';

// Helper to map app symbol to TradingView symbol
function getTradingViewSymbol(symbol) {
  if (symbol.startsWith('XAU') || symbol.startsWith('XAG')) return `OANDA:${symbol}`;
  if (symbol.endsWith('USD') && symbol.length === 6) return `OANDA:${symbol}`;
  if (symbol === 'BTCUSD' || symbol === 'ETHUSD' || symbol === 'LTCUSD') return `CRYPTO:${symbol}`;
  return `OANDA:${symbol}`;
}

export default function TradingViewWidget({ symbol, width = 600, height = 400 }) {
  const container = useRef(null);
  useEffect(() => {
    if (!symbol || !container.current) return;
    container.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: getTradingViewSymbol(symbol),
      width: '100%',
      height,
      interval: '60', // 1h candles; use 'D' for daily
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1', // 1 = candlestick
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      container_id: 'tradingview_candles',
    });
    container.current.appendChild(script);
  }, [symbol, height]);
  return (
    <div style={{ width: width, minWidth: 320, height: height }}>
      <div ref={container} style={{ width: '100%', height: height }} />
    </div>
  );
} 