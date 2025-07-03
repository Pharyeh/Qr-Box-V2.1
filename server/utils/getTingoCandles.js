import fetch from 'node-fetch';

// Log the API key once at file load for debugging (do not log on every call)
console.log('[Tingo] API key loaded:', process.env.TINGO_API_KEY);

const BASE_URL = 'https://api.tiingo.com/tiingo/daily';

/**
 * Fetch daily candles from Tingo for a given symbol.
 * @param {string} symbol - The asset symbol (e.g., 'EURUSD', 'BTCUSD').
 * @param {number} count - Number of daily candles to fetch.
 * @returns {Promise<Array>} Array of candle objects [{open, high, low, close, date}]
 */
export async function getTingoCandles(symbol, count = 250) {
  const TINGO_API_KEY = process.env.TINGO_API_KEY;
  if (!TINGO_API_KEY) throw new Error('TINGO_API_KEY not set in environment');
  // Map symbol to Tingo format if needed (user may need to adjust this)
  const tingoSymbol = symbol.toLowerCase();
  const url = `${BASE_URL}/${tingoSymbol}/prices?token=${TINGO_API_KEY}&resampleFreq=daily&limit=${count}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Tingo API error: ${res.status}`);
  const data = await res.json();
  // Map to standard candle format
  return data.map(c => ({
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
    date: c.date
  }));
} 