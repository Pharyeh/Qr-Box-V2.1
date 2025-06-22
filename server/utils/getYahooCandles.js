import axios from 'axios';
import { SYMBOL_MAP } from './symbolMapping.js';

// Map internal timeframes to Yahoo intervals
const YAHOO_INTERVAL_MAP = {
  'M1': '1m',
  'M5': '5m',
  'M15': '15m',
  'M30': '30m',
  'H1': '60m',
  'H4': '1d', // Yahoo does not support 4h, use daily as fallback
  '1d': '1d',
  '1w': '1wk',
  '1mo': '1mo',
};

/**
 * Fetch candles from Yahoo Finance
 * @param {string} symbol - e.g. 'AAPL', 'MSFT', 'EURUSD', etc.
 * @param {number} count - number of candles to fetch
 * @param {string} interval - timeframe/granularity (e.g., '1d', 'H1', 'H4')
 * @returns {Promise<Array>} Array of candle objects [{ time, open, high, low, close, volume }]
 */
export async function getYahooCandles(symbol, count = 100, interval = '1d') {
  const symbolInfo = SYMBOL_MAP[symbol];
  const yahooSymbol = symbolInfo?.yahoo;
  if (!yahooSymbol) throw new Error(`No Yahoo symbol for ${symbol}`);
  const yahooInterval = YAHOO_INTERVAL_MAP[interval] || interval || '1d';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`;
  try {
    const res = await axios.get(url, { params: { interval: yahooInterval, range: '2y' } });
    const result = res.data.chart.result[0];
    const timestamps = result.timestamp || [];
    const ohlc = result.indicators.quote[0];
    return timestamps.slice(-count).map((t, i) => ({
      time: new Date(t * 1000).toISOString(),
      open: ohlc.open[i],
      high: ohlc.high[i],
      low: ohlc.low[i],
      close: ohlc.close[i],
      volume: ohlc.volume[i] || 0,
      dataSource: 'YahooFinance',
    }));
  } catch (err) {
    console.error(`[YahooFinance ERROR] ${symbol}:`, err.response?.data || err.message);
    return [];
  }
} 