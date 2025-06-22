// server/controllers/rangebreakout.js
import { SYMBOL_MAP } from '../utils/symbolMapping.js';
import { getOandaCandles } from '../utils/getOandaCandles.js';
import { getYahooCandles } from '../utils/getYahooCandles.js';
import cotData from '../utils/cot-latest.json' assert { type: 'json' };

function calcScore({ reflex, structure, volatility, cotScore }) {
  return +(reflex * 100 + structure * 50 - volatility * 30 + cotScore).toFixed(1);
}

function gradeScore(score) {
  if (score > 90) return 'A+';
  if (score > 80) return 'A';
  if (score > 70) return 'B';
  if (score > 60) return 'C';
  return 'D';
}

function extractZone(candles, width = 0.10) {
  const high = Math.max(...candles.map(c => c.high));
  const low = Math.min(...candles.map(c => c.low));
  const range = high - low;
  return {
    top: high,
    bottom: high - range * width,
    btop: low + range * width,
    bbot: low,
  };
}

function isInsideZone(price, top, bottom) {
  return price <= top && price >= bottom;
}

async function analyzeDualZone(symbol, candles, meta, priceSource, priceSymbol) {
  const macroLookback = 60;
  const microLookback = 30;
  const zoneWidth = 0.10;
  if (!candles || candles.length < macroLookback + 1) return null;
  const lastClose = candles.at(-1).close;
  const macroCandles = candles.slice(-macroLookback);
  const microCandles = candles.slice(-microLookback);
  const macroZone = extractZone(macroCandles, zoneWidth);
  const microZone = extractZone(microCandles, zoneWidth);
  const inMacroZoneA = isInsideZone(lastClose, macroZone.top, macroZone.bottom);
  const inMicroZoneA = isInsideZone(lastClose, microZone.top, microZone.bottom);
  const breakoutMicroUp = lastClose > microZone.top * 1.0005;
  const structure = +(Math.abs(macroZone.top - macroZone.bbot) / lastClose).toFixed(3);
  const reflex = +(lastClose - candles.at(-2).close) / candles.at(-2).close;
  const volatility = +(Math.sqrt(microCandles.reduce((sum, c) => sum + Math.pow(c.close - lastClose, 2), 0) / microCandles.length) / lastClose).toFixed(4);
  const cotKey = meta.cotKey;
  const cotEntry = cotData[cotKey];
  const cotBias = cotEntry?.cotSentiment || 'Neutral';
  const cotScore = typeof cotEntry?.cotScore === 'number' ? cotEntry.cotScore : 0;
  const score = calcScore({ reflex, structure, volatility, cotScore });
  const grade = gradeScore(score);
  let tag = 'Inside Base';
  if (inMacroZoneA && breakoutMicroUp) tag = '🟢 Breakout From Macro Base';
  else if (inMicroZoneA) tag = '🟡 Micro Compression';
  else if (!inMacroZoneA && breakoutMicroUp) tag = '🔵 Extended Breakout';
  // --- Directional Bias ---
  // Bullish: Breakout Up or positive reflex, Bearish: negative reflex, Neutral: otherwise
  let directionalBias = 'Neutral';
  if (tag.includes('Breakout') || reflex > 0) directionalBias = 'Bullish';
  else if (reflex < 0) directionalBias = 'Bearish';
  return {
    symbol,
    lastClose,
    entryPrice: lastClose,
    reflex: +reflex.toFixed(3),
    structure,
    volatility,
    cotBias,
    cotScore,
    macroZone,
    microZone,
    inMacroZoneA,
    inMicroZoneA,
    breakoutMicroUp,
    tag,
    score,
    grade,
    directionalBias, // Well-defined: Bullish, Bearish, or Neutral
    assetClass: meta.assetClass || 'Unclassified',
    priceSource,
    priceSymbol,
  };
}

export async function getDualZoneBreakouts(req, res) {
  const results = [];
  for (const symbol of Object.keys(SYMBOL_MAP)) {
    const meta = SYMBOL_MAP[symbol];
    let result = null;
    // Try OANDA first
    try {
      const oandaCandles = await getOandaCandles(symbol, 'D', 62);
      let source = 'OANDA';
      let priceSymbol = meta.oanda || symbol;
      if (oandaCandles[0]?.dataSource === 'YahooFinance') {
        source = 'YahooFinance';
        priceSymbol = meta.yahoo || symbol;
      }
      result = await analyzeDualZone(symbol, oandaCandles, meta, source, priceSymbol);
    } catch (e) { /* skip OANDA if error */ }
    // If OANDA failed, try Yahoo
    if (!result) {
      try {
        const yahooCandles = await getYahooCandles(symbol, 62, '1d');
        result = await analyzeDualZone(symbol, yahooCandles, meta, 'YahooFinance', meta.yahoo || symbol);
      } catch (e) { /* skip Yahoo if error */ }
    }
    if (result) results.push(result);
  }
  res.json(results);
}
