import axios from 'axios';
import { SYMBOL_MAP } from './symbolMapping.js';

/**
 * Fetch candles from Yahoo Finance
 * @param {string} symbol - e.g. 'AAPL', 'MSFT', 'EURUSD', etc.
 * @param {number} count - number of candles to fetch
 * @returns {Promise<Array>} Array of candle objects [{ time, open, high, low, close, volume }]
 */
export async function getYahooCandles(symbol, count = 100) {
  const symbolInfo = SYMBOL_MAP[symbol];
  const yahooSymbol = symbolInfo?.yahoo;
  if (!yahooSymbol) throw new Error(`No Yahoo symbol for ${symbol}`);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`;
  try {
    const res = await axios.get(url, { params: { interval: '1d', range: '2y' } });
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