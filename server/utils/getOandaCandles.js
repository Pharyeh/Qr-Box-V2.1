import axios from 'axios';
import { SYMBOL_MAP } from './symbolMapping.js';
import { getYahooCandles } from './getYahooCandles.js';

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
  

/**
 * Fetch candles from OANDA REST API or Alpha Vantage
 * @param {string} symbol - e.g. 'EURUSD', 'XAUUSD', 'SPX500USD'
 * @param {string} granularity - e.g. 'M5', 'H1', 'D'
 * @param {number} count - number of candles to fetch
 * @returns {Promise<Array>} Array of candle objects [{ time, open, high, low, close, volume }]
 */
export async function getOandaCandles(symbol, granularity = 'M5', count = 100) {
  const symbolInfo = SYMBOL_MAP[symbol];
  if (!symbolInfo?.oanda) {
    // Not supported by OANDA, use Yahoo Finance
    return await getYahooCandles(symbol, count);
  }

  const OANDA_API_KEY = process.env.OANDA_API_KEY;
  const OANDA_ACCOUNT_ID = process.env.OANDA_ACCOUNT_ID;
  const OANDA_BASE_URL = process.env.OANDA_BASE_URL || 'https://api-fxtrade.oanda.com/v3';
  const OANDA_API_URL = OANDA_BASE_URL;

  if (!OANDA_API_KEY || !OANDA_ACCOUNT_ID) {
    throw new Error('OANDA API credentials not set in environment variables');
  }
  const instrument = symbolInfo.oanda || OANDA_SYMBOL_MAP[symbol] || symbol;
  if (!instrument || !instrument.includes('_')) {
    console.error(`[OANDA ERROR] ${symbol}: Invalid value specified for 'instrument' (${instrument})`);
    return [];
  }
  const oandaGranularity = GRANULARITY_MAP[granularity] || granularity;
  const url = `${OANDA_API_URL}/instruments/${instrument}/candles`;
  try {
    const res = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${OANDA_API_KEY}` },
      params: {
        granularity: oandaGranularity,
        count,
        price: 'M',
      },
    });
    if (!res.data.candles || res.data.candles.length === 0) {
      return [];
    }
    return res.data.candles.filter(c => c.complete).map(c => ({
      time: c.time,
      open: parseFloat(c.mid.o),
      high: parseFloat(c.mid.h),
      low: parseFloat(c.mid.l),
      close: parseFloat(c.mid.c),
      volume: c.volume,
      dataSource: 'OANDA',
    }));
  } catch (err) {
    console.error(`[OANDA ERROR] ${symbol}:`, err.response?.data || err.message);
    return [];
  }
} 