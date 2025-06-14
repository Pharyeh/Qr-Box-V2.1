import { SYMBOL_MAP } from '../utils/symbolMapping.js';
import { getYahooCandles } from '../utils/getYahooCandles.js';
import { getOandaCandles } from '../utils/getOandaCandles.js';
import { getPhaseInfo, updatePhaseInfo } from '../utils/phaseHistory.js';
import { detectDarvasBoxes } from '../utils/darvasBox.js';
import cotData from '../utils/cot-latest.json' assert { type: 'json' };

function calculateATR(candles, period = 14) {
  const trs = candles.slice(1).map((c, i) => {
    const prev = candles[i];
    return Math.max(
      c.high - c.low,
      Math.abs(c.high - prev.close),
      Math.abs(c.low - prev.close)
    );
  });
  return trs.slice(-period).reduce((a, b) => a + b, 0) / period;
}

function calculateStructureScore(candles) {
  const range = Math.max(...candles.map(c => c.high)) - Math.min(...candles.map(c => c.low));
  const avgBody = candles.reduce((sum, c) => sum + Math.abs(c.close - c.open), 0) / candles.length;
  return range > 0 ? +(avgBody / range).toFixed(3) : 0;
}

function calculateVolatilityScore(candles) {
  const closes = candles.map(c => c.close);
  const mean = closes.reduce((a, b) => a + b, 0) / closes.length;
  const variance = closes.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / closes.length;
  return +(Math.sqrt(variance) / mean).toFixed(4);
}

function calculateReflex(candles) {
  const latest = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  return +((latest.close - prev.close) / prev.close).toFixed(3);
}

function determinePhase(isBreakout, baseLow, baseHigh, close, atr) {
  if (isBreakout) return 'Phase 2';
  if (close < baseLow - 0.0 * atr) return 'Phase 4';
  if (close > baseLow + 0.3 * (baseHigh - baseLow)) return 'Phase 3';
  return 'Phase 1';
}

function classifyBias(phase, reflex) {
  if (phase === 'Phase 2' || phase === 'Phase 3') {
    return reflex >= 0 ? 'Bullish' : 'Bearish';
  } else if (phase === 'Phase 4') {
    return reflex < 0 ? 'Bearish' : 'Bullish';
  }
  return 'Neutral';
}

export async function scanPhaseMonitor(req, res, returnRaw = false) {
  const results = [];
  const now = new Date();

  for (const symbol of Object.keys(SYMBOL_MAP)) {
    const meta = SYMBOL_MAP[symbol];
    const oandaData = await getOandaCandles(symbol, 'H1', 24);
    let candles = oandaData;
    let dataSource = 'OANDA';
    if (!oandaData || oandaData.length === 0) {
      candles = await getYahooCandles(symbol, '1h');
      dataSource = 'YahooFinance';
    } else if (oandaData[0]?.dataSource) {
      dataSource = oandaData[0].dataSource;
    }

    if (!candles || candles.length < 20) continue;

    const baseCandles = candles.slice(-21, -1);
    const recent = candles[candles.length - 1];
    const baseHigh = Math.max(...baseCandles.map(c => c.high));
    const baseLow = Math.min(...baseCandles.map(c => c.low));

    const atr = calculateATR(baseCandles);
    const structure = calculateStructureScore(baseCandles);
    const reflex = calculateReflex(candles);
    const volatility = calculateVolatilityScore(baseCandles);

    const darvasBoxes = detectDarvasBoxes(candles, { symbol, assetClass: meta.assetClass });
    const lastBox = darvasBoxes?.[0];
    const isBreakout = lastBox?.isFreshBreakout && lastBox?.direction === 1;

    const phase = determinePhase(isBreakout, baseLow, baseHigh, recent.close, atr);
    const bias = classifyBias(phase, reflex);

    const previous = getPhaseInfo(symbol);
    const lastPhase = previous?.phase;
    const lastTimestamp = new Date(previous?.timestamp || 0);
    const durationHours = Math.floor((now - lastTimestamp) / (1000 * 60 * 60));
    const isNew = phase === 'Phase 2' && lastPhase !== 'Phase 2';

    // COT
    const cotKey = meta.cotKey;
    const cotEntry = cotData[cotKey];
    let cotBias = ' Neutral';
    let cotScore = 0;
    if (cotEntry && cotEntry.netNonComm !== undefined && cotEntry.openInterest) {
      cotScore = cotEntry.netNonComm / cotEntry.openInterest;
    } else if (cotEntry?.netNonComm !== undefined) {
      cotScore = cotEntry.netNonComm / 1_000_000;
    }
    if (cotScore >= 0.5) cotBias = ' Strong Bullish';
    else if (cotScore > 0.1) cotBias = ' Bullish';
    else if (cotScore < -0.5) cotBias = ' Strong Bearish';
    else if (cotScore < -0.1) cotBias = ' Bearish';
    else if (!cotEntry) cotBias = 'No COT';

    // Entry, Stop, Target
    const currentPrice = recent.close;
    const entry = phase === 'Phase 2' && lastBox?.top ? lastBox.top : currentPrice;
    const stop = (entry - atr).toFixed(5);
    const tp1 = (entry + atr).toFixed(5);
    const tp2 = (entry + 2 * atr).toFixed(5);

    const levels = {
      entry: entry ? entry.toString() : 'N/A',
      stop: stop ? stop.toString() : 'N/A',
      tp1,
      tp2
    };

    const result = {
      symbol,
      phase,
      bias,
      reflex,
      volatility,
      structure,
      isNew,
      durationInPhase: `${durationHours}h`,
      source: dataSource,
      cotBias,
      cotScore: +cotScore.toFixed(2),
      assetClass: meta.assetClass || 'Unclassified',
      levels,
    };

    updatePhaseInfo(symbol, phase);
    results.push(result);
  }

  if (returnRaw) return results;
  res.json(results);
}
