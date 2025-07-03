import axios from 'axios';
import { SYMBOL_MAP } from './symbolMapping.js';
import { getYahooCandles } from './getYahooCandles.js';
// import { getTradovateCandles } from './getTradovateCandles.js';
import Bottleneck from 'bottleneck';

// Map TradingView/Yahoo granularities to OANDA granularities
const GRANULARITY_MAP = {
  '1m': 'M1',
  '5m': 'M5',
  '15m': 'M15',
  '30m': 'M30',
  '1h': 'H1',
  '4h': 'H4',
  '1d': 'D',
  '1w': 'W',
  '1M': 'M'
};

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

// Map TradingView/OANDA symbols to OANDA instrument names
const OANDA_SYMBOL_MAP = {
    // FX majors
    EURUSD: 'EUR_USD',
    GBPUSD: 'GBP_USD',
    USDJPY: 'USD_JPY',
    AUDUSD: 'AUD_USD',
    NZDUSD: 'NZD_USD',
    USDCAD: 'USD_CAD',
    USDCHF: 'USD_CHF',
    // Precious metals
    XAUUSD: 'XAU_USD',
    XAGUSD: 'XAG_USD',
    // Energy futures CFDs
    WTICOUSD: 'WTICO_USD', // West Texas Oil CFD
    BCOUSD: 'BCO_USD',     // Brent Crude Oil CFD
    // Equity index CFDs
    SPX500USD: 'SPX500_USD', 
    NAS100USD: 'NAS100_USD',
    US30USD: 'US30_USD',
    US2000USD: 'US2000_USD',
    // Other commodities
    NATGASUSD: 'NATGAS_USD', 
    COPPERUSD: 'COPPER_USD',
    PLATINUMUSD: 'PLATINUM_USD',
    PALLADIUMUSD: 'PALLADIUM_USD',
    CORNUSD: 'CORN_USD',
    WHEATUSD: 'WHEAT_USD',
    SOYBEANUSD: 'SOYBEAN_USD',
    COFFEEUSD: 'COFFEE_USD',
    COCOAUSD: 'COCOA_USD',
    SUGARUSD: 'SUGAR_USD',
    COTTONUSD: 'COTTON_USD',
    OJUICEUSD: 'OJUICE_USD',
    // Crypto CFDs
    BTCUSD: 'BTC_USD', 
    ETHUSD: 'ETH_USD',
    LTCUSD: 'LTC_USD',
    BCHUSD: 'BCH_USD',
    XRPUSD: 'XRP_USD',
    // Interest Rates
    USB10YUSD: 'USB10Y_USD',
    USB30YUSD: 'USB30Y_USD',
    USB05YUSD: 'USB05Y_USD',
};
  
// --- In-memory cache for OANDA candles ---
const oandaCache = new Map();
const cacheMinutes = parseInt(process.env.OANDA_CACHE_MINUTES, 10) || 10;
function getOandaCacheKey(symbol, granularity, count) {
  return JSON.stringify({ symbol, granularity, count });
}
function getFromOandaCache(key) {
  const entry = oandaCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > cacheMinutes * 60 * 1000) {
    oandaCache.delete(key);
    return null;
  }
  return entry.data;
}
function setOandaCache(key, data) {
  oandaCache.set(key, { data, ts: Date.now() });
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
 * Fetch candles from OANDA REST API or Alpha Vantage
 * @param {string} symbol - e.g. 'EURUSD', 'XAUUSD', 'SPX500USD'
 * @param {string} granularity - e.g. 'M5', 'H1', 'D'
 * @param {number} count - number of candles to fetch
 * @returns {Promise<Array>} Array of candle objects [{ time, open, high, low, close, volume }]
 */
export async function getOandaCandles(symbol, granularity = 'M5', count =100) {
  const cacheKey = getOandaCacheKey(symbol, granularity, count);
  const cached = getFromOandaCache(cacheKey);
  if (cached) {
    console.log(`[OANDA Cache] Cache hit for ${symbol} (${granularity}, ${count})`);
    return cached;
  } else {
    console.log(`[OANDA Cache] Cache miss for ${symbol} (${granularity}, ${count})`);
  }
  const symbolInfo = SYMBOL_MAP[symbol];
  // BYPASS TRADOVATE: Only use OANDA or Yahoo
  if (!symbolInfo?.oanda) {
    // Not supported by OANDA, do not attempt Yahoo fallback for non-stocks
    console.warn(`[OANDA] ${symbol}: Not supported by OANDA, returning null (no Yahoo fallback)`);
    return null;
  }

  const OANDA_API_KEY = process.env.OANDA_API_KEY;
  const OANDA_ACCOUNT_ID = process.env.OANDA_ACCOUNT_ID;
  const OANDA_BASE_URL = process.env.OANDA_BASE_URL || 'https://api-fxtrade.oanda.com/v3';
  const OANDA_API_URL = OANDA_BASE_URL;

  if (!OANDA_API_KEY || !OANDA_ACCOUNT_ID) {
    throw new Error('OANDA API credentials not set in environment variables');
  }
  const instrument = symbolInfo.oanda || symbol;
  if (!instrument || !instrument.includes('_')) {
    console.error(`[OANDA ERROR] ${symbol}: Invalid value specified for 'instrument' (${instrument})`);
    return [];
  }
  const oandaGranularity = GRANULARITY_MAP[granularity] || granularity;
  const url = `${OANDA_API_URL}/instruments/${instrument}/candles`;
  try {
    console.log(`[OANDA] Fetching ${count} candles for ${symbol} (${instrument}) at ${oandaGranularity}`);
    const res = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${OANDA_API_KEY}` },
      params: {
        granularity: oandaGranularity,
        count,
        price: 'M',
      },
    });
    if (!res.data.candles || res.data.candles.length === 0) {
      console.warn(`[OANDA] ${symbol}: No candles returned`);
      return [];
    }
    const candles = res.data.candles.filter(c => c.complete).map(c => ({
      time: c.time,
      open: parseFloat(c.mid.o),
      high: parseFloat(c.mid.h),
      low: parseFloat(c.mid.l),
      close: parseFloat(c.mid.c),
      volume: c.volume,
      dataSource: 'OANDA',
    }));
    console.log(`[OANDA] ${symbol}: Fetched ${candles.length} candles`);
    setOandaCache(cacheKey, candles);
    return candles;
  } catch (err) {
    console.error(`[OANDA ERROR] ${symbol}:`, err.response?.data || err.message);
    return [];
  }
}

export const getOandaCandlesThrottled = limiter.wrap((...args) => safeRequest(getOandaCandles, args));

/**
 * Fetch candles from OANDA in chunks to bypass the 5000 candle limit.
 * @param {string} symbol
 * @param {string} granularity
 * @param {number} count
 * @returns {Promise<Array>} Array of candle objects
 */
export async function getOandaCandlesChunked(symbol, granularity = 'D', count = 100) {
  const MAX_PER_REQUEST = 5000;
  let allCandles = [];
  let remaining = count;
  let to = undefined;
  while (remaining > 0) {
    const thisCount = Math.min(remaining, MAX_PER_REQUEST);
    const params = [symbol, granularity, thisCount];
    // If we have a 'to' date, fetch up to that date (exclusive)
    if (to) params.push({ to });
    let candles = await getOandaCandles(symbol, granularity, thisCount);
    if (!candles || candles.length === 0) break;
    // If fetching backwards, sort oldest to newest
    candles = candles.sort((a, b) => new Date(a.time) - new Date(b.time));
    // Remove overlap if any
    if (allCandles.length && candles[0].time === allCandles[allCandles.length - 1].time) {
      candles.shift();
    }
    allCandles = allCandles.concat(candles);
    remaining -= candles.length;
    if (candles.length < thisCount) break; // No more data
    to = candles[0].time; // Next chunk: fetch up to the earliest candle
  }
  return allCandles.slice(-count);
} 