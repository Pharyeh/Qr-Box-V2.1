import axios from 'axios';
import { SYMBOL_MAP } from './symbolMapping.js';
import Bottleneck from 'bottleneck';

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

// --- In-memory cache for Yahoo candles ---
const yahooCache = new Map();
const cacheMinutes = parseInt(process.env.YAHOO_CACHE_MINUTES, 10) || 10;
function getYahooCacheKey(symbol, count, interval) {
  return JSON.stringify({ symbol, count, interval });
}
function getFromYahooCache(key) {
  const entry = yahooCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > cacheMinutes * 60 * 1000) {
    yahooCache.delete(key);
    return null;
  }
  return entry.data;
}
function setYahooCache(key, data) {
  yahooCache.set(key, { data, ts: Date.now() });
}

const limiter = new Bottleneck({ minTime: 300, maxConcurrent: 1 });

async function safeRequest(fetchFn, args) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetchFn(...args);
    } catch (err) {
      if (err.response?.status === 429) {
        const waitTime = err.response.headers['retry-after']
          ? parseInt(err.response.headers['retry-after'], 10) * 1000
          : 2000 * (attempt + 1);
        console.warn(`429 received. Retrying in ${waitTime}ms...`);
        await new Promise(res => setTimeout(res, waitTime));
      } else {
        throw err;
      }
    }
  }
  throw new Error('Max retries exceeded.');
}

/**
 * Fetch candles from Yahoo Finance
 * @param {string} symbol - e.g. 'AAPL', 'MSFT', 'EURUSD', etc.
 * @param {number} count - number of candles to fetch
 * @param {string} interval - timeframe/granularity (e.g., '1d', 'H1', 'H4')
 * @returns {Promise<Array>} Array of candle objects [{ time, open, high, low, close, volume }]
 */
export async function getYahooCandles(symbol, count = 100, interval = '1d') {
  const cacheKey = getYahooCacheKey(symbol, count, interval);
  const cached = getFromYahooCache(cacheKey);
  if (cached) {
    console.log(`[Yahoo Cache] Cache hit for ${symbol} (${interval}, ${count})`);
    return cached;
  } else {
    console.log(`[Yahoo Cache] Cache miss for ${symbol} (${interval}, ${count})`);
  }
  const symbolInfo = SYMBOL_MAP[symbol];
  const yahooSymbol = symbolInfo?.yahoo;
  if (!yahooSymbol) {
    console.warn(`[YahooFinance WARNING] No Yahoo symbol for ${symbol}`);
    return null;
  }
  const yahooInterval = YAHOO_INTERVAL_MAP[interval] || interval || '1d';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`;
  try {
    const res = await axios.get(url, { params: { interval: yahooInterval, range: '2y' } });
    const result = res.data.chart.result[0];
    const timestamps = result.timestamp || [];
    const ohlc = result.indicators.quote[0];
    const candles = timestamps.slice(-count).map((t, i) => ({
      time: new Date(t * 1000).toISOString(),
      open: ohlc.open[i],
      high: ohlc.high[i],
      low: ohlc.low[i],
      close: ohlc.close[i],
      volume: ohlc.volume[i] || 0,
      dataSource: 'YahooFinance',
    }));
    setYahooCache(cacheKey, candles);
    return candles;
  } catch (err) {
    console.error(`[YahooFinance ERROR] ${symbol}:`, err.response?.data || err.message);
    return [];
  }
}

export const getYahooCandlesThrottled = limiter.wrap((...args) => safeRequest(getYahooCandles, args)); 